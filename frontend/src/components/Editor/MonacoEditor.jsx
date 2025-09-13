// src/components/Editor/MonacoEditor.jsx
import React, { useRef, useEffect, useState, useCallback } from "react";
import Editor from '@monaco-editor/react';
import { useSocket } from '../../context/SocketContext';
import { useAuth } from '../../context/AuthContext';

const MonacoEditor = ({ value, language = "javascript", theme = "vs-dark", onChange }) => {
  const editorRef = useRef(null);
  const [isApplyingRemoteChange, setIsApplyingRemoteChange] = useState(false);
  const [isUserTyping, setIsUserTyping] = useState(false);
  const lastChangeTimeRef = useRef(0);
  const lastCursorPositionRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const sessionIdRef = useRef(Math.random().toString(36).substr(2, 9)); // Unique session ID
  
  
  const { socket, connected, sendDocumentOperation, requestDocumentSnapshot, latestOperations } = useSocket();
  const { user } = useAuth();

  // Improved debounced change handler
  const debouncedSendOperation = useCallback((newValue) => {
    const now = Date.now();
    lastChangeTimeRef.current = now;

    // Use shorter debounce for better responsiveness
    setTimeout(() => {
      if (now === lastChangeTimeRef.current && !isApplyingRemoteChange) {
        const operation = {
          type: 'content_change',
          content: newValue,
          timestamp: now,
          userId: user?._id || user?.id,
          sessionId: sessionIdRef.current // Add session ID to prevent same-user conflicts
        };

        sendDocumentOperation([operation]);
      }
    }, 500); // Increased to 500ms for better stability
  }, [sendDocumentOperation, user, isApplyingRemoteChange]);

  // Handle editor changes
  const handleEditorChange = (newValue) => {
    if (isApplyingRemoteChange) {
      return;
    }

    // Set typing state
    setIsUserTyping(true);
    
    // Clear previous typing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    // Set timeout to clear typing state (increased for better protection)
    typingTimeoutRef.current = setTimeout(() => {
      setIsUserTyping(false);
    }, 1000); // Increased from 500ms to 1000ms

    // Store cursor position
    if (editorRef.current) {
      lastCursorPositionRef.current = editorRef.current.getPosition();
    }

    // Send operation with debouncing
    debouncedSendOperation(newValue);

    // Call parent onChange
    onChange?.(newValue);
  };

  // Handle cursor position changes
  const handleCursorPositionChange = (e) => {
    if (connected && socket && !isApplyingRemoteChange) {
      lastCursorPositionRef.current = e.position;
      // Cursor updates will be implemented later
    }
  };

  // Handle editor mount
  const handleEditorDidMount = (editor, monaco) => {
    editorRef.current = editor;

    // Configure editor options
    editor.updateOptions({
      fontSize: 14,
      minimap: { enabled: false },
      automaticLayout: true,
      quickSuggestions: true,
      suggestOnTriggerCharacters: true,
      acceptSuggestionOnEnter: "on",
      tabCompletion: "on",
      wordBasedSuggestions: "on",
      parameterHints: { enabled: true },
      hover: { enabled: true },
      folding: true,
      foldingStrategy: "indentation",
      showFoldingControls: "always",
      semanticHighlighting: { enabled: true },
      bracketPairColorization: { enabled: true },
      guides: {
        bracketPairs: true,
        indentation: true
      }
    });

    // Add cursor position change listener
    editor.onDidChangeCursorPosition(handleCursorPositionChange);

    // Request document snapshot when editor mounts
    if (connected) {
      requestDocumentSnapshot();
    }
  };

  // Handle document snapshot
  const handleDocumentSnapshot = useCallback((data) => {
    console.log("📸 Received document snapshot:", data);
    
    if (data.content && editorRef.current && !isUserTyping) {
      try {
        setIsApplyingRemoteChange(true);
        
        // Only update if content is different
        const currentContent = editorRef.current.getValue();
        if (currentContent !== data.content) {
          console.log("📸 Applying document snapshot");
          editorRef.current.setValue(data.content);
        }
      } catch (error) {
        console.error("❌ Error applying document snapshot:", error);
      } finally {
        setIsApplyingRemoteChange(false);
      }
    }
  }, [isUserTyping]);

  // Apply remote changes with typing protection
  const applyRemoteChange = useCallback((operation, fromUserId, fromSessionId) => {
    if (!editorRef.current || isApplyingRemoteChange) return;

    // Don't apply changes from same user AND same session
    if (fromUserId === (user?._id || user?.id) && fromSessionId === sessionIdRef.current) {
      return;
    }

    // CRITICAL: Don't apply remote changes while user is actively typing
    if (isUserTyping) {
      console.log("🚫 Blocking remote change - user is typing");
      return;
    }

    // Additional protection: Check if user typed recently (within last 2 seconds)
    const timeSinceLastTyping = Date.now() - lastChangeTimeRef.current;
    if (timeSinceLastTyping < 2000) {
      console.log("🚫 Blocking remote change - recent typing activity");
      return;
    }

    try {
      setIsApplyingRemoteChange(true);
      
      // Store current cursor position
      const currentPosition = editorRef.current.getPosition();
      const currentContent = editorRef.current.getValue();
      const newContent = operation.content;
      
      // Only apply if content is actually different and significantly different
      if (currentContent !== newContent) {
        const contentLengthDiff = Math.abs(newContent.length - currentContent.length);
        const isSignificantChange = contentLengthDiff > 3 || 
                                   newContent.length < currentContent.length * 0.9 ||
                                   newContent.length > currentContent.length * 1.1;
        
        if (isSignificantChange) {
          console.log("✅ Applying significant remote change");
          
          // Use setValue for significant changes (more reliable)
          editorRef.current.setValue(newContent);
          
          // Restore cursor position
          if (currentPosition) {
            const model = editorRef.current.getModel();
            const lineCount = model.getLineCount();
            const lineNumber = Math.min(currentPosition.lineNumber, lineCount);
            const column = Math.min(currentPosition.column, model.getLineMaxColumn(lineNumber));
            
            editorRef.current.setPosition({ lineNumber, column });
          }
        } else {
          console.log("🚫 Ignoring minor remote change to prevent conflicts");
        }
      }
      
    } catch (error) {
      console.error("❌ Error applying remote change:", error);
    } finally {
      setIsApplyingRemoteChange(false);
    }
  }, [user, isApplyingRemoteChange, isUserTyping]);

  // Single effect to handle all remote operations
  useEffect(() => {
    if (!latestOperations || !latestOperations.operations?.length) return;
    
    const operation = latestOperations.operations[0];
    if (operation.type === 'content_change') {
      applyRemoteChange(operation, latestOperations.userId, latestOperations.sessionId);
    }
  }, [latestOperations, applyRemoteChange]);

  // Listen for document snapshots
  useEffect(() => {
    if (!socket) return;

    const handleSnapshot = (data) => {
      handleDocumentSnapshot(data);
    };

    socket.on('doc:snapshot', handleSnapshot);

    return () => {
      socket.off('doc:snapshot', handleSnapshot);
    };
  }, [socket, handleDocumentSnapshot]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  // Show connection status
  const getConnectionStatus = () => {
    if (!connected) {
      return <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded text-xs">Disconnected</div>;
    }
    return <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded text-xs">Connected</div>;
  };

  return (
    <div className="h-full w-full border rounded-lg relative">
      {getConnectionStatus()}
      <Editor
        height="100%"
        language={language}
        theme={theme}
        value={value || ''}
        onChange={handleEditorChange}
        onMount={handleEditorDidMount}
        options={{
          fontSize: 14,
          minimap: { enabled: false },
          automaticLayout: true,
          quickSuggestions: true,
          suggestOnTriggerCharacters: true,
          acceptSuggestionOnEnter: "on",
          tabCompletion: "on",
          wordBasedSuggestions: "on",
          parameterHints: { enabled: true },
          hover: { enabled: true },
          folding: true,
          foldingStrategy: "indentation",
          showFoldingControls: "always",
          semanticHighlighting: { enabled: true },
          bracketPairColorization: { enabled: true },
          guides: {
            bracketPairs: true,
            indentation: true
          }
        }}
      />
    </div>
  );
};

export default MonacoEditor;
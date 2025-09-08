// src/components/Editor/MonacoEditor.jsx
import React from "react";
import Editor from '@monaco-editor/react';

const MonacoEditor = ({ value, language = "javascript", theme = "vs-dark", onChange }) => {
  const handleEditorChange = (newValue) => {
    onChange?.(newValue);
  };

  const handleEditorDidMount = (editor, monaco) => {
    // Configure editor options for full features
    editor.updateOptions({
      fontSize: 14,
      minimap: { enabled: false },
      automaticLayout: true,
      // Enable all language features
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
      // Enable language services
      semanticHighlighting: { enabled: true },
      bracketPairColorization: { enabled: true },
      guides: {
        bracketPairs: true,
        indentation: true
      }
    });
  };

  return (
    <div className="h-full w-full border rounded-lg">
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
          // Enable all language features
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
          // Enable language services
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

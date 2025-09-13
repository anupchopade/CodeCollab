import React, { createContext, useState, useEffect, useContext, useRef } from "react";
import { io } from "socket.io-client";
import { useAuth } from "./AuthContext";
import { useProject } from "./ProjectContext";

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const [activeUsers, setActiveUsers] = useState([]);
  const currentRoomRef = useRef(null);
  const [latestOperations, setLatestOperations] = useState(null);

  const { user } = useAuth();
  const { currentProject, activeFile } = useProject();

  useEffect(() => {
    if (!user) return;

    // Create socket connection
    const newSocket = io("http://localhost:5000", {
      autoConnect: true,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
      auth: {
        token: localStorage.getItem('token'),
        userId: user._id || user.id
      }
    });

    setSocket(newSocket);

    newSocket.on("connect", () => {
      console.log("✅ Connected to socket server:", newSocket.id);
      setConnected(true);
    });

    newSocket.on("disconnect", () => {
      console.log("❌ Disconnected from socket server");
      setConnected(false);
      setActiveUsers([]);
      currentRoomRef.current = null;
    });

    // Document events
newSocket.on("user:joined", (data) => {
  console.log(" User joined:", data);
  setActiveUsers(prev => {
    // Remove any existing entry for this user in this file first
    const filtered = prev.filter(u => !(u.userId === data.userId && u.fileId === data.fileId));
    // Add the new entry
    return [...filtered, { 
      userId: data.userId, 
      fileId: data.fileId, 
      name: data.userName || data.name || 'User',
      joinedAt: Date.now() 
    }];
  });
});

    newSocket.on("user:left", (data) => {
      console.log(" User left:", data);
      setActiveUsers(prev => prev.filter(u => !(u.userId === data.userId && u.fileId === data.fileId)));
    });

    newSocket.on("doc:ops:received", (data) => {
      // Store the latest operations for Monaco Editor to consume
      setLatestOperations(data);
    });

    newSocket.on("doc:snapshot", (data) => {
      console.log("📸 Document snapshot received:", data);
      // This will be handled by Monaco Editor
    });

    // File creation event
    newSocket.on("file:created", (data) => {
      console.log("🔍 [DEBUG] File created event received:", data);
      console.log("🔍 [DEBUG] Dispatching custom fileCreated event");
      // Trigger file tree refresh
      window.dispatchEvent(new CustomEvent('fileCreated', { detail: data }));
      console.log("🔍 [DEBUG] Custom fileCreated event dispatched");
    });

    // File deletion event
    newSocket.on("file:deleted", (data) => {
      console.log("🗑️ File deleted:", data);
      // Trigger file tree refresh
      window.dispatchEvent(new CustomEvent('fileDeleted', { detail: data }));
    });

    newSocket.on("error", (error) => {
      console.error("❌ Socket error:", error);
    });

    return () => {
      newSocket.disconnect();
    };
  }, [user]);

  // Join document when active file changes
  // Join project room when project is loaded
  useEffect(() => {
    if (socket && connected && currentProject && user) {
      const projectRoomData = {
        projectId: currentProject._id || currentProject.id,
        fileId: 'project-room', // Special identifier for project room
        userId: user._id || user.id
      };

      console.log("🔍 [DEBUG] Joining project room:", projectRoomData);
      socket.emit("doc:join", projectRoomData);
    }
  }, [socket, connected, currentProject?._id, user?._id]);

  // Join document when project and file are available
  useEffect(() => {
    if (socket && connected && currentProject && activeFile && user) {
      const roomData = {
        projectId: currentProject._id || currentProject.id,
        fileId: activeFile._id || activeFile.id,
        userId: user._id || user.id
      };

      // Leave previous room if exists
      if (currentRoomRef.current) {
        socket.emit("doc:leave", currentRoomRef.current);
      }

      // Join new room
      socket.emit("doc:join", roomData);
      currentRoomRef.current = roomData;
      // Don't reset activeUsers here - let the user:joined events handle it
      console.log(" Joined document:", roomData);
    }
  }, [socket, connected, currentProject?._id, activeFile?._id, user?._id]); // Use IDs instead of objects

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (socket && currentRoomRef.current) {
        socket.emit("doc:leave", currentRoomRef.current);
      }
    };
  }, [socket]);

  // Socket methods
  const sendDocumentOperation = (operations) => {
    if (socket && connected && currentRoomRef.current) {
      const data = {
        ...currentRoomRef.current,
        operations,
        timestamp: Date.now()
      };
      socket.emit("doc:ops", data);
    }
  };

  const requestDocumentSnapshot = () => {
    if (socket && connected && currentRoomRef.current) {
      socket.emit("doc:requestSnapshot", {
        projectId: currentRoomRef.current.projectId,
        fileId: currentRoomRef.current.fileId
      });
    }
  };

  const sendCursorUpdate = (position, selection) => {
    if (socket && connected && currentRoomRef.current) {
      socket.emit("cursor:update", {
        ...currentRoomRef.current,
        position,
        selection,
        timestamp: Date.now()
      });
    }
  };

  const value = {
    socket,
    connected,
    activeUsers,
    latestOperations,
    sendDocumentOperation,
    requestDocumentSnapshot,
    sendCursorUpdate
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocket must be used within a SocketProvider");
  }
  return context;
};
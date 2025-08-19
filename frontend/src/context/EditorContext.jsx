import React, { createContext, useState, useContext } from "react";

const EditorContext = createContext();

export const EditorProvider = ({ children }) => {
  const [activeFile, setActiveFile] = useState(null);
  const [content, setContent] = useState("");
  const [cursorPosition, setCursorPosition] = useState({ line: 0, column: 0 });

  const openFile = (file) => {
    setActiveFile(file);
    setContent(file.content || "");
  };

  return (
    <EditorContext.Provider
      value={{ activeFile, content, setContent, cursorPosition, setCursorPosition, openFile }}
    >
      {children}
    </EditorContext.Provider>
  );
};

export const useEditor = () => useContext(EditorContext);

// src/components/Editor/MonacoEditor.jsx
import React, { useRef, useEffect } from "react";
import * as monaco from "monaco-editor";

const MonacoEditor = ({ value, language = "javascript", theme = "vs-dark", onChange }) => {
  const editorRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    if (containerRef.current) {
      editorRef.current = monaco.editor.create(containerRef.current, {
        value,
        language,
        theme,
        automaticLayout: true,
        minimap: { enabled: false },
        fontSize: 14,
      });

      editorRef.current.onDidChangeModelContent(() => {
        onChange?.(editorRef.current.getValue());
      });
    }

    return () => editorRef.current?.dispose();
  }, []);

  return <div ref={containerRef} className="h-full w-full border rounded-lg" />;
};

export default MonacoEditor;

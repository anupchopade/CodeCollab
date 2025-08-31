// src/components/Editor/MonacoEditor.jsx
import React from "react";
import Editor from "@monaco-editor/react";

const MonacoEditor = ({ value, language = "javascript", theme = "vs-dark", onChange, options = {} }) => {
  return (
    <Editor
      height="100%"
      defaultLanguage={language}
      theme={theme}
      value={value}
      onChange={onChange}
      options={{
        fontSize: 14,
        lineNumbers: 'on',
        minimap: { enabled: true },
        wordWrap: 'on',
        ...options
      }}
    />
  );
};

export default MonacoEditor;

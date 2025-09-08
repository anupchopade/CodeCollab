// src/components/Editor/EditorTabs.jsx
import React from "react";
import { X } from "lucide-react";

const EditorTabs = ({ openFiles = [], activeFile, onFileSelect, onFileClose }) => {
  // If no open files, don't render tabs
  if (!openFiles || openFiles.length === 0) {
    return null;
  }

  return (
    <div className="flex border-b bg-gray-100 dark:bg-gray-800">
      {openFiles.map((file) => (
        <div
          key={file._id}
          onClick={() => onFileSelect && onFileSelect(file)}
          className={`px-4 py-2 flex items-center cursor-pointer transition-colors ${
            activeFile && activeFile._id === file._id
              ? "bg-white dark:bg-gray-900 border-t-2 border-blue-500"
              : "hover:bg-gray-200 dark:hover:bg-gray-700"
          }`}
        >
          <span className="mr-2">{file.name || 'Untitled'}</span>
          <X
            size={16}
            className="cursor-pointer text-gray-500 hover:text-red-500"
            onClick={(e) => {
              e.stopPropagation();
              if (onFileClose) {
                onFileClose(file._id);
              }
            }}
          />
        </div>
      ))}
    </div>
  );
};

export default EditorTabs;

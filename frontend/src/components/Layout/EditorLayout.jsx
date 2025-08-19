import React from "react";
import Header from "./Header";

const EditorLayout = ({ sidebar, editor, preview }) => {
  return (
    <div className="flex flex-col h-screen w-full">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className="w-64 border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 overflow-y-auto">
          {sidebar}
        </div>

        {/* Editor */}
        <div className="flex-1 flex flex-col bg-gray-50 dark:bg-gray-900 overflow-hidden">
          {editor}
        </div>

        {/* Preview */}
        <div className="w-1/3 border-l border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 overflow-y-auto">
          {preview}
        </div>
      </div>
    </div>
  );
};

export default EditorLayout;

// src/components/Editor/EditorTabs.jsx
import React from "react";
import { X } from "lucide-react";

const EditorTabs = ({ tabs, activeTab, onSwitch, onClose }) => {
  return (
    <div className="flex border-b bg-gray-100 dark:bg-gray-800">
      {tabs.map((tab) => (
        <div
          key={tab.id}
          onClick={() => onSwitch(tab.id)}
          className={`px-4 py-2 flex items-center cursor-pointer transition-colors ${
            activeTab === tab.id
              ? "bg-white dark:bg-gray-900 border-t-2 border-blue-500"
              : "hover:bg-gray-200 dark:hover:bg-gray-700"
          }`}
        >
          <span className="mr-2">{tab.name}</span>
          <X
            size={16}
            className="cursor-pointer text-gray-500 hover:text-red-500"
            onClick={(e) => {
              e.stopPropagation();
              onClose(tab.id);
            }}
          />
        </div>
      ))}
    </div>
  );
};

export default EditorTabs;

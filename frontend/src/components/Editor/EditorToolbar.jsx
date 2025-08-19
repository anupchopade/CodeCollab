// src/components/Editor/EditorToolbar.jsx
import React from "react";
import { Save, Users, Cloud } from "lucide-react";
import Button from "../UI/Button";

const EditorToolbar = ({ onSave, status = "Saved", collaborators }) => {
  return (
    <div className="flex items-center justify-between p-2 border-b bg-gray-50 dark:bg-gray-900">
      <div className="flex items-center gap-2">
        <Button variant="primary" size="sm" onClick={onSave}>
          <Save size={16} className="mr-1" />
          Save
        </Button>
        <span className="text-sm text-gray-500">{status}</span>
      </div>

      <div className="flex items-center gap-3">
        <Users size={18} className="text-gray-500" />
        <span className="text-sm">{collaborators?.length || 0} active</span>
        <Cloud
          size={18}
          className={`${
            status === "Saved" ? "text-green-500" : "text-yellow-500"
          }`}
        />
      </div>
    </div>
  );
};

export default EditorToolbar;

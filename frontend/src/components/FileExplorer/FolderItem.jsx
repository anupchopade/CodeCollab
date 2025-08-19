import React from "react";
import { ChevronDown, ChevronRight, Folder } from "lucide-react";

const FolderItem = ({ name, isOpen, fileCount, onToggle, children }) => {
  return (
    <div className="pl-2">
      <div
        className="flex items-center gap-2 p-1 hover:bg-gray-100 rounded-md cursor-pointer"
        onClick={onToggle}
      >
        {isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        <Folder size={16} />
        <span>{name} ({fileCount})</span>
      </div>
      {isOpen && <div className="pl-4">{children}</div>}
    </div>
  );
};

export default FolderItem;

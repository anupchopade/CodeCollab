import React, { useState } from "react";
import { File, Edit, Trash } from "lucide-react";
import FileContextMenu from "./FileContextMenu";

const FileItem = ({ name }) => {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <div
      className="flex items-center justify-between p-1 pl-6 hover:bg-gray-100 rounded-md cursor-pointer relative"
      onContextMenu={(e) => {
        e.preventDefault();
        setShowMenu(true);
      }}
    >
      <div className="flex items-center gap-2">
        <File size={16} />
        <span>{name}</span>
      </div>

      {showMenu && (
        <FileContextMenu onClose={() => setShowMenu(false)} />
      )}
    </div>
  );
};

export default FileItem;

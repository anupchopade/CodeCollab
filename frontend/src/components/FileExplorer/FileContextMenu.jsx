import React from "react";

const FileContextMenu = ({ onClose }) => {
  return (
    <div className="absolute right-0 top-6 bg-white shadow-md border rounded-md w-32 z-50">
      <ul className="text-sm">
        <li className="px-3 py-2 hover:bg-gray-100 cursor-pointer">Rename</li>
        <li className="px-3 py-2 hover:bg-gray-100 cursor-pointer">Duplicate</li>
        <li className="px-3 py-2 text-red-600 hover:bg-gray-100 cursor-pointer">Delete</li>
      </ul>
    </div>
  );
};

export default FileContextMenu;

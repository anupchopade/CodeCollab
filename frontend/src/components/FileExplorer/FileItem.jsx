import React, { useEffect, useRef, useState } from "react";
import { File, Edit, Trash } from "lucide-react";
import FileContextMenu from "./FileContextMenu";

const FileItem = ({ file, isActive = false, onClick, onRename, onDelete, onDuplicate }) => {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    if (!showMenu) return;
    const close = (e) => {
      if (!menuRef.current) return;
      if (!menuRef.current.contains(e.target)) setShowMenu(false);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [showMenu]);

  const handleClick = () => {
    if (onClick) {
      onClick(file);
    }
  };

  return (
    <div
      className={`flex items-center justify-between p-1 pl-6 hover:bg-gray-100 rounded-md cursor-pointer relative ${
        isActive ? 'bg-blue-50 border-l-2 border-blue-500' : ''
      }`}
      onClick={handleClick}
      onContextMenu={(e) => {
        e.preventDefault();
        setShowMenu(true);
      }}
    >
      <div className="flex items-center gap-2">
        <File size={16} className={isActive ? 'text-blue-500' : 'text-gray-500'} />
        <span className={isActive ? 'text-blue-700 font-medium' : 'text-gray-700'}>
          {file?.name || 'Untitled'}
        </span>
      </div>

      {showMenu && (
        <div ref={menuRef}>
          <FileContextMenu 
            onClose={() => setShowMenu(false)}
            onRename={() => onRename && onRename(file)}
            onDuplicate={() => onDuplicate && onDuplicate(file)}
            onDelete={() => onDelete && onDelete(file)}
          />
        </div>
      )}
    </div>
  );
};

export default FileItem;

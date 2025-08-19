import React, { useState } from "react";
import FolderItem from "./FolderItem";
import FileItem from "./FileItem";

const FileTree = ({ structure }) => {
  const [expanded, setExpanded] = useState({});

  const toggleExpand = (path) => {
    setExpanded((prev) => ({ ...prev, [path]: !prev[path] }));
  };

  const renderTree = (node, path = "") => {
    return node.map((item, idx) => {
      const fullPath = `${path}/${item.name}`;
      if (item.type === "folder") {
        return (
          <FolderItem
            key={idx}
            name={item.name}
            isOpen={expanded[fullPath]}
            fileCount={item.children?.length || 0}
            onToggle={() => toggleExpand(fullPath)}
          >
            {expanded[fullPath] &&
              renderTree(item.children || [], fullPath)}
          </FolderItem>
        );
      }
      return <FileItem key={idx} name={item.name} />;
    });
  };

  return <div className="p-2">{renderTree(structure)}</div>;
};

export default FileTree;

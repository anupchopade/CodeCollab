// src/components/Editor/CursorOverlay.jsx
import React from "react";

const CursorOverlay = ({ cursors }) => {
  return (
    <div className="absolute inset-0 pointer-events-none">
      {cursors.map((cursor) => (
        <div
          key={cursor.id}
          className="absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-150"
          style={{ top: cursor.y, left: cursor.x }}
        >
          <div
            className="w-2 h-4 rounded-sm"
            style={{ backgroundColor: cursor.color }}
          />
          <span
            className="text-xs px-1 rounded"
            style={{ backgroundColor: cursor.color }}
          >
            {cursor.name}
          </span>
        </div>
      ))}
    </div>
  );
};

export default CursorOverlay;

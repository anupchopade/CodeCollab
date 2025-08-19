// src/components/Editor/CollaboratorList.jsx
import React from "react";

const CollaboratorList = ({ collaborators }) => {
  return (
    <div className="flex items-center gap-2 p-2 bg-gray-100 dark:bg-gray-800 rounded-md">
      {collaborators.map((user) => (
        <div key={user.id} className="flex items-center gap-1">
          <div
            className="w-6 h-6 rounded-full"
            style={{ backgroundColor: user.color }}
          />
          <span className="text-sm">{user.name}</span>
        </div>
      ))}
    </div>
  );
};

export default CollaboratorList;

// src/components/Editor/CollaboratorList.jsx
import React from "react";
import { useSocket } from '../../context/SocketContext';
import { useAuth } from '../../context/AuthContext';
import { useProject } from '../../context/ProjectContext';
import { getRandomColor } from '../../utils/colors';

const CollaboratorList = () => {
  const { activeUsers, connected } = useSocket();
  const { user } = useAuth();
  const { activeFile } = useProject();

  // Filter users for current file only
  const currentUserId = user?._id || user?.id;
  const currentFileId = activeFile?._id || activeFile?.id;
  const fileUsers = activeUsers.filter(u => u?.fileId === currentFileId);
  const otherUsers = fileUsers.filter(u => u?.userId !== currentUserId);
  
  const allUsers = [
    ...otherUsers,
    { 
      userId: currentUserId, 
      name: user?.username || user?.name || 'You',
      isCurrentUser: true 
    }
  ].filter(Boolean); // Remove any undefined entries

  if (!connected) {
    return (
      <div className="flex items-center gap-2 p-2 bg-gray-100 dark:bg-gray-800 rounded-md">
        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
        <span className="text-sm text-gray-500">Disconnected</span>
      </div>
    );
  }

  // Safety check - don't render if no users
  if (!allUsers || allUsers.length === 0) {
    return (
      <div className="flex items-center gap-2 p-2 bg-gray-100 dark:bg-gray-800 rounded-md">
        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
        <span className="text-sm text-gray-600 dark:text-gray-300">Loading...</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 p-2 bg-gray-100 dark:bg-gray-800 rounded-md">
      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
      <span className="text-sm text-gray-600 dark:text-gray-300">
        {allUsers.length} user{allUsers.length !== 1 ? 's' : ''} online
      </span>
      
      <div className="flex items-center gap-1 ml-2">
        {allUsers.map((userData) => {
          // Safe property access with fallbacks
          const userName = userData?.name || userData?.username || 'User';
          const displayName = (typeof userName === 'string' && userName.length > 0) ? userName : 'U';
          const firstChar = displayName.charAt ? displayName.charAt(0) : 'U';
          
          return (
            <div key={userData?.userId || Math.random()} className="flex items-center gap-1">
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white"
                style={{ backgroundColor: getRandomColor(userData?.userId || 'default') }}
                title={userName}
              >
                {firstChar.toUpperCase()}
              </div>
              {userData.isCurrentUser && (
                <span className="text-xs text-gray-500">(you)</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CollaboratorList;
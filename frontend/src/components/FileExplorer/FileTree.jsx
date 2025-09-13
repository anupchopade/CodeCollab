import React, { useState, useEffect } from "react";
import { Plus, File } from "lucide-react";
import FolderItem from "./FolderItem";
import FileItem from "./FileItem";
import { useProject } from "../../context/ProjectContext";

const FileTree = ({ project, files = [], activeFile, onFileSelect, onCreateFile }) => {
  const [expanded, setExpanded] = useState({});
  const [showNewFileInput, setShowNewFileInput] = useState(false);
  const [newFileName, setNewFileName] = useState('');
  const { refreshProjectFiles } = useProject();

  // Listen for real-time file events
  useEffect(() => {
    console.log("🔍 [DEBUG] FileTree: Setting up file event listeners");
    console.log("🔍 [DEBUG] FileTree: Current project:", project);
    
    const handleFileCreated = (event) => {
      console.log("🔍 [DEBUG] FileTree: handleFileCreated called");
      const { file, projectId } = event.detail;
      console.log("🔍 [DEBUG] FileTree: File created event received:", file);
      console.log("🔍 [DEBUG] FileTree: Event projectId:", projectId);
      console.log("🔍 [DEBUG] FileTree: Current project ID:", project?._id || project?.id);
      
      // Only refresh if it's for the current project
      if (project && (project._id === projectId || project.id === projectId)) {
        console.log("🔍 [DEBUG] FileTree: Project IDs match - refreshing file tree");
        refreshProjectFiles();
      } else {
        console.log("🔍 [DEBUG] FileTree: Project IDs don't match - skipping refresh");
      }
    };

    const handleFileDeleted = (event) => {
      console.log("🔍 [DEBUG] FileTree: handleFileDeleted called");
      const { fileId, projectId } = event.detail;
      console.log("🔍 [DEBUG] FileTree: File deleted event received:", fileId);
      
      // Only refresh if it's for the current project
      if (project && (project._id === projectId || project.id === projectId)) {
        console.log("🔍 [DEBUG] FileTree: Project IDs match - refreshing file tree");
        refreshProjectFiles();
      } else {
        console.log("🔍 [DEBUG] FileTree: Project IDs don't match - skipping refresh");
      }
    };

    // Add event listeners
    console.log("🔍 [DEBUG] FileTree: Adding event listeners");
    window.addEventListener('fileCreated', handleFileCreated);
    window.addEventListener('fileDeleted', handleFileDeleted);
    console.log("🔍 [DEBUG] FileTree: Event listeners added");

    // Cleanup
    return () => {
      window.removeEventListener('fileCreated', handleFileCreated);
      window.removeEventListener('fileDeleted', handleFileDeleted);
    };
  }, [project, refreshProjectFiles]);

  const toggleExpand = (path) => {
    setExpanded((prev) => ({ ...prev, [path]: !prev[path] }));
  };

  const handleFileClick = (file) => {
    if (onFileSelect) {
      onFileSelect(file);
    }
  };

  const handleCreateFile = () => {
    if (newFileName.trim() && onCreateFile) {
      onCreateFile(newFileName.trim());
      setNewFileName('');
      setShowNewFileInput(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleCreateFile();
    } else if (e.key === 'Escape') {
      setShowNewFileInput(false);
      setNewFileName('');
    }
  };

  // If no files, show empty state with create button
  if (!files || files.length === 0) {
    return (
      <div className="p-4 text-center text-gray-500">
        <p className="text-sm">No files in this project</p>
        <p className="text-xs mt-1 mb-3">Create a file to get started</p>
        
        {!showNewFileInput ? (
          <button
            onClick={() => setShowNewFileInput(true)}
            className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
          >
            <Plus size={16} />
            New File
          </button>
        ) : (
          <div className="space-y-2">
            <input
              type="text"
              value={newFileName}
              onChange={(e) => setNewFileName(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="filename.js"
              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
            />
            <div className="flex gap-2">
              <button
                onClick={handleCreateFile}
                className="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700"
              >
                Create
              </button>
              <button
                onClick={() => {
                  setShowNewFileInput(false);
                  setNewFileName('');
                }}
                className="px-3 py-1 bg-gray-600 text-white text-xs rounded hover:bg-gray-700"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Simple file list for now (can be enhanced later with folder structure)
  return (
    <div className="p-2">
      <div className="flex items-center justify-between mb-2">
        <div className="text-xs text-gray-400 uppercase tracking-wide">
          Files ({files.length})
        </div>
        <button
          onClick={() => setShowNewFileInput(true)}
          className="p-1 text-gray-400 hover:text-white transition-colors"
          title="New File"
        >
          <Plus size={16} />
        </button>
      </div>
      
      {showNewFileInput && (
        <div className="mb-2 p-2 bg-gray-700 rounded">
          <input
            type="text"
            value={newFileName}
            onChange={(e) => setNewFileName(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="filename.js"
            className="w-full px-2 py-1 text-sm bg-gray-800 text-white border border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            autoFocus
          />
          <div className="flex gap-1 mt-2">
            <button
              onClick={handleCreateFile}
              className="px-2 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700"
            >
              Create
            </button>
            <button
              onClick={() => {
                setShowNewFileInput(false);
                setNewFileName('');
              }}
              className="px-2 py-1 bg-gray-600 text-white text-xs rounded hover:bg-gray-700"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
      
      {files.map((file) => (
        <FileItem 
          key={file._id} 
          file={file}
          isActive={activeFile && activeFile._id === file._id}
          onClick={() => handleFileClick(file)}
        />
      ))}
    </div>
  );
};

export default FileTree;

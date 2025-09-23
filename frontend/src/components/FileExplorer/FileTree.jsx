import React, { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import FolderItem from "./FolderItem";
import FileItem from "./FileItem";
import { useProject } from "../../context/ProjectContext";
import NewFileModal from "./NewFileModal";
import fileService from "../../services/fileService";


const FileTree = ({ project, files = [], activeFile, onFileSelect, onCreateFile }) => {
  const [expanded, setExpanded] = useState({});
  const { refreshProjectFiles } = useProject();
  const [showNewModal, setShowNewModal] = useState(false);

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

  const handleRename = async (file) => {
    const newName = prompt('Rename to:', file?.name || '');
    if (!newName || newName === file.name) return;
    try {
      await fileService.updateFile(file._id, { name: newName });
      await refreshProjectFiles();
    } catch {}
  };

  const handleDelete = async (file) => {
    if (!window.confirm(`Delete ${file?.name}?`)) return;
    try {
      await fileService.deleteFile(file._id);
      await refreshProjectFiles();
    } catch {}
  };

  const handleDuplicate = async (file) => {
    const base = file.name;
    const copyName = prompt('Duplicate as:', `${base.replace(/(\.[^.]*)?$/, '')}-copy$1`);
    if (!copyName) return;
    try {
      const projectId = project?._id || project?.id;
      const path = copyName;
      await fileService.createFile({ projectId, name: copyName, path, language: file.language || 'javascript' });
      await refreshProjectFiles();
    } catch {}
  };

  // Use modal instead of inline inputs

  // If no files, show empty state with create button
  if (!files || files.length === 0) {
    return (
      <div className="p-4 text-center text-gray-500">
        <p className="text-sm">No files in this project</p>
        <p className="text-xs mt-1 mb-3">Create a file to get started</p>
        
        <button
          onClick={() => setShowNewModal(true)}
          className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
        >
          <Plus size={16} />
          New
        </button>

        <NewFileModal
          isOpen={showNewModal}
          onClose={() => setShowNewModal(false)}
          onCreate={async ({ name, type }) => {
            if (!name || !project) return;
            try {
              const projectId = project._id || project.id;
              if (type === 'folder') {
                await fileService.createDirectory({ projectId, path: name });
              } else {
                await fileService.createFile({ projectId, name });
              }
              await refreshProjectFiles();
            } finally {
              setShowNewModal(false);
            }
          }}
        />
      </div>
    );
  }
  const handleCreate = async ({ name, type }) => {
    if (!name || !project) return;
    try {
      const projectId = project._id || project.id;
      const cleanName = name.replace(/^\/+/, '').trim();
      const path = cleanName; // root-level path for now
      if (type === 'folder') {
        await fileService.createDirectory({ projectId, name: cleanName, path });
      } else {
        await fileService.createFile({ projectId, name: cleanName, path, language: 'javascript' });
      }
      await refreshProjectFiles();
    } finally {
      setShowNewModal(false);
    }
  };
  // Simple file list for now (can be enhanced later with folder structure)
  return (
    <div className="p-2">
      <div className="flex items-center justify-between mb-2">
        <div className="text-xs text-gray-400 uppercase tracking-wide">
          Files ({files.length})
        </div>
        <button
          onClick={() => setShowNewModal(true)}
          className="p-1 text-gray-400 hover:text-white transition-colors"
          title="New"
        >
          <Plus size={16} />
        </button>
      </div>

      <NewFileModal
        isOpen={showNewModal}
        onClose={() => setShowNewModal(false)}
        onCreate={async ({ name, type }) => {
          if (!name || !project) return;
          try {
            const projectId = project._id || project.id;
            if (type === 'folder') {
              await fileService.createDirectory({ projectId, path: name });
            } else {
              await fileService.createFile({ projectId, name });
            }
            await refreshProjectFiles();
          } finally {
            setShowNewModal(false);
          }
        }}
      />
      
      {files.map((file) => (
        <FileItem 
          key={file._id} 
          file={file}
          isActive={activeFile && activeFile._id === file._id}
          onClick={() => handleFileClick(file)}
          onRename={handleRename}
          onDelete={handleDelete}
          onDuplicate={handleDuplicate}
        />
      ))}
    </div>
  );
};

export default FileTree;

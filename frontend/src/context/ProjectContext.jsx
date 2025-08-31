import React, { createContext, useState, useContext, useCallback } from "react";

const ProjectContext = createContext();

export const ProjectProvider = ({ children }) => {
  const [project, setProject] = useState(null);
  const [files, setFiles] = useState([]);
  const [projects, setProjects] = useState([]);
  const [activeFile, setActiveFile] = useState(null);
  const [openFiles, setOpenFiles] = useState([]);

  const loadProject = (projectData) => {
    setProject(projectData);
    setFiles(projectData.files || []);
  };

  const loadUserProjects = useCallback(async () => {
    // TODO: Implement API call to load user projects
    // For now, return empty array
    setProjects([]);
    return [];
  }, []);

  const createProject = useCallback(async (projectData) => {
    // TODO: Implement API call to create project
    // For now, create mock project
    const newProject = {
      _id: Date.now().toString(),
      name: projectData.name,
      description: projectData.description,
      owner: 'current-user',
      files: []
    };
    setProjects(prev => [...prev, newProject]);
    return newProject;
  }, []);

  const updateFile = useCallback((fileId, newContent) => {
    setFiles((prevFiles) =>
      prevFiles.map((f) => (f.id === fileId ? { ...f, content: newContent } : f))
    );
  }, []);

  const updateFileContent = useCallback((fileId, newContent) => {
    setFiles((prevFiles) =>
      prevFiles.map((f) => (f.id === fileId ? { ...f, content: newContent } : f))
    );
  }, []);

  const saveFile = useCallback(async (fileId, content) => {
    // TODO: Implement API call to save file
    updateFileContent(fileId, content);
  }, [updateFileContent]);

  const addFile = useCallback((file) => setFiles((prev) => [...prev, file]), []);

  return (
    <ProjectContext.Provider value={{ 
      project, 
      files, 
      projects,
      activeFile,
      setActiveFile,
      openFiles,
      loadProject, 
      loadUserProjects,
      createProject,
      updateFile, 
      updateFileContent,
      saveFile,
      addFile 
    }}>
      {children}
    </ProjectContext.Provider>
  );
};

export const useProject = () => useContext(ProjectContext);

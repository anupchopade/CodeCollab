import React, { createContext, useState, useContext } from "react";

const ProjectContext = createContext();

export const ProjectProvider = ({ children }) => {
  const [project, setProject] = useState(null);
  const [files, setFiles] = useState([]);
  const [projects, setProjects] = useState([]);

  const loadProject = (projectData) => {
    setProject(projectData);
    setFiles(projectData.files || []);
  };

  const loadUserProjects = async () => {
    // Simulate loading projects from API
    const mockProjects = [
      {
        _id: '1',
        name: 'My First Project',
        description: 'A sample project to get started',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        _id: '2',
        name: 'React App',
        description: 'A React application with modern features',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];
    setProjects(mockProjects);
    return mockProjects;
  };

  const createProject = async (projectData) => {
    // Simulate creating a project
    const newProject = {
      _id: Date.now().toString(),
      name: projectData.name,
      description: projectData.description || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setProjects(prev => [...prev, newProject]);
    return newProject;
  };

  const updateFile = (fileId, newContent) => {
    setFiles((prevFiles) =>
      prevFiles.map((f) => (f.id === fileId ? { ...f, content: newContent } : f))
    );
  };

  const addFile = (file) => setFiles((prev) => [...prev, file]);

  return (
    <ProjectContext.Provider value={{ 
      project, 
      files, 
      projects,
      loadProject, 
      loadUserProjects,
      createProject,
      updateFile, 
      addFile 
    }}>
      {children}
    </ProjectContext.Provider>
  );
};

export const useProject = () => useContext(ProjectContext);

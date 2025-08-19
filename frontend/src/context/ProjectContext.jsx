import React, { createContext, useState, useContext } from "react";

const ProjectContext = createContext();

export const ProjectProvider = ({ children }) => {
  const [project, setProject] = useState(null);
  const [files, setFiles] = useState([]);

  const loadProject = (projectData) => {
    setProject(projectData);
    setFiles(projectData.files || []);
  };

  const updateFile = (fileId, newContent) => {
    setFiles((prevFiles) =>
      prevFiles.map((f) => (f.id === fileId ? { ...f, content: newContent } : f))
    );
  };

  const addFile = (file) => setFiles((prev) => [...prev, file]);

  return (
    <ProjectContext.Provider value={{ project, files, loadProject, updateFile, addFile }}>
      {children}
    </ProjectContext.Provider>
  );
};

export const useProject = () => useContext(ProjectContext);

import React, { createContext, useState, useContext, useCallback } from "react";
import projectService from "../services/projectService";
import fileService from "../services/fileService";

const ProjectContext = createContext();

export const ProjectProvider = ({ children }) => {
  const [currentProject, setCurrentProject] = useState(null);
  const [files, setFiles] = useState([]);
  const [projects, setProjects] = useState([]);
  const [activeFile, setActiveFile] = useState(null);
  const [openFiles, setOpenFiles] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadProject = useCallback(async (projectId) => {
    try {
      setLoading(true);
      const projectData = await projectService.getProject(projectId);
      const projectFiles = await fileService.getProjectFiles(projectId);
      
      setCurrentProject(projectData);
      setFiles(projectFiles);
      return projectData;
    } catch (error) {
      console.error('Error loading project:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const loadUserProjects = useCallback(async () => {
    try {
      setLoading(true);
      const userProjects = await projectService.getUserProjects();
      setProjects(userProjects);
      return userProjects;
    } catch (error) {
      console.error('Error loading user projects:', error);
      setProjects([]);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const createProject = useCallback(async (projectData) => {
    try {
      setLoading(true);
      const newProject = await projectService.createProject(projectData);
      setProjects(prev => [...prev, newProject]);
      return newProject;
    } catch (error) {
      console.error('Error creating project:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateProject = useCallback(async (projectId, projectData) => {
    try {
      const updatedProject = await projectService.updateProject(projectId, projectData);
      setProjects(prev => prev.map(p => p._id === projectId ? updatedProject : p));
      if (currentProject && currentProject._id === projectId) {
        setCurrentProject(updatedProject);
      }
      return updatedProject;
    } catch (error) {
      console.error('Error updating project:', error);
      throw error;
    }
  }, [currentProject]);

  const deleteProject = useCallback(async (projectId) => {
    try {
      await projectService.deleteProject(projectId);
      setProjects(prev => prev.filter(p => p._id !== projectId));
      if (currentProject && currentProject._id === projectId) {
        setCurrentProject(null);
        setFiles([]);
        setActiveFile(null);
      }
      return true;
    } catch (error) {
      console.error('Error deleting project:', error);
      throw error;
    }
  }, [currentProject]);

  const createFile = useCallback(async (fileData) => {
    try {
      const newFile = await fileService.createFile(fileData);
      setFiles(prev => [...prev, newFile]);
      return newFile;
    } catch (error) {
      console.error('Error creating file:', error);
      throw error;
    }
  }, []);

  const updateFile = useCallback((fileId, newContent) => {
    setFiles((prevFiles) =>
      prevFiles.map((f) => (f._id === fileId ? { ...f, content: newContent } : f))
    );
  }, []);

  const updateFileContent = useCallback((fileId, newContent) => {
    setFiles((prevFiles) =>
      prevFiles.map((f) => (f._id === fileId ? { ...f, content: newContent } : f))
    );
  }, []);

  const saveFile = useCallback(async (fileId, content) => {
    try {
      const updatedFile = await fileService.saveFile(fileId, content);
      setFiles(prev => prev.map(f => f._id === fileId ? updatedFile : f));
      return updatedFile;
    } catch (error) {
      console.error('Error saving file:', error);
      throw error;
    }
  }, []);

  const deleteFile = useCallback(async (fileId) => {
    try {
      await fileService.deleteFile(fileId);
      setFiles(prev => prev.filter(f => f._id !== fileId));
      if (activeFile && activeFile._id === fileId) {
        setActiveFile(null);
      }
      return true;
    } catch (error) {
      console.error('Error deleting file:', error);
      throw error;
    }
  }, [activeFile]);

  const addFile = useCallback((file) => setFiles((prev) => [...prev, file]), []);

  const refreshProjectFiles = useCallback(async () => {
    if (!currentProject) return;
    
    try {
      console.log("🔍 [DEBUG] ProjectContext: Refreshing project files for project:", currentProject._id);
      const projectFiles = await fileService.getProjectFiles(currentProject._id);
      console.log("🔍 [DEBUG] ProjectContext: Refreshed files:", projectFiles);
      setFiles(projectFiles);
    } catch (error) {
      console.error("❌ [DEBUG] ProjectContext: Error refreshing project files:", error);
    }
  }, [currentProject]);

  return (
    <ProjectContext.Provider value={{ 
      currentProject,
      project: currentProject, // Keep for backward compatibility
      files, 
      projects,
      activeFile,
      setActiveFile,
      openFiles,
      setOpenFiles,
      loading,
      loadProject, 
      loadUserProjects,
      createProject,
      updateProject,
      deleteProject,
      createFile,
      updateFile, 
      updateFileContent,
      saveFile,
      deleteFile,
      addFile,
      refreshProjectFiles
    }}>
      {children}
    </ProjectContext.Provider>
  );
};

export const useProject = () => useContext(ProjectContext);

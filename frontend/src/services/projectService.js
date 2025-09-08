import api from './api';
import toast from 'react-hot-toast';

// Project service for handling project operations
export const projectService = {
  // Create a new project
  async createProject(projectData) {
    try {
      const response = await api.post('/projects', projectData);
      const { project, message } = response.data;
      
      toast.success(message || 'Project created successfully!');
      return project;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to create project';
      toast.error(errorMessage);
      throw new Error(errorMessage);
    }
  },

  // Get all user projects
  async getUserProjects() {
    try {
      const response = await api.get('/projects');
      return response.data.projects;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch projects';
      throw new Error(errorMessage);
    }
  },

  // Get a specific project
  async getProject(projectId) {
    try {
      const response = await api.get(`/projects/${projectId}`);
      return response.data.project;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch project';
      throw new Error(errorMessage);
    }
  },

  // Update a project
  async updateProject(projectId, projectData) {
    try {
      const response = await api.put(`/projects/${projectId}`, projectData);
      const { project, message } = response.data;
      
      toast.success(message || 'Project updated successfully!');
      return project;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to update project';
      toast.error(errorMessage);
      throw new Error(errorMessage);
    }
  },

  // Delete a project
  async deleteProject(projectId) {
    try {
      const response = await api.delete(`/projects/${projectId}`);
      const { message } = response.data;
      
      toast.success(message || 'Project deleted successfully!');
      return true;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to delete project';
      toast.error(errorMessage);
      throw new Error(errorMessage);
    }
  },

  // Add collaborator to project
  async addCollaborator(projectId, collaboratorData) {
    try {
      const response = await api.post(`/projects/${projectId}/collaborators`, collaboratorData);
      const { project, message } = response.data;
      
      toast.success(message || 'Collaborator added successfully!');
      return project;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to add collaborator';
      toast.error(errorMessage);
      throw new Error(errorMessage);
    }
  },

  // Remove collaborator from project
  async removeCollaborator(projectId, collaboratorId) {
    try {
      const response = await api.delete(`/projects/${projectId}/collaborators/${collaboratorId}`);
      const { project, message } = response.data;
      
      toast.success(message || 'Collaborator removed successfully!');
      return project;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to remove collaborator';
      toast.error(errorMessage);
      throw new Error(errorMessage);
    }
  }
};

export default projectService;

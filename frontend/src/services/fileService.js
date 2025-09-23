import api from './api';
import toast from 'react-hot-toast';

// File service for handling file operations
export const fileService = {
  // Create a new file
  async createFile(fileData) {
    try {
      const normalized = { ...fileData };
      // Ensure required fields are present for backend validation
      if (!normalized.name && normalized.path) {
        normalized.name = String(normalized.path).split('/').pop();
      }
      if (!normalized.path && normalized.name) {
        normalized.path = normalized.name;
      }
      if (!normalized.language) {
        normalized.language = 'javascript';
      }
      console.log("🔍 [DEBUG] FileService: Creating file with data:", normalized);
      const response = await api.post('/files', normalized);
      console.log("🔍 [DEBUG] FileService: File creation response:", response.data);
      const { file, message } = response.data;
      
      toast.success(message || 'File created successfully!');
      return file;
    } catch (error) {
      console.error("❌ [DEBUG] FileService: File creation error:", error);
      const errorMessage = error.response?.data?.message || 'Failed to create file';
      toast.error(errorMessage);
      throw new Error(errorMessage);
    }
  },

  // Get all files in a project
  async getProjectFiles(projectId) {
    try {
      console.log("🔍 [DEBUG] FileService: Getting project files for project:", projectId);
      const response = await api.get(`/files/project/${projectId}`);
      console.log("🔍 [DEBUG] FileService: Project files response:", response.data);
      return response.data.files;
    } catch (error) {
      console.error("❌ [DEBUG] FileService: Get project files error:", error);
      const errorMessage = error.response?.data?.message || 'Failed to fetch files';
      throw new Error(errorMessage);
    }
  },

  // Get a specific file
  async getFile(fileId) {
    try {
      const response = await api.get(`/files/${fileId}`);
      return response.data.file;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch file';
      throw new Error(errorMessage);
    }
  },

  // Update file content
  async updateFile(fileId, fileData) {
    try {
      const response = await api.put(`/files/${fileId}`, fileData);
      const { file, message } = response.data;
      
      toast.success(message || 'File updated successfully!');
      return file;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to update file';
      toast.error(errorMessage);
      throw new Error(errorMessage);
    }
  },

  // Delete a file
  async deleteFile(fileId) {
    try {
      const response = await api.delete(`/files/${fileId}`);
      const { message } = response.data;
      
      toast.success(message || 'File deleted successfully!');
      return true;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to delete file';
      toast.error(errorMessage);
      throw new Error(errorMessage);
    }
  },

  // Create a directory
  async createDirectory(directoryData) {
    try {
      const normalized = { ...directoryData };
      if (!normalized.name && normalized.path) {
        normalized.name = String(normalized.path).split('/').pop();
      }
      if (!normalized.path && normalized.name) {
        normalized.path = normalized.name;
      }
      console.log("🔍 [DEBUG] FileService: Creating directory with data:", normalized);
      const response = await api.post('/files/directory', normalized);
      const { directory, message } = response.data;
      
      toast.success(message || 'Directory created successfully!');
      return directory;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to create directory';
      toast.error(errorMessage);
      throw new Error(errorMessage);
    }
  },

  // Save file content (for auto-save functionality)
  async saveFile(fileId, content) {
    try {
      const response = await api.put(`/files/${fileId}`, { content });
      return response.data.file;
    } catch (error) {
      // Don't show toast for auto-save errors to avoid spam
      console.error('Auto-save failed:', error);
      throw error;
    }
  },

  // Upload file (for future implementation)
  async uploadFile(file, projectId) {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('projectId', projectId);
      
      const response = await api.post('/files/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      const { file: uploadedFile, message } = response.data;
      toast.success(message || 'File uploaded successfully!');
      return uploadedFile;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to upload file';
      toast.error(errorMessage);
      throw new Error(errorMessage);
    }
  },

  // Download file (for future implementation)
  async downloadFile(fileId) {
    try {
      const response = await api.get(`/files/${fileId}/download`, {
        responseType: 'blob',
      });
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'file');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      return true;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to download file';
      toast.error(errorMessage);
      throw new Error(errorMessage);
    }
  }
};

export default fileService;

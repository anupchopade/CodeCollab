import api from './api';
import toast from 'react-hot-toast';

// Auth service for handling authentication operations
export const authService = {
  // Register a new user
  async register(userData) {
    try {
      const response = await api.post('/auth/register', userData);
      const { token, user, message } = response.data;
      
      // Store token and user data
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      toast.success(message || 'Registration successful!');
      return { token, user };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Registration failed';
      toast.error(errorMessage);
      throw new Error(errorMessage);
    }
  },

  // Login user
  async login(credentials) {
    try {
      const response = await api.post('/auth/login', credentials);
      const { token, user, message } = response.data;
      
      // Store token and user data
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      toast.success(message || 'Login successful!');
      return { token, user };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Login failed';
      toast.error(errorMessage);
      throw new Error(errorMessage);
    }
  },

  // Get current user profile
  async getProfile() {
    try {
      const response = await api.get('/auth/profile');
      return response.data.user;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch profile';
      throw new Error(errorMessage);
    }
  },

  // Update user profile
  async updateProfile(profileData) {
    try {
      const response = await api.put('/auth/profile', profileData);
      const { user, message } = response.data;
      
      // Update stored user data
      localStorage.setItem('user', JSON.stringify(user));
      
      toast.success(message || 'Profile updated successfully!');
      return user;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to update profile';
      toast.error(errorMessage);
      throw new Error(errorMessage);
    }
  },

  // Logout user
  logout() {
    // Clear stored data
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    toast.success('Logged out successfully!');
  },

  // Check if user is authenticated
  isAuthenticated() {
    const token = localStorage.getItem('token');
    return !!token;
  },

  // Get stored user data
  getStoredUser() {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  // Get stored token
  getStoredToken() {
    return localStorage.getItem('token');
  }
};

export default authService;

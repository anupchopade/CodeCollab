import React, { createContext, useState, useEffect, useContext } from "react";
import authService from "../services/authService";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(authService.getStoredToken());
  const [loading, setLoading] = useState(true);

  // Initialize user data on app start
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        if (token) {
          // Try to get fresh user data from server
          const userData = await authService.getProfile();
          setUser(userData);
        } else {
          // Check if there's stored user data
          const storedUser = authService.getStoredUser();
          if (storedUser) {
            setUser(storedUser);
          }
        }
      } catch (error) {
        // If token is invalid, clear everything
        console.error('Auth initialization error:', error);
        authService.logout();
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, [token]);

  const login = async (credentials) => {
    try {
      setLoading(true);
      const { token: newToken, user: userData } = await authService.login(credentials);
      setToken(newToken);
      setUser(userData);
      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    try {
      setLoading(true);
      const { token: newToken, user: newUser } = await authService.register(userData);
      setToken(newToken);
      setUser(newUser);
      return { success: true };
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    authService.logout();
    setToken(null);
    setUser(null);
  };

  const updateProfile = async (profileData) => {
    try {
      const updatedUser = await authService.updateProfile(profileData);
      setUser(updatedUser);
      return { success: true };
    } catch (error) {
      console.error('Profile update error:', error);
      return { success: false, error: error.message };
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      token, 
      loading, 
      login, 
      register, 
      logout, 
      updateProfile,
      isAuthenticated: authService.isAuthenticated()
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

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
      const result = await authService.login(credentials);
      if (result?.otpRequired) {
        // Do not set token/user yet
        return { success: true, otpRequired: true, sessionId: result.sessionId, email: result.email };
      }
      const { token: newToken, user: userData } = result || {};
      if (newToken && userData) {
        setToken(newToken);
        setUser(userData);
        return { success: true };
      }
      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };
  const completeLogin = async (token, userFromVerify) => {
    // Store token
    localStorage.setItem('token', token);
    setToken(token);
  
    // Prefer user from verify; if not, fetch profile
    try {
      const userData = userFromVerify || await authService.getProfile();
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      return { success: true };
    } catch (e) {
      console.error('Finalize login profile fetch error:', e);
      return { success: false, error: e.message };
    }
  };

  const register = async (userData) => {
    try {
      setLoading(true);
      const result = await authService.register(userData);
      if (result?.otpRequired) {
        // Defer state update until OTP verification
        return { success: true, otpRequired: true, sessionId: result.sessionId, email: result.email };
      }
      const { token: newToken, user: newUser } = result || {};
      if (newToken && newUser) {
        setToken(newToken);
        setUser(newUser);
        return { success: true };
      }
      return { success: false, error: 'Unexpected register response' };
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
      completeLogin,
      isAuthenticated: authService.isAuthenticated()
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

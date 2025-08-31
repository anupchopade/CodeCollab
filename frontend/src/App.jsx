import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Context Providers (Phase 1 only)
import { AuthProvider } from './context/AuthContext';
import { ProjectProvider } from './context/ProjectContext';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Editor from './pages/Editor';
import NotFound from './pages/NotFound';

// Components
import AuthGuard from './components/Auth/AuthGuard';
import ErrorBoundary from './components/Common/ErrorBoundary';
import Loading from './components/UI/Loading';

// Hooks
import { useAuth } from './context/AuthContext';

// Styles
import './index.css';

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <ProjectProvider>
          <Router>
            <div className="App">
              {/* Toast Notifications for user feedback */}
              <Toaster
                position="top-right"
                toastOptions={{
                  duration: 4000,
                  style: {
                    background: '#374151',
                    color: '#fff',
                    borderRadius: '8px',
                    fontSize: '14px',
                  },
                  success: {
                    duration: 3000,
                    iconTheme: {
                      primary: '#10b981',
                      secondary: '#ffffff',
                    },
                  },
                  error: {
                    duration: 5000,
                    iconTheme: {
                      primary: '#ef4444',
                      secondary: '#ffffff',
                    },
                  },
                  loading: {
                    iconTheme: {
                      primary: '#6366f1',
                      secondary: '#ffffff',
                    },
                  },
                }}
              />

              {/* Main Application Routes */}
              <Routes>
                {/* Public Routes */}
                <Route 
                  path="/" 
                  element={<Home />} 
                />
                
                <Route 
                  path="/login" 
                  element={
                    <PublicRoute>
                      <Login />
                    </PublicRoute>
                  } 
                />
                
                <Route 
                  path="/register" 
                  element={
                    <PublicRoute>
                      <Register />
                    </PublicRoute>
                  } 
                />

                {/* Protected Routes */}
                <Route 
                  path="/dashboard" 
                  element={
                    <AuthGuard>
                      <Dashboard />
                    </AuthGuard>
                  } 
                />
                
                <Route 
                  path="/editor/:projectId" 
                  element={
                    <AuthGuard>
                      <Editor />
                    </AuthGuard>
                  } 
                />

                {/* Catch-all route for 404 */}
                <Route 
                  path="*" 
                  element={<NotFound />} 
                />
              </Routes>
            </div>
          </Router>
        </ProjectProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

/**
 * PublicRoute Component
 * Redirects authenticated users away from auth pages (login/register)
 * to prevent them from seeing login form when already logged in
 */
function PublicRoute({ children }) {
  const { user, loading } = useAuth();

  // Show loading spinner while checking authentication status
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loading message="Checking authentication..." />
      </div>
    );
  }

  // If user is already authenticated, redirect to dashboard
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  // If not authenticated, show the requested page (login/register)
  return children;
}

export default App;
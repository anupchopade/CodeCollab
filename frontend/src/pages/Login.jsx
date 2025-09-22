import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoginForm from '../components/Auth/LoginForm';
import Loading from '../components/UI/Loading';

function Login() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (formData) => {
    setIsLoading(true);
    setError('');
    
      try {
        const result = await login({ email: formData.email, password: formData.password });

        if (result?.otpRequired) {
          navigate('/verify-otp', {
            state: {
              sessionId: result.sessionId,
              email: result.email,
              redirectTo: '/dashboard',
              purpose: 'login'
            }
          });
          return;
        }
        if (result.success) {
          navigate('/dashboard');
        } else {
          setError(result.error || 'Login failed. Please try again.');
        }
      } catch (err) {
        setError(err.message || 'Login failed. Please try again.');
      } finally {
        setIsLoading(false);
      }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8">
        {/* Header */}
        <div className="text-center">
          <Link to="/" className="text-2xl font-bold text-indigo-600">
            CodeCollab
          </Link>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Welcome back
          </h2>
          <p className="mt-2 text-gray-600">
            Sign in to your account to continue coding
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {/* Login Form */}
        <LoginForm 
          onSubmit={handleLogin} 
          isLoading={isLoading}
        />

        {/* Footer Links */}
        <div className="text-center space-y-2">
          <p className="text-gray-600">
            Don't have an account?{' '}
            <Link to="/register" className="text-indigo-600 hover:text-indigo-500">
              Sign up here
            </Link>
          </p>
          <Link to="/forgot-password" className="text-sm text-gray-500 hover:text-gray-700">
            Forgot your password?
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Login;
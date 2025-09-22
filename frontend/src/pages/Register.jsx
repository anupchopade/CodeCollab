import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import RegisterForm from '../components/Auth/RegisterForm';
import Loading from '../components/UI/Loading';

function Register() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleRegister = async (formData) => {
    setIsLoading(true);
    setError('');
    
    try {
      const result = await register({ 
        username: formData.email.split('@')[0], // Use email prefix as username
        email: formData.email, 
        password: formData.password 
      });
      if (result?.otpRequired) {
        navigate('/verify-otp', {
          state: {
            sessionId: result.sessionId,
            email: result.email,
            redirectTo: '/dashboard',
            purpose: 'verification'
          }
        });
      } else if (result.success) {
        navigate('/dashboard');
      } else {
        setError(result.error || 'Registration failed. Please try again.');
      }
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
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
            Create your account
          </h2>
          <p className="mt-2 text-gray-600">
            Join CodeCollab and start collaborating
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {/* Register Form */}
        <RegisterForm 
          onSubmit={handleRegister} 
          isLoading={isLoading}
        />

        {/* Footer Links */}
        <div className="text-center space-y-2">
          <p className="text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="text-indigo-600 hover:text-indigo-500">
              Sign in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Register;

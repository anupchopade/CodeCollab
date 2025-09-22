import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import OTPVerification from '../components/Auth/OTPVerification';
import otpService from '../services/otpService';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const OTPVerificationPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, completeLogin } = useAuth();
  
  // Get email from location state or URL params
  const email = location.state?.email || new URLSearchParams(location.search).get('email');
  const sessionId = location.state?.sessionId || new URLSearchParams(location.search).get('sessionId');
  const redirectTo = location.state?.redirectTo || '/dashboard';
  const purpose = location.state?.purpose || 'verification'; // 'verification', 'password-reset', 'login'
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Redirect if no email/session provided
  useEffect(() => {
    if (!email || !sessionId) {
      navigate('/login', { 
        state: { 
          error: 'Session expired. Please login again.' 
        } 
      });
    }
  }, [email, sessionId, navigate]);

  const handleVerify = async (otp) => {
    setIsLoading(true);
    setError('');

    try {
      // Prefer service method if available, else call API directly
      let token, user;
      if (typeof otpService.verifyOTPWithSession === 'function') {
        const result = await otpService.verifyOTPWithSession(sessionId, otp);
        if (result.success) {
          token = result.token;
          user = result.user;
        }
      } else {
        const response = await api.post('/auth/verify-otp', { sessionId, otp });
        token = response.data?.token;
        user = response.data?.user;
      }

      if (token) {
        if (typeof completeLogin === 'function') {
          await completeLogin(token, user);
        } else {
          localStorage.setItem('token', token);
          if (user) localStorage.setItem('user', JSON.stringify(user));
        }

        navigate(redirectTo, { 
          state: { 
            message: 'OTP verified successfully!' 
          } 
        });
      }
    } catch (err) {
      const msg = typeof otpService.getErrorMessage === 'function' ? otpService.getErrorMessage(err) : (err.message || 'Verification failed');
      setError(msg);
      throw err; // Re-throw to let OTPVerification handle it
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    setIsLoading(true);
    setError('');

    try {
      const result = await otpService.resendOTP(email);
      
      if (result.success) {
        // Success message will be shown by OTPVerification component
        return;
      }
    } catch (err) {
      const errorMessage = otpService.getErrorMessage(err);
      setError(errorMessage);
      throw err; // Re-throw to let OTPVerification handle it
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/login', { 
      state: { 
        message: 'OTP verification cancelled' 
      } 
    });
  };

  const getTitle = () => {
    switch (purpose) {
      case 'password-reset':
        return 'Verify Password Reset';
      case 'login':
        return 'Verify Login';
      case 'verification':
      default:
        return 'Verify Your Email';
    }
  };

  const getSubtitle = () => {
    switch (purpose) {
      case 'password-reset':
        return 'Enter the 6-digit code sent to your email to reset your password';
      case 'login':
        return 'Enter the 6-digit code sent to your email to complete login';
      case 'verification':
      default:
        return 'Enter the 6-digit code sent to your email';
    }
  };

  if (!email) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 to-purple-700 p-4">
        <div className="bg-white rounded-2xl p-8 text-center shadow-xl max-w-md w-full">
          <h2 className="text-red-600 text-2xl font-bold mb-4">Email Required</h2>
          <p className="text-gray-600 mb-6">Email is required for OTP verification</p>
          <button 
            onClick={() => navigate('/login')}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors duration-200"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 to-purple-700 p-4">
      <div className="w-full max-w-lg flex flex-col gap-8">
        <div className="text-center text-white">
          <h1 className="text-4xl font-bold mb-2 drop-shadow-lg">CodeCollab</h1>
          <p className="text-xl opacity-90 font-light">Secure Verification</p>
        </div>

        <OTPVerification
          email={email}
          title={getTitle()}
          subtitle={getSubtitle()}
          onVerify={handleVerify}
          onResend={handleResend}
          onCancel={handleCancel}
          resendCooldown={60}
          otpExpiry={300}
          maxAttempts={5}
          className="backdrop-blur-sm bg-white/95 border border-white/20"
        />

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
            <p className="text-red-600 font-medium">{error}</p>
          </div>
        )}

        <div className="text-center text-white opacity-80">
          <p className="text-sm leading-relaxed">
            Didn't receive the code? Check your spam folder or{' '}
            <button 
              type="button" 
              onClick={handleResend}
              className="underline font-medium hover:opacity-80 transition-opacity duration-200"
            >
              try again
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default OTPVerificationPage;

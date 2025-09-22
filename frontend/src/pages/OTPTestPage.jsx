import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import otpService from '../services/otpService';
import Button from '../components/UI/Button';
import Input from '../components/UI/Input';
import Loading from '../components/UI/Loading';

const OTPTestPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSendOTP = async (e) => {
    e.preventDefault();
    
    if (!email) {
      setError('Please enter an email address');
      return;
    }

    if (!otpService.validateEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const result = await otpService.sendOTP(email);
      
      if (result.success) {
        setSuccess('OTP sent successfully! Redirecting to verification...');
        
        // Navigate to verification page after a short delay
        setTimeout(() => {
          navigate('/verify-otp', { 
            state: { 
              email: email,
              purpose: 'verification',
              redirectTo: '/dashboard'
            } 
          });
        }, 1500);
      }
    } catch (err) {
      setError(otpService.getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 to-purple-700 p-4">
      <div className="w-full max-w-md">
        <div className="text-center text-white mb-8">
          <h1 className="text-4xl font-bold mb-2 drop-shadow-lg">CodeCollab</h1>
          <p className="text-xl opacity-90 font-light">OTP Test Page</p>
        </div>

        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-white/20">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
            Send OTP Test
          </h2>

          <form onSubmit={handleSendOTP} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                required
                className="w-full"
              />
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? (
                <>
                  <Loading size="sm" />
                  Sending OTP...
                </>
              ) : (
                'Send OTP'
              )}
            </Button>
          </form>

          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm font-medium">{error}</p>
            </div>
          )}

          {success && (
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-600 text-sm font-medium">{success}</p>
            </div>
          )}

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              This will send an OTP to your email and redirect you to the verification page.
            </p>
          </div>
        </div>

        <div className="mt-6 text-center text-white opacity-80">
          <p className="text-sm">
            <button 
              onClick={() => navigate('/login')}
              className="underline hover:opacity-80 transition-opacity duration-200"
            >
              Back to Login
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default OTPTestPage;

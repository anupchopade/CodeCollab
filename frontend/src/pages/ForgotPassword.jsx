import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../services/authService';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    if (!email) return setError('Please enter your email');
    try {
      setLoading(true);
      const data = await authService.forgotPassword(email);
      if (data?.otpRequired && data.sessionId) {
        // Go directly to reset page; user will enter OTP + new password there
        navigate('/reset-password', { state: { sessionId: data.sessionId, email: data.email || email } });
      } else {
        setMessage(data?.message || 'If the email exists, an OTP has been sent');
      }
    } catch (err) {
      setError(err.message || 'Failed to request password reset');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow p-6">
        <h1 className="text-2xl font-bold mb-2">Forgot Password</h1>
        <p className="text-sm text-gray-600 mb-6">Enter your email to receive an OTP to reset your password.</p>
        {error && <div className="mb-3 text-red-600 text-sm">{error}</div>}
        {message && <div className="mb-3 text-green-600 text-sm">{message}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <input className="w-full border rounded px-3 py-2" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
          <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white rounded px-4 py-2 disabled:opacity-60">
            {loading ? 'Sending...' : 'Send OTP'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;



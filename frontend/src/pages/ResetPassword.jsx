import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import authService from '../services/authService';
import { useAuth } from '../context/AuthContext';

const ResetPassword = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { completeLogin } = useAuth();
  const sessionId = location.state?.sessionId;
  const email = location.state?.email;

  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!sessionId) return setError('Session expired. Please start over.');
    if (!otp || otp.length !== 6) return setError('Enter the 6-digit OTP');
    if (!password || password.length < 8) return setError('Password must be at least 8 characters');
    if (password !== confirm) return setError('Passwords do not match');
    try {
      setLoading(true);
      const data = await authService.resetPassword({ sessionId, otp, newPassword: password });
      if (data?.token) {
        await completeLogin(data.token, data.user);
        navigate('/dashboard', { state: { message: 'Password reset successful' } });
      }
    } catch (err) {
      setError(err.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow p-6">
        <h1 className="text-2xl font-bold mb-2">Reset Password</h1>
        <p className="text-sm text-gray-600 mb-6">Enter the OTP and your new password.</p>
        {error && <div className="mb-3 text-red-600 text-sm">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <input className="w-full border rounded px-3 py-2" type="text" placeholder="6-digit OTP" value={otp} onChange={(e) => setOtp(e.target.value)} />
          <input className="w-full border rounded px-3 py-2" type="password" placeholder="New password" value={password} onChange={(e) => setPassword(e.target.value)} />
          <input className="w-full border rounded px-3 py-2" type="password" placeholder="Confirm new password" value={confirm} onChange={(e) => setConfirm(e.target.value)} />
          <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white rounded px-4 py-2 disabled:opacity-60">
            {loading ? 'Resetting...' : 'Reset Password'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;




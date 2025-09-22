import React, { useState, useEffect, useCallback } from 'react';
import OTPInput from './OTPInput';
import Button from '../UI/Button';
import Loading from '../UI/Loading';
import Toast from '../UI/Toast';

const OTPVerification = ({
  email,
  onVerify,
  onResend,
  onCancel,
  title = "Verify Your Email",
  subtitle = "Enter the 6-digit code sent to your email",
  resendCooldown = 45,
  otpExpiry = 300, // 5 minutes
  maxAttempts = 5,
  className = ''
}) => {
  const [otp, setOtp] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [resendTimer, setResendTimer] = useState(0);
  const [expiryTimer, setExpiryTimer] = useState(otpExpiry);
  const [isExpired, setIsExpired] = useState(false);

  // Start initial resend cooldown on mount so button shows countdown immediately
  useEffect(() => {
    setResendTimer(resendCooldown);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Resend cooldown timer
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => {
        setResendTimer(resendTimer - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  // OTP expiry timer
  useEffect(() => {
    if (expiryTimer > 0 && !isExpired) {
      const timer = setTimeout(() => {
        setExpiryTimer(expiryTimer - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (expiryTimer === 0 && !isExpired) {
      setIsExpired(true);
      setError('OTP has expired. Please request a new one.');
    }
  }, [expiryTimer, isExpired]);

  const handleOTPComplete = useCallback(async (completeOtp) => {
    console.log('OTP Complete triggered with:', completeOtp);
    
    if (isExpired) {
      setError('OTP has expired. Please request a new one.');
      return;
    }

    if (attempts >= maxAttempts) {
      setError('Too many failed attempts. Please request a new OTP.');
      return;
    }

    setIsVerifying(true);
    setError('');
    setSuccess('');

    try {
      await onVerify(completeOtp);
      setSuccess('OTP verified successfully!');
    } catch (err) {
      console.error('OTP verification error:', err);
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      
      if (newAttempts >= maxAttempts) {
        setError('Too many failed attempts. Please request a new OTP.');
      } else if (err.message.includes('expired')) {
        setError('OTP has expired. Please request a new one.');
      } else if (err.message.includes('Invalid')) {
        setError(`Invalid OTP. ${maxAttempts - newAttempts} attempts remaining.`);
      } else {
        setError(err.message || 'Verification failed. Please try again.');
      }
    } finally {
      setIsVerifying(false);
    }
  }, [isExpired, attempts, maxAttempts, onVerify]);

  // Manual submit function
  const handleManualSubmit = useCallback(async () => {
    const currentOtp = otp; // otp is already a string
    if (currentOtp.length === 6) {
      await handleOTPComplete(currentOtp);
    } else {
      setError('Please enter all 6 digits');
    }
  }, [otp, handleOTPComplete]);

  const handleResend = useCallback(async () => {
    if (resendTimer > 0) return;

    setIsResending(true);
    setError('');
    setSuccess('');

    try {
      await onResend();
      setResendTimer(resendCooldown);
      setExpiryTimer(otpExpiry);
      setIsExpired(false);
      setAttempts(0);
      setSuccess('New OTP sent to your email!');
    } catch (err) {
      console.error('Resend error:', err);
      if (err.message.includes('wait') || err.message.includes('429')) {
        setError('Please wait before requesting a new OTP. Try again in a few minutes.');
      } else {
        setError(err.message || 'Failed to resend OTP. Please try again.');
      }
    } finally {
      setIsResending(false);
    }
  }, [resendTimer, resendCooldown, otpExpiry, onResend]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getMaskedEmail = (email) => {
    if (!email) return '';
    const [username, domain] = email.split('@');
    const maskedUsername = username.length > 2 
      ? username.slice(0, 2) + '*'.repeat(username.length - 2)
      : username;
    return `${maskedUsername}@${domain}`;
  };

  return (
    <div className={`max-w-md mx-auto p-8 bg-white rounded-2xl shadow-xl relative ${className}`}>
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">{title}</h2>
        <p className="text-sm text-gray-600 mb-4 leading-relaxed">
          {subtitle}
        </p>
        {email && (
          <p className="text-sm text-gray-700 px-4 py-2 bg-gray-50 rounded-lg border border-gray-200">
            Code sent to <strong>{getMaskedEmail(email)}</strong>
          </p>
        )}
      </div>

      <div className="flex flex-col gap-6 items-center">
        <OTPInput
          onComplete={handleOTPComplete}
          onError={setError}
          onChange={setOtp}
          disabled={isVerifying || isExpired}
          className="w-full"
        />

        {/* Manual Submit Button */}
        <Button
          onClick={handleManualSubmit}
          disabled={isVerifying || isExpired || otp.length !== 6}
          className="w-full max-w-xs"
        >
          {isVerifying ? (
            <>
              <Loading size="sm" />
              Verifying...
            </>
          ) : (
            'Verify OTP'
          )}
        </Button>

        {/* Expiry Timer */}
        {!isExpired && expiryTimer > 0 && (
          <div className="flex items-center gap-2 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
            <span className="text-sm font-medium">Code expires in:</span>
            <span className="text-sm font-bold font-mono">{formatTime(expiryTimer)}</span>
          </div>
        )}

        {/* Attempt Counter */}
        {attempts > 0 && attempts < maxAttempts && (
          <div className="flex items-center gap-2 px-4 py-3 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-700">
            <span className="text-sm font-medium">Attempts remaining:</span>
            <span className="text-sm font-bold text-orange-600">{maxAttempts - attempts}</span>
          </div>
        )}

        {/* Resend Section */}
        <div className="w-full text-center">
          <Button
            onClick={handleResend}
            disabled={isResending || isExpired || resendTimer > 0}
            variant="outline"
            size="sm"
            className="w-full max-w-xs"
          >
            {isResending ? (
              <>
                <Loading size="sm" />
                Sending...
              </>
            ) : resendTimer > 0 ? (
              `Resend (${formatTime(resendTimer)})`
            ) : (
              'Resend Code'
            )}
          </Button>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 justify-center w-full">
          {onCancel && (
            <Button
              onClick={onCancel}
              variant="ghost"
              disabled={isVerifying}
            >
              Cancel
            </Button>
          )}
        </div>
      </div>

      {/* Status Messages */}
      {error && (
        <div className="mt-4">
          <Toast
            type="error"
            message={error}
            onClose={() => setError('')}
          />
        </div>
      )}

      {success && (
        <div className="mt-4">
          <Toast
            type="success"
            message={success}
            onClose={() => setSuccess('')}
          />
        </div>
      )}

      {/* Loading Overlay */}
      {isVerifying && (
        <div className="absolute inset-0 bg-white/90 backdrop-blur-sm rounded-2xl flex flex-col items-center justify-center gap-4">
          <Loading size="lg" />
          <span className="text-sm text-gray-600 font-medium">Verifying OTP...</span>
        </div>
      )}
    </div>
  );
};

export default OTPVerification;

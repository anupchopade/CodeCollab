import { useState, useCallback, useRef } from 'react';
import otpService from '../services/otpService';

/**
 * Custom hook for OTP functionality
 * Provides state management and methods for OTP operations
 */
const useOTP = (initialEmail = '') => {
  const [email, setEmail] = useState(initialEmail);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [otpExpiry, setOtpExpiry] = useState(0);
  const [isExpired, setIsExpired] = useState(false);
  
  const resendTimerRef = useRef(null);
  const expiryTimerRef = useRef(null);

  // Clear error and success messages
  const clearMessages = useCallback(() => {
    setError('');
    setSuccess('');
  }, []);

  // Start resend cooldown timer
  const startResendCooldown = useCallback((seconds = 60) => {
    setResendCooldown(seconds);
    
    if (resendTimerRef.current) {
      clearInterval(resendTimerRef.current);
    }
    
    resendTimerRef.current = setInterval(() => {
      setResendCooldown(prev => {
        if (prev <= 1) {
          clearInterval(resendTimerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  // Start OTP expiry timer
  const startOtpExpiry = useCallback((seconds = 300) => {
    setOtpExpiry(seconds);
    setIsExpired(false);
    
    if (expiryTimerRef.current) {
      clearInterval(expiryTimerRef.current);
    }
    
    expiryTimerRef.current = setInterval(() => {
      setOtpExpiry(prev => {
        if (prev <= 1) {
          clearInterval(expiryTimerRef.current);
          setIsExpired(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  // Send OTP
  const sendOTP = useCallback(async (emailAddress = email) => {
    if (!emailAddress) {
      setError('Email is required');
      return false;
    }

    if (!otpService.validateEmail(emailAddress)) {
      setError('Please enter a valid email address');
      return false;
    }

    setIsLoading(true);
    clearMessages();

    try {
      const result = await otpService.sendOTP(emailAddress);
      
      if (result.success) {
        setEmail(emailAddress);
        setSuccess('OTP sent successfully!');
        setAttempts(0);
        startResendCooldown(60);
        startOtpExpiry(300);
        return true;
      }
    } catch (err) {
      const errorMessage = otpService.getErrorMessage(err);
      setError(errorMessage);
      
      // If it's a rate limit error, start cooldown
      if (otpService.isRateLimitError(err)) {
        const cooldownTime = otpService.extractCooldownTime(err);
        if (cooldownTime > 0) {
          startResendCooldown(cooldownTime);
        }
      }
      
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [email, clearMessages, startResendCooldown, startOtpExpiry]);

  // Verify OTP
  const verifyOTP = useCallback(async (otp, emailAddress = email) => {
    if (!otp) {
      setError('OTP is required');
      return { success: false };
    }

    if (!otpService.validateOTP(otp)) {
      setError('Please enter a valid 6-digit OTP');
      return { success: false };
    }

    if (!emailAddress) {
      setError('Email is required');
      return { success: false };
    }

    if (isExpired) {
      setError('OTP has expired. Please request a new one.');
      return { success: false };
    }

    setIsLoading(true);
    clearMessages();

    try {
      const result = await otpService.verifyOTP(emailAddress, otp);
      
      if (result.success) {
        setSuccess('OTP verified successfully!');
        // Clear timers
        if (resendTimerRef.current) clearInterval(resendTimerRef.current);
        if (expiryTimerRef.current) clearInterval(expiryTimerRef.current);
        return { success: true, token: result.token, data: result.data };
      }
    } catch (err) {
      const errorMessage = otpService.getErrorMessage(err);
      setError(errorMessage);
      
      // Increment attempts for invalid OTP
      if (otpService.isInvalidOTPError(err)) {
        setAttempts(prev => prev + 1);
      }
      
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, [email, isExpired, clearMessages]);

  // Resend OTP
  const resendOTP = useCallback(async (emailAddress = email) => {
    if (resendCooldown > 0) {
      setError(`Please wait ${resendCooldown} seconds before resending`);
      return false;
    }

    return await sendOTP(emailAddress);
  }, [email, resendCooldown, sendOTP]);

  // Reset OTP state
  const resetOTP = useCallback(() => {
    setEmail('');
    setError('');
    setSuccess('');
    setAttempts(0);
    setResendCooldown(0);
    setOtpExpiry(0);
    setIsExpired(false);
    
    // Clear timers
    if (resendTimerRef.current) {
      clearInterval(resendTimerRef.current);
      resendTimerRef.current = null;
    }
    if (expiryTimerRef.current) {
      clearInterval(expiryTimerRef.current);
      expiryTimerRef.current = null;
    }
  }, []);

  // Format time helper
  const formatTime = useCallback((seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }, []);

  // Get masked email
  const getMaskedEmail = useCallback((emailAddress = email) => {
    if (!emailAddress) return '';
    const [username, domain] = emailAddress.split('@');
    const maskedUsername = username.length > 2 
      ? username.slice(0, 2) + '*'.repeat(username.length - 2)
      : username;
    return `${maskedUsername}@${domain}`;
  }, [email]);

  // Cleanup on unmount
  const cleanup = useCallback(() => {
    if (resendTimerRef.current) {
      clearInterval(resendTimerRef.current);
    }
    if (expiryTimerRef.current) {
      clearInterval(expiryTimerRef.current);
    }
  }, []);

  return {
    // State
    email,
    isLoading,
    error,
    success,
    attempts,
    resendCooldown,
    otpExpiry,
    isExpired,
    
    // Actions
    sendOTP,
    verifyOTP,
    resendOTP,
    resetOTP,
    clearMessages,
    setEmail,
    
    // Helpers
    formatTime,
    getMaskedEmail,
    cleanup,
    
    // Computed values
    canResend: resendCooldown === 0,
    isOTPValid: otpExpiry > 0 && !isExpired,
    hasAttemptsLeft: attempts < 5,
    
    // Service methods
    validateEmail: otpService.validateEmail,
    validateOTP: otpService.validateOTP,
    getErrorMessage: otpService.getErrorMessage,
    isRateLimitError: otpService.isRateLimitError,
    isExpiredOTPError: otpService.isExpiredOTPError,
    isInvalidOTPError: otpService.isInvalidOTPError
  };
};

export default useOTP;

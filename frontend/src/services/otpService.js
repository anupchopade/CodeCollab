import api from './api';

class OTPService {
  /**
   * Send OTP to email
   * @param {string} email - Email address to send OTP to
   * @returns {Promise<Object>} Response object
   */
  async sendOTP(email) {
    try {
      const response = await api.post('/auth/send-otp', { email });
      return {
        success: true,
        message: response.data.message,
        data: response.data
      };
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Failed to send OTP';
      const statusCode = error.response?.status;
      
      // Handle specific error cases
      if (statusCode === 429) {
        throw new Error('Please wait before requesting a new OTP');
      } else if (statusCode === 400) {
        throw new Error('Invalid email address');
      } else if (statusCode === 500) {
        throw new Error('Server error. Please try again later');
      }
      
      throw new Error(errorMessage);
    }
  }
  async verifyOTPWithSession(sessionId, otp) {
    try {
      const response = await api.post('/auth/verify-otp', { sessionId, otp });
      return {
        success: true,
        message: response.data.message,
        token: response.data.token,
        user: response.data.user,
        data: response.data
      };
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Failed to verify OTP';
      const statusCode = error.response?.status;
      if (statusCode === 400) {
        if (errorMessage.includes('expired')) throw new Error('OTP has expired. Please request a new one.');
        if (errorMessage.includes('Invalid')) throw new Error('Invalid OTP. Please check and try again.');
        if (errorMessage.includes('not found')) throw new Error('No OTP found. Please request a new one.');
        if (errorMessage.includes('session')) throw new Error('Invalid or expired session. Please login again.');
      } else if (statusCode === 429) {
        throw new Error('Too many failed attempts. Please request a new OTP.');
      } else if (statusCode === 500) {
        throw new Error('Server error. Please try again later');
      }
      throw new Error(errorMessage);
    }
  }
  /**
   * Verify OTP
   * @param {string} email - Email address
   * @param {string} otp - 6-digit OTP
   * @returns {Promise<Object>} Response object with token
   */
  async verifyOTP(email, otp) {
    try {
      const response = await api.post('/auth/verify-otp', { email, otp });
      return {
        success: true,
        message: response.data.message,
        token: response.data.token,
        data: response.data
      };
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Failed to verify OTP';
      const statusCode = error.response?.status;
      
      // Handle specific error cases
      if (statusCode === 400) {
        if (errorMessage.includes('expired')) {
          throw new Error('OTP has expired. Please request a new one.');
        } else if (errorMessage.includes('Invalid')) {
          throw new Error('Invalid OTP. Please check and try again.');
        } else if (errorMessage.includes('not found')) {
          throw new Error('No OTP found for this email. Please request a new one.');
        }
      } else if (statusCode === 429) {
        throw new Error('Too many failed attempts. Please request a new OTP.');
      } else if (statusCode === 500) {
        throw new Error('Server error. Please try again later');
      }
      
      throw new Error(errorMessage);
    }
  }

  /**
   * Resend OTP (same as sendOTP but with different messaging)
   * @param {string} email - Email address to resend OTP to
   * @returns {Promise<Object>} Response object
   */
  async resendOTP(email) {
    return this.sendOTP(email);
  }

  /**
   * Validate email format
   * @param {string} email - Email to validate
   * @returns {boolean} True if valid email format
   */
  validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Validate OTP format
   * @param {string} otp - OTP to validate
   * @returns {boolean} True if valid OTP format (6 digits)
   */
  validateOTP(otp) {
    const otpRegex = /^\d{6}$/;
    return otpRegex.test(otp);
  }

  /**
   * Get error message for specific error type
   * @param {Error} error - Error object
   * @returns {string} User-friendly error message
   */
  getErrorMessage(error) {
    const message = error.message || 'An unexpected error occurred';
    
    // Map common error messages to user-friendly ones
    const errorMap = {
      'Network Error': 'Please check your internet connection',
      'Request failed with status code 429': 'Too many requests. Please wait a moment',
      'Request failed with status code 500': 'Server error. Please try again later',
      'Request failed with status code 400': 'Invalid request. Please check your input'
    };

    return errorMap[message] || message;
  }

  /**
   * Check if error is a rate limit error
   * @param {Error} error - Error object
   * @returns {boolean} True if rate limit error
   */
  isRateLimitError(error) {
    return error.message.includes('wait') || 
           error.message.includes('rate limit') ||
           error.message.includes('too many');
  }

  /**
   * Check if error is an expired OTP error
   * @param {Error} error - Error object
   * @returns {boolean} True if expired OTP error
   */
  isExpiredOTPError(error) {
    return error.message.includes('expired') || 
           error.message.includes('not found');
  }

  /**
   * Check if error is an invalid OTP error
   * @param {Error} error - Error object
   * @returns {boolean} True if invalid OTP error
   */
  isInvalidOTPError(error) {
    return error.message.includes('Invalid') || 
           error.message.includes('invalid');
  }

  /**
   * Extract cooldown time from error message (if available)
   * @param {Error} error - Error object
   * @returns {number} Cooldown time in seconds, or 0 if not found
   */
  extractCooldownTime(error) {
    const message = error.message || '';
    const match = message.match(/(\d+)\s*seconds?/i);
    return match ? parseInt(match[1]) : 0;
  }
}

// Create and export a singleton instance
const otpService = new OTPService();
export default otpService;

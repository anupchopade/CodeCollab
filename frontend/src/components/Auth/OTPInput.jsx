import React, { useState, useRef, useEffect } from 'react';

const OTPInput = ({ 
  length = 6, 
  onComplete, 
  onError, 
  disabled = false,
  autoFocus = true,
  className = '',
  value = '',
  onChange = null
}) => {
  const [otp, setOtp] = useState(new Array(length).fill(''));
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRefs = useRef([]);

  // Update internal state when external value changes
  useEffect(() => {
    if (value && value.length === length) {
      const newOtp = value.split('');
      setOtp(newOtp);
    }
  }, [value, length]);

  useEffect(() => {
    if (autoFocus && inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, [autoFocus]);

  const handleChange = (index, value) => {
    // Only allow numbers
    if (!/^\d*$/.test(value)) {
      onError?.('Only numbers are allowed');
      return;
    }

    // Limit to single digit
    if (value.length > 1) {
      value = value.slice(-1);
    }

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Notify parent component of the change
    const completeOtp = newOtp.join('');
    onChange?.(completeOtp);

    // Move to next input if current is filled
    if (value && index < length - 1) {
      setActiveIndex(index + 1);
      inputRefs.current[index + 1]?.focus();
    }

    // Check if OTP is complete
    if (completeOtp.length === length && !completeOtp.includes('')) {
      onComplete?.(completeOtp);
    }
  };

  const handleKeyDown = (index, e) => {
    // Handle backspace
    if (e.key === 'Backspace') {
      e.preventDefault();
      
      if (otp[index]) {
        // Clear current input
        const newOtp = [...otp];
        newOtp[index] = '';
        setOtp(newOtp);
      } else if (index > 0) {
        // Move to previous input
        setActiveIndex(index - 1);
        inputRefs.current[index - 1]?.focus();
      }
    }
    
    // Handle arrow keys
    if (e.key === 'ArrowLeft' && index > 0) {
      setActiveIndex(index - 1);
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === 'ArrowRight' && index < length - 1) {
      setActiveIndex(index + 1);
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length);
    
    if (pastedData.length > 0) {
      const newOtp = new Array(length).fill('');
      for (let i = 0; i < pastedData.length; i++) {
        newOtp[i] = pastedData[i];
      }
      setOtp(newOtp);
      
      // Focus on the next empty input or the last one
      const nextIndex = Math.min(pastedData.length, length - 1);
      setActiveIndex(nextIndex);
      inputRefs.current[nextIndex]?.focus();
      
      // Check if complete
      if (pastedData.length === length) {
        onComplete?.(pastedData);
      }
    }
  };

  const clearOtp = () => {
    setOtp(new Array(length).fill(''));
    setActiveIndex(0);
    inputRefs.current[0]?.focus();
  };

  return (
    <div className={`flex flex-col items-center gap-4 ${className}`}>
      <div className="flex gap-3 justify-center items-center">
        {otp.map((digit, index) => (
          <input
            key={index}
            ref={(el) => (inputRefs.current[index] = el)}
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength="1"
            value={digit}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onPaste={handlePaste}
            onFocus={() => setActiveIndex(index)}
            disabled={disabled}
            className={`
              w-12 h-12 border-2 rounded-lg text-center text-2xl font-semibold
              text-gray-800 bg-white transition-all duration-200 outline-none
              ${activeIndex === index 
                ? 'border-blue-500 shadow-lg shadow-blue-500/20 scale-105' 
                : 'border-gray-300'
              }
              ${digit 
                ? 'border-green-500 bg-green-50' 
                : ''
              }
              ${disabled 
                ? 'bg-gray-50 border-gray-200 text-gray-400 cursor-not-allowed' 
                : 'hover:border-gray-400 focus:border-blue-500'
              }
              sm:w-10 sm:h-10 sm:text-xl
            `}
            autoComplete="off"
          />
        ))}
      </div>
      
      {!disabled && (
        <button 
          type="button" 
          onClick={clearOtp}
          className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-md text-gray-600 text-sm hover:bg-gray-100 hover:border-gray-300 transition-all duration-200 active:translate-y-0.5"
          title="Clear OTP"
        >
          Clear
        </button>
      )}
    </div>
  );
};

export default OTPInput;

// src/components/UI/Toast.jsx
import React, { useEffect } from "react";
import { CheckCircle, AlertCircle, XCircle } from "lucide-react";

const icons = {
  success: <CheckCircle className="text-green-500" size={20} />,
  error: <XCircle className="text-red-500" size={20} />,
  warning: <AlertCircle className="text-yellow-500" size={20} />,
};

const Toast = ({ message, type = "success", onClose, duration = 3000 }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [onClose, duration]);

  return (
    <div className="fixed bottom-5 right-5 flex items-center gap-3 px-4 py-3 bg-white dark:bg-gray-800 shadow-lg rounded-lg border border-gray-200 dark:border-gray-700">
      {icons[type]}
      <span className="text-gray-800 dark:text-gray-100">{message}</span>
      <button
        onClick={onClose}
        className="ml-2 text-gray-500 hover:text-gray-800 dark:hover:text-white"
      >
        ✕
      </button>
    </div>
  );
};

export default Toast;

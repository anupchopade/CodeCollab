// src/components/UI/Input.jsx
import React from "react";

const Input = ({
  label,
  type = "text",
  error,
  className = "",
  ...props
}) => {
  return (
    <div className="flex flex-col w-full">
      {label && (
        <label className="mb-1 text-sm font-medium text-gray-700 dark:text-gray-200">
          {label}
        </label>
      )}
      <input
        type={type}
        className={`px-3 py-2 rounded-lg border shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-gray-100 dark:border-gray-600 ${error ? "border-red-500 focus:ring-red-500" : "border-gray-300 dark:border-gray-600"} ${className}`}
        {...props}
      />
      {error && (
        <span className="mt-1 text-xs text-red-500">{error}</span>
      )}
    </div>
  );
};

export default Input;

// src/components/UI/Loading.jsx
import React from "react";

export const Spinner = () => (
  <div className="w-6 h-6 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
);

export const Skeleton = ({ className = "" }) => (
  <div className={`animate-pulse bg-gray-300 dark:bg-gray-700 rounded ${className}`} />
);

// // src/components/UI/Loading.jsx
// import React from "react";

// export const Spinner = () => (
//   <div className="w-6 h-6 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
// );

// export const Skeleton = ({ className = "" }) => (
//   <div className={`animate-pulse bg-gray-300 dark:bg-gray-700 rounded ${className}`} />
// );

// src/components/UI/Loading.jsx
import React from "react";

export default function Loading({ message = "Loading..." }) {
  return (
    <div className="flex flex-col items-center justify-center h-full">
      <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      <p className="mt-2 text-gray-600 dark:text-gray-300">{message}</p>
    </div>
  );
}

export const Spinner = () => (
  <div className="w-6 h-6 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
);

export const Skeleton = ({ className = "" }) => (
  <div className={`animate-pulse bg-gray-300 dark:bg-gray-700 rounded ${className}`} />
);

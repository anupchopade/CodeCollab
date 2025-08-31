import React from "react";
import { Link } from "react-router-dom";

function Register() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md bg-white shadow-lg rounded-lg p-6">
        <h2 className="text-2xl font-bold mb-6 text-center">Create Account</h2>
        
        <form className="space-y-4">
          <input 
            type="text" 
            placeholder="Username" 
            className="w-full border rounded px-3 py-2"
          />
          <input 
            type="email" 
            placeholder="Email" 
            className="w-full border rounded px-3 py-2"
          />
          <input 
            type="password" 
            placeholder="Password" 
            className="w-full border rounded px-3 py-2"
          />

          <button 
            type="submit" 
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
          >
            Sign Up
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-gray-600">
          Already have an account?{" "}
          <Link to="/login" className="text-blue-600 hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Register;

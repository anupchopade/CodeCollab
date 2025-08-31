// src/components/Auth/LoginForm.jsx
import React, { useState, useMemo } from "react";
import Button from "../UI/Button";
import Input from "../UI/Input";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;

const LoginForm = ({ onSubmit, isLoading = false }) => {
  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});

  const isValid = useMemo(() => {
    const next = {};
    if (!emailRegex.test(form.email)) next.email = "Enter a valid email address";
    if (!form.password || form.password.length < 8)
      next.password = "Password must be at least 8 characters";
    setErrors(next);
    return Object.keys(next).length === 0;
  }, [form.email, form.password]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isValid) return;
    
    try {
      await onSubmit(form);
    } catch (err) {
      console.error('Login error:', err);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Email"
        name="email"
        type="email"
        placeholder="you@example.com"
        value={form.email}
        onChange={handleChange}
        error={errors.email}
        autoComplete="email"
      />
      <Input
        label="Password"
        name="password"
        type="password"
        placeholder="••••••••"
        value={form.password}
        onChange={handleChange}
        error={errors.password}
        autoComplete="current-password"
      />

      <Button
        type="submit"
        className="w-full"
        loading={isLoading}
        disabled={!isValid}
      >
        Sign in
      </Button>
    </form>
  );
};

export default LoginForm;

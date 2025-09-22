// src/components/Auth/LoginForm.jsx
import React, { useState, useMemo } from "react";
import Button from "../UI/Button";
import Input from "../UI/Input";
// If you already have a context, keep this import. Otherwise remove and pass handlers via props.
import { useAuth } from "../../context/AuthContext";

const emailRegex =
  /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;

const LoginForm = ({
  onSuccess,          // optional callback(user)
  onError,            // optional callback(errorMessage)
  onSubmit,           // optional external submit handler (page-level)
  isLoading = false,  // optional external loading state
  redirectTo = "/",   // where to go after login (if your AuthContext handles navigation)
}) => {
  const { login, loading: authLoading } = useAuth?.() || {};
  const [form, setForm] = useState({ email: "", password: "", remember: true });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState("");

  const isValid = useMemo(() => {
    const next = {};
    if (!emailRegex.test(form.email)) next.email = "Enter a valid email address";
    if (!form.password || form.password.length < 8)
      next.password = "Password must be at least 8 characters";
    setErrors(next);
    return Object.keys(next).length === 0;
  }, [form.email, form.password]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === "checkbox" ? checked : value }));
    setServerError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isValid) return;
    try {
      setSubmitting(true);
      setServerError("");
      // If an external submit handler is provided (e.g., page handles navigation), use it
      if (typeof onSubmit === 'function') {
        await onSubmit({ email: form.email, password: form.password, remember: form.remember });
        return;
      }
      if (login) {
        const result = await login({ email: form.email, password: form.password });
        if (result?.otpRequired) {
          // Let the page handle navigation when using external handler.
          // If no external handler, surface a generic message.
          setServerError("Check your email for the OTP to continue.");
          return;
        }
        if (result.success) {
          onSuccess?.(result.user);
        } else {
          setServerError(result.error);
          onError?.(result.error);
        }
      } else {
        // Fallback if you don't have AuthContext wired yet
        await new Promise((r) => setTimeout(r, 800));
        onSuccess?.({ email: form.email });
      }
    } catch (err) {
      const msg = err?.message || "Unable to sign in. Please try again.";
      setServerError(msg);
      onError?.(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto rounded-2xl bg-white dark:bg-gray-900 shadow-xl border border-gray-200 dark:border-gray-800 p-6">
      <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-1">
        Welcome back
      </h2>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
        Sign in to continue collaborating.
      </p>

      {serverError && (
        <div className="mb-4 rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-700/40 dark:bg-red-900/30 dark:text-red-200">
          {serverError}
        </div>
      )}

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

        <div className="flex items-center justify-between">
          <label className="inline-flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
            <input
              type="checkbox"
              name="remember"
              checked={form.remember}
              onChange={handleChange}
              className="h-4 w-4 rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500"
            />
            Remember me
          </label>
          <a
            href="/forgot-password"
            className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
          >
            Forgot password?
          </a>
        </div>

        <Button
          type="submit"
          className="w-full"
          loading={submitting || authLoading || isLoading}
          disabled={!isValid}
        >
          Sign in
        </Button>
      </form>

      <p className="mt-6 text-sm text-gray-600 dark:text-gray-400">
        Don’t have an account?{" "}
        <a
          href="/register"
          className="font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
        >
          Create one
        </a>
      </p>
    </div>
  );
};

export default LoginForm;

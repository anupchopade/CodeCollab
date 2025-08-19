// src/components/Auth/RegisterForm.jsx
import React, { useMemo, useState } from "react";
import Button from "../UI/Button";
import Input from "../UI/Input";
import { useAuth } from "../../context/AuthContext";

const emailRegex =
  /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;

const passwordStrength = (pwd = "") => {
  let score = 0;
  if (pwd.length >= 8) score++;
  if (/[A-Z]/.test(pwd)) score++;
  if (/[a-z]/.test(pwd)) score++;
  if (/\d/.test(pwd)) score++;
  if (/[^A-Za-z0-9]/.test(pwd)) score++;
  return Math.min(score, 4); // 0..4
};

const StrengthBar = ({ value }) => {
  const bars = Array.from({ length: 4 });
  const colors = ["bg-red-500", "bg-yellow-500", "bg-amber-500", "bg-green-500"];
  return (
    <div className="mt-1 flex gap-1">
      {bars.map((_, i) => (
        <div
          key={i}
          className={`h-1.5 flex-1 rounded ${i < value ? colors[value - 1] : "bg-gray-300 dark:bg-gray-700"}`}
        />
      ))}
    </div>
  );
};

const RegisterForm = ({ onSuccess, onError, redirectTo = "/dashboard" }) => {
  const { register: registerUser, loading: authLoading } = useAuth?.() || {};
  const [form, setForm] = useState({
    email: "",
    password: "",
    confirm: "",
    terms: false,
  });
  const [serverError, setServerError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const errors = useMemo(() => {
    const e = {};
    if (!emailRegex.test(form.email)) e.email = "Enter a valid email address";
    if (form.password.length < 8)
      e.password = "Password must be at least 8 characters";
    if (form.confirm !== form.password) e.confirm = "Passwords do not match";
    if (!form.terms) e.terms = "You must accept the Terms to continue";
    return e;
  }, [form]);

  const strength = passwordStrength(form.password);
  const isValid = Object.keys(errors).length === 0;

  const handleChange = (e) => {
    const { name, type, value, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === "checkbox" ? checked : value }));
    setServerError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isValid) return;
    try {
      setSubmitting(true);
      setServerError("");
      if (registerUser) {
        const user = await registerUser(form.email, form.password, { redirectTo });
        onSuccess?.(user);
      } else {
        await new Promise((r) => setTimeout(r, 800));
        onSuccess?.({ email: form.email });
      }
    } catch (err) {
      const msg = err?.message || "Registration failed. Please try again.";
      setServerError(msg);
      onError?.(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto rounded-2xl bg-white dark:bg-gray-900 shadow-xl border border-gray-200 dark:border-gray-800 p-6">
      <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-1">
        Create your account
      </h2>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
        Join CodeCollab and start building together.
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

        <div>
          <Input
            label="Password"
            name="password"
            type="password"
            placeholder="Create a strong password"
            value={form.password}
            onChange={handleChange}
            error={errors.password}
            autoComplete="new-password"
          />
          <StrengthBar value={strength} />
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Use 8+ characters with a mix of letters, numbers & symbols.
          </p>
        </div>

        <Input
          label="Confirm password"
          name="confirm"
          type="password"
          placeholder="Re-enter your password"
          value={form.confirm}
          onChange={handleChange}
          error={errors.confirm}
          autoComplete="new-password"
        />

        <label className="flex items-start gap-3 text-sm text-gray-700 dark:text-gray-300">
          <input
            type="checkbox"
            name="terms"
            checked={form.terms}
            onChange={handleChange}
            className="mt-0.5 h-4 w-4 rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500"
          />
          <span>
            I agree to the{" "}
            <a href="/terms" className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300">
              Terms of Service
            </a>{" "}
            and{" "}
            <a href="/privacy" className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300">
              Privacy Policy
            </a>.
          </span>
        </label>
        {errors.terms && (
          <span className="text-xs text-red-500">{errors.terms}</span>
        )}

        <Button
          type="submit"
          className="w-full"
          loading={submitting || authLoading}
          disabled={!isValid}
        >
          Create account
        </Button>
      </form>

      <p className="mt-6 text-sm text-gray-600 dark:text-gray-400">
        Already have an account?{" "}
        <a
          href="/login"
          className="font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
        >
          Sign in
        </a>
      </p>
    </div>
  );
};

export default RegisterForm;

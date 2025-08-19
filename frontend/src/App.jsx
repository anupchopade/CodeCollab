import React, { useState } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";

import ThemeToggle from "./components/UI/ThemeToggle";
import Button from "./components/UI/Button";
import Toast from "./components/UI/Toast";

import LoginForm from "./components/Auth/LoginForm";
import RegisterForm from "./components/Auth/RegisterForm";
import UserProfile from "./components/Auth/UserProfile";

const Tabs = ({ active, onChange }) => (
  <div className="flex gap-2 rounded-xl bg-white/70 dark:bg-gray-900/60 backdrop-blur border border-gray-200 dark:border-gray-800 p-1 w-full max-w-md mx-auto">
    {[
      { key: "login", label: "Login" },
      { key: "register", label: "Register" },
      { key: "profile", label: "Profile" },
    ].map((t) => (
      <button
        key={t.key}
        onClick={() => onChange(t.key)}
        className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium transition
        ${active === t.key
          ? "bg-blue-600 text-white shadow"
          : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"}`}
      >
        {t.label}
      </button>
    ))}
  </div>
);

const DemoScreen = () => {
  const [tab, setTab] = useState("login");
  const [toast, setToast] = useState(null);
  const { user, logout } = useAuth();

  const handleSuccess = (u, action = "Signed in") => {
    setToast({ message: `${action} as ${u?.email}`, type: "success" });
    setTab("profile");
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100">
      <header className="sticky top-0 z-10 border-b border-gray-200/70 dark:border-gray-800/70 bg-white/70 dark:bg-gray-950/70 backdrop-blur">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-blue-600" />
            <h1 className="text-lg font-semibold">CodeCollab – Auth Demo</h1>
          </div>
          <div className="flex items-center gap-2">
            {user && (
              <Button variant="secondary" size="sm" onClick={logout}>
                Logout
              </Button>
            )}
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-10">
        <Tabs active={tab} onChange={setTab} />

        <div className="mt-8">
          {tab === "login" && (
            <LoginForm onSuccess={(u) => handleSuccess(u, "Signed in")} />
          )}

          {tab === "register" && (
            <RegisterForm onSuccess={(u) => handleSuccess(u, "Registered")} />
          )}

          {tab === "profile" && (
            user ? (
              <UserProfile />
            ) : (
              <div className="w-full max-w-md mx-auto text-center rounded-2xl bg-white dark:bg-gray-900 shadow-xl border border-gray-200 dark:border-gray-800 p-8">
                <p className="text-gray-600 dark:text-gray-400">
                  You’re not logged in. Choose a tab above to sign in or create an account.
                </p>
                <div className="mt-6 flex gap-3 justify-center">
                  <Button onClick={() => setTab("login")}>Go to Login</Button>
                  <Button variant="secondary" onClick={() => setTab("register")}>
                    Go to Register
                  </Button>
                </div>
              </div>
            )
          )}
        </div>
      </main>

      {toast && (
        <div className="fixed bottom-4 right-4">
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
            duration={2500}
          />
        </div>
      )}
    </div>
  );
};

const App = () => (
  <AuthProvider>
    <DemoScreen />
  </AuthProvider>
);

export default App;

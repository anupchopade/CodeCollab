// src/components/Auth/UserProfile.jsx
import React from "react";
import Button from "../UI/Button";
import { useAuth } from "../../context/AuthContext";

const InitialsAvatar = ({ name = "", size = 48 }) => {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div
      className="flex items-center justify-center rounded-full bg-blue-600 text-white"
      style={{ width: size, height: size, fontSize: size * 0.4 }}
    >
      {initials || "U"}
    </div>
  );
};

const InfoRow = ({ label, value }) => (
  <div className="flex items-center justify-between py-2">
    <span className="text-sm text-gray-600 dark:text-gray-400">{label}</span>
    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
      {value || "—"}
    </span>
  </div>
);

const UserProfile = ({ className = "" }) => {
  const { user, logout } = useAuth();

  return (
    <div
      className={`w-full max-w-xl mx-auto rounded-2xl bg-white dark:bg-gray-900 shadow-xl border border-gray-200 dark:border-gray-800 p-6 ${className}`}
    >
      <div className="flex items-center gap-4">
        {user?.avatar ? (
          <img
            src={user.avatar}
            alt={user?.name || user?.email}
            className="h-12 w-12 rounded-full object-cover"
          />
        ) : (
          <InitialsAvatar name={user?.name || user?.email} />
        )}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {user?.name || "Your profile"}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {user?.email}
          </p>
        </div>
      </div>

      <div className="mt-6 divide-y divide-gray-200 dark:divide-gray-800">
        <InfoRow label="Role" value={user?.role || "User"} />
        <InfoRow
          label="Member since"
          value={
            user?.createdAt
              ? new Date(user.createdAt).toLocaleDateString()
              : "—"
          }
        />
      </div>

      <div className="mt-6 flex items-center gap-3">
        <Button variant="secondary" onClick={() => (window.location.href = "/settings")}>
          Edit profile
        </Button>
        <Button variant="danger" onClick={logout}>
          Log out
        </Button>
      </div>
    </div>
  );
};

export default UserProfile;

import React from "react";
import { Bell, User } from "lucide-react";

const Header = () => {
  return (
    <header className="h-16 flex items-center justify-between px-4 bg-white dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800">
      <h1 className="text-lg font-semibold">Dashboard</h1>

      <div className="flex items-center gap-4">
        <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800">
          <Bell size={18} />
        </button>
        <button className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
          <User size={18} />
          <span className="hidden sm:inline">Profile</span>
        </button>
      </div>
    </header>
  );
};

export default Header;

import React from "react";
import { Home, Folder, Settings, Users } from "lucide-react";
import { Link } from "react-router-dom";

const Sidebar = () => {
  const navItems = [
    { icon: <Home size={18} />, label: "Dashboard", href: "/" },
    { icon: <Folder size={18} />, label: "Projects", href: "/projects" },
    { icon: <Users size={18} />, label: "Teams", href: "/teams" },
    { icon: <Settings size={18} />, label: "Settings", href: "/settings" },
  ];

  return (
    <aside className="w-64 bg-white dark:bg-gray-950 border-r border-gray-200 dark:border-gray-800 flex flex-col">
      <div className="h-16 flex items-center justify-center font-bold text-lg">
        🚀 SaaS IDE
      </div>
      <nav className="flex-1 px-2 space-y-1">
        {navItems.map((item, idx) => (
          <Link
            key={idx}
            to={item.href}
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            {item.icon}
            {item.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;

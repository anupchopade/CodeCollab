import React from "react";

const Footer = () => {
  return (
    <footer className="h-12 flex items-center justify-center text-xs border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950">
      © {new Date().getFullYear()} SaaS IDE. All rights reserved.
    </footer>
  );
};

export default Footer;

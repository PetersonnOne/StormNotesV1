'use client'

import React from 'react';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  return (
    <footer className="bg-gray-800/50 border-t border-gray-700">
      <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
        <p className="text-center text-sm text-gray-400">
          &copy; {currentYear} Storm Notes By EveryDay LM. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;

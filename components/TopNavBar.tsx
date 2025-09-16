'use client'

import React from 'react';
import {
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from '@clerk/nextjs';

interface TopNavBarProps {
  onGetStarted: () => void;
  onLogoClick: () => void;
}

const TopNavBar: React.FC<TopNavBarProps> = ({ onGetStarted, onLogoClick }) => {
  return (
    <header className="relative z-10 py-4 px-4 sm:px-6 lg:px-8 border-b border-gray-800">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <button onClick={onLogoClick} className="flex items-center gap-3 cursor-pointer">
          <img src="/StormNotesLogoTM.png" alt="Storm Notes Logo" className="w-10 h-10 rounded-md object-contain" />
          <span className="text-xl font-bold text-white tracking-wider">STORM NOTES</span>
        </button>
        
        <div className="flex items-center gap-4">
          <SignedOut>
            <SignInButton>
              <button className="bg-gray-700 hover:bg-gray-600 text-white font-medium py-2 px-4 rounded-md transition-colors">
                Sign In
              </button>
            </SignInButton>
            <SignUpButton>
              <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md transition-colors">
                Get Started
              </button>
            </SignUpButton>
          </SignedOut>
          
          <SignedIn>
            <button
              onClick={onGetStarted}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-5 rounded-md transition-colors"
            >
              Get Started
            </button>
            <UserButton 
              appearance={{
                elements: {
                  avatarBox: "w-10 h-10"
                }
              }}
            />
          </SignedIn>
        </div>
      </div>
    </header>
  );
};

export default TopNavBar;
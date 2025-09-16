'use client'

import React from 'react';
import { SignedIn, SignedOut, SignInButton } from '@clerk/nextjs';

interface ProtectedRouteProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  fallback 
}) => {
  const defaultFallback = (
    <div className="min-h-screen bg-gray-900 text-gray-100 flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-4">Authentication Required</h2>
        <p className="text-gray-400 mb-6">Please sign in to access this feature.</p>
        <SignInButton>
          <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-md transition-colors">
            Sign In
          </button>
        </SignInButton>
      </div>
    </div>
  );

  return (
    <>
      <SignedIn>
        {children}
      </SignedIn>
      <SignedOut>
        {fallback || defaultFallback}
      </SignedOut>
    </>
  );
};

export default ProtectedRoute;


'use client'

import React from 'react';

interface AmbiguityResolverProps {
  query: string;
  options: string[];
  onResolve: (selection: string) => void;
  onCancel: () => void;
}

const AmbiguityResolver: React.FC<AmbiguityResolverProps> = ({ query, options, onResolve, onCancel }) => {
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 max-w-md w-full shadow-2xl">
        <h2 className="text-xl font-bold mb-2 text-white">Ambiguous Location</h2>
        <p className="text-gray-400 mb-4">Your search for "{query}" returned multiple results. Please select the correct one.</p>
        <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
          {options.map(option => (
            <button
              key={option}
              onClick={() => onResolve(option)}
              className="w-full text-left p-3 bg-gray-700 hover:bg-blue-600 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {option}
            </button>
          ))}
        </div>
        <button
          onClick={onCancel}
          className="w-full mt-4 p-2 bg-gray-600 hover:bg-gray-500 text-white font-semibold rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default AmbiguityResolver;

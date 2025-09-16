'use client'

import React from 'react';

interface GetStartedModalProps {
  onClose: () => void;
  onSelect: (view: 'content' | 'productivity') => void;
}

const ContentIcon = () => (
    <svg viewBox="0 0 100 80" className="w-full h-32 text-indigo-300">
        <defs>
            <linearGradient id="contentGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{stopColor: 'currentColor', stopOpacity: 0.8}} />
            <stop offset="100%" style={{stopColor: 'currentColor', stopOpacity: 0.4}} />
            </linearGradient>
        </defs>
        <path d="M20,70 Q40,85 50,60 T80,70" stroke="url(#contentGrad)" fill="none" strokeWidth="2" strokeLinecap="round"/>
        <path d="M15,55 Q30,40 50,50 T85,45" stroke="url(#contentGrad)" fill="none" strokeWidth="2" strokeLinecap="round"/>
        <rect x="10" y="10" width="80" height="60" rx="5" fill="none" stroke="currentColor" strokeWidth="1"/>
        <path d="M25,25 h30" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        <path d="M25,35 h45" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        <path d="M75 15 L 70 30 L 80 30 Z" fill="currentColor" opacity="0.6"/>
        <circle cx="20" cy="18" r="3" fill="currentColor" opacity="0.5"/>
    </svg>
);

const ProductivityIcon = () => (
    <svg viewBox="0 0 100 80" className="w-full h-32 text-sky-300">
        <defs>
            <linearGradient id="prodGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{stopColor: 'currentColor', stopOpacity: 0.8}} />
            <stop offset="100%" style={{stopColor: 'currentColor', stopOpacity: 0.4}} />
            </linearGradient>
        </defs>
        <circle cx="50" cy="40" r="25" fill="none" stroke="currentColor" strokeWidth="1"/>
        <path d="M50,40 L50,25" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        <path d="M50,40 L65,45" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        <path d="M15,15 L25,15" stroke="url(#prodGrad)" strokeWidth="3" strokeLinecap="round"/>
        <path d="M10,20 L15,25 L25,15" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M15,35 L25,35" stroke="url(#prodGrad)" strokeWidth="3" strokeLinecap="round"/>
        <path d="M10,40 L15,45 L25,35" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M80,60 L90,70 L70,70 Z" fill="currentColor" opacity="0.6" transform="rotate(15, 80, 60)"/>
    </svg>
);

const GetStartedModal: React.FC<GetStartedModalProps> = ({ onClose, onSelect }) => {
  return (
    <div 
        className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 animate-fade-in"
        onClick={onClose}
    >
      <div 
        className="bg-gray-800 border border-gray-700 rounded-lg p-6 sm:p-8 max-w-2xl w-full shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-white">Choose Your Path</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-white">&times;</button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            <div 
                onClick={() => onSelect('content')}
                className="bg-gray-900/50 p-6 rounded-lg border border-gray-700 hover:border-indigo-500 hover:bg-indigo-900/20 cursor-pointer transition-all group"
            >
                <ContentIcon />
                <h3 className="text-xl font-semibold text-white mt-4 group-hover:text-indigo-300">Content</h3>
                <p className="text-sm text-gray-400 mt-1">Generate text, brainstorm ideas, and create images with powerful AI tools.</p>
            </div>
            
            <div 
                onClick={() => onSelect('productivity')}
                className="bg-gray-900/50 p-6 rounded-lg border border-gray-700 hover:border-sky-500 hover:bg-sky-900/20 cursor-pointer transition-all group"
            >
                <ProductivityIcon />
                <h3 className="text-xl font-semibold text-white mt-4 group-hover:text-sky-300">Productivity</h3>
                <p className="text-sm text-gray-400 mt-1">Manage timezones, analyze documents, set reminders, and streamline your workflows.</p>
            </div>
        </div>
      </div>
    </div>
  );
};

export default GetStartedModal;

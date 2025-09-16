'use client'

import React, { useState } from 'react';
import { PlusIcon, SpinnerIcon } from '@/components/icons';

interface AddZoneFormProps {
  onAddTimezone: (location: string) => void;
  isLoading: boolean;
}

const AddZoneForm: React.FC<AddZoneFormProps> = ({ onAddTimezone, isLoading }) => {
  const [location, setLocation] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (location.trim() && !isLoading) {
      onAddTimezone(location.trim());
      setLocation('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 items-center">
      <input
        type="text"
        value={location}
        onChange={(e) => setLocation(e.target.value)}
        placeholder="Enter a city or timezone (e.g., London, PST)..."
        className="flex-grow bg-gray-800 border border-gray-700 rounded-md py-2 px-4 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-shadow"
        disabled={isLoading}
      />
      <button
        type="submit"
        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md flex items-center gap-2 transition-colors disabled:bg-blue-800 disabled:cursor-not-allowed"
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <SpinnerIcon className="w-5 h-5 animate-spin" />
            Adding...
          </>
        ) : (
          <>
            <PlusIcon className="w-5 h-5" />
            Add
          </>
        )}
      </button>
    </form>
  );
};

export default AddZoneForm;

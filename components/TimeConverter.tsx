'use client'

import React, { useState } from 'react';
import { convertTime } from '@/services/geminiService';
import { GroundingSource } from '@/types';
import { ConvertIcon, SpinnerIcon, LinkIcon } from '@/components/icons';

interface TimeConverterProps {
    showToast: (message: string, type: 'success' | 'error') => void;
}

interface ConversionResult {
    convertedTime: string;
    explanation: string;
}

const TimeConverter: React.FC<TimeConverterProps> = ({ showToast }) => {
  const [dateTime, setDateTime] = useState(new Date().toISOString().slice(0, 16));
  const [fromZone, setFromZone] = useState('UTC');
  const [toZone, setToZone] = useState('America/New_York');
  const [result, setResult] = useState<ConversionResult | null>(null);
  const [sources, setSources] = useState<GroundingSource[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleConvert = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setResult(null);
    setSources([]);

    try {
      const { convertedTime, explanation, groundingSources } = await convertTime(dateTime, fromZone, toZone);
      setResult({ convertedTime, explanation });
      setSources(groundingSources);
      showToast('Time converted successfully!', 'success');
    } catch (error) {
      console.error(error);
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
      showToast(`Conversion failed: ${errorMessage}`, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 bg-gray-800 rounded-lg max-w-2xl mx-auto border border-gray-700">
      <h2 className="text-2xl font-bold mb-4 flex items-center gap-3"><ConvertIcon className="w-6 h-6"/> Global Time Converter</h2>
      <form onSubmit={handleConvert} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Date & Time</label>
                <input type="datetime-local" value={dateTime} onChange={e => setDateTime(e.target.value)} className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 focus:ring-2 focus:ring-blue-500 focus:outline-none" required />
            </div>
             <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">From Timezone</label>
                <input type="text" value={fromZone} onChange={e => setFromZone(e.target.value)} placeholder="e.g., Europe/London" className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 focus:ring-2 focus:ring-blue-500 focus:outline-none" required />
            </div>
             <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">To Timezone</label>
                <input type="text" value={toZone} onChange={e => setToZone(e.target.value)} placeholder="e.g., Asia/Tokyo" className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 focus:ring-2 focus:ring-blue-500 focus:outline-none" required />
            </div>
        </div>
        <button type="submit" disabled={isLoading} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md flex items-center justify-center gap-2 transition-colors disabled:bg-blue-800 disabled:cursor-not-allowed">
          {isLoading ? <><SpinnerIcon className="w-5 h-5 animate-spin"/> Converting...</> : <><ConvertIcon className="w-5 h-5"/> Convert Time</>}
        </button>
      </form>
      {result && (
        <div className="mt-6 space-y-6">
            <div className="p-6 bg-gray-900 rounded-lg border border-blue-500/50 text-center">
                <p className="text-lg text-gray-400">Converted Time in {toZone}</p>
                <p className="text-5xl font-mono tracking-wider text-blue-300 mt-2">
                    {result.convertedTime.split(' ')[1]}
                </p>
                <p className="text-xl text-gray-300 mt-1">
                    {result.convertedTime.split(' ')[0]}
                </p>
            </div>

            <div className="p-4 bg-gray-900/50 rounded-md border border-gray-600">
                <h3 className="font-semibold text-md text-blue-300">Conversion Details:</h3>
                <p className="text-sm text-gray-300 whitespace-pre-wrap mt-2">{result.explanation}</p>
                {sources.length > 0 && (
                    <div className="mt-4 border-t border-gray-700 pt-3">
                        <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2 flex items-center gap-1.5"><LinkIcon className="w-4 h-4"/> Sources</h4>
                        <div className="flex flex-col space-y-1">
                            {sources.map((source, index) => (
                                <a href={source.uri} key={index} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-400 hover:underline truncate" title={source.title}>
                                    {source.title}
                                </a>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
      )}
    </div>
  );
};

export default TimeConverter;
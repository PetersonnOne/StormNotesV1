
'use client'

import React from 'react';
import { TimezoneCardData } from '@/types';
import { useLiveTime } from '@/hooks/useLiveTime';
import { TrashIcon, LinkIcon, InfoIcon } from '@/components/icons';

interface TimezoneCardProps {
  data: TimezoneCardData;
  onDelete: (id: string) => void;
}

const TimezoneCard: React.FC<TimezoneCardProps> = ({ data, onDelete }) => {
  const currentTime = useLiveTime(data.initialTime);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="bg-gray-800 rounded-lg p-5 shadow-lg flex flex-col justify-between border border-gray-700 hover:border-blue-500 transition-all duration-300">
      <div>
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-xl font-bold text-white">{data.location}</h3>
            <p className="text-sm text-gray-400">{data.timezone}</p>
          </div>
          <button onClick={() => onDelete(data.id)} className="text-gray-500 hover:text-red-500 transition-colors p-1">
            <TrashIcon className="w-5 h-5" />
          </button>
        </div>

        <div className="my-6 text-center">
          <p className="text-5xl font-mono tracking-wider text-blue-300">
            {formatTime(currentTime)}
          </p>
          <p className="text-gray-300 mt-2">{formatDate(currentTime)}</p>
        </div>

        <div className="flex justify-between items-center text-sm text-gray-400 border-t border-gray-700 pt-3">
          <span>UTC {data.utcOffset}</span>
          <div className="flex items-center gap-2">
             <span className={`font-semibold px-2 py-0.5 rounded-full text-xs ${data.isDst ? 'bg-yellow-500/20 text-yellow-300' : 'bg-gray-600 text-gray-300'}`}>
                {data.isDst ? 'DST Active' : 'Standard Time'}
             </span>
             <div className="relative group cursor-pointer">
                <InfoIcon className="w-4 h-4 text-gray-500" />
                <div className="absolute bottom-full right-0 mb-2 w-48 p-2 text-xs text-center text-white bg-gray-900 border border-gray-600 rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                    {data.dstInfo}
                </div>
            </div>
          </div>
        </div>
      </div>

      {data.groundingSources.length > 0 && (
          <div className="mt-4 border-t border-gray-700 pt-3">
              <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2 flex items-center gap-1.5"><LinkIcon className="w-4 h-4"/> Sources</h4>
              <div className="flex flex-col space-y-1">
                  {data.groundingSources.slice(0, 2).map((source, index) => (
                      <a href={source.uri} key={index} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-400 hover:underline truncate" title={source.title}>
                          {source.title}
                      </a>
                  ))}
              </div>
          </div>
      )}
    </div>
  );
};

export default TimezoneCard;

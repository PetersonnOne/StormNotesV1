'use client'

import React, { useState, useEffect } from 'react';
import { getReminderDelay } from '@/services/geminiService';
import { Reminder, TimezoneCardData } from '@/types';
import { BellIcon, SpinnerIcon, TrashIcon, EmailIcon } from '@/components/icons';

interface ReminderSchedulerProps {
  timezoneCards: TimezoneCardData[];
  showToast: (message: string, type: 'success' | 'error') => void;
  onReminderFired: (reminder: Reminder) => void;
}

const ReminderScheduler: React.FC<ReminderSchedulerProps> = ({ timezoneCards, showToast, onReminderFired }) => {
  const [message, setMessage] = useState('');
  const [recipientEmail, setRecipientEmail] = useState('');
  const [dateTime, setDateTime] = useState(new Date(Date.now() + 60000).toISOString().slice(0, 16));
  const [selectedZone, setSelectedZone] = useState<string>(timezoneCards.length > 0 ? timezoneCards[0].timezone : 'UTC');
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Calculate minimum datetime (1 minute from now)
  const getMinDateTime = () => {
    return new Date(Date.now() + 60000).toISOString().slice(0, 16);
  };

  useEffect(() => {
    if (timezoneCards.length > 0 && !timezoneCards.some(tz => tz.timezone === selectedZone)) {
      setSelectedZone(timezoneCards[0].timezone);
    }
  }, [timezoneCards, selectedZone]);

  const handleSetReminder = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate that the selected date is at least 1 minute in the future
    const selectedDateTime = new Date(dateTime);
    const minDateTime = new Date(Date.now() + 60000);
    
    if (selectedDateTime <= minDateTime) {
      showToast('Please select a date and time at least 1 minute in the future.', 'error');
      return;
    }
    
    setIsLoading(true);
    try {
      const delay = await getReminderDelay(dateTime, selectedZone);
      const fireDate = new Date(Date.now() + delay);
      const newReminder: Reminder = {
        id: new Date().toISOString(),
        message,
        recipientEmail,
        fireDate,
        location: selectedZone,
      };

      setTimeout(() => {
        onReminderFired(newReminder);
        setReminders(prev => prev.filter(r => r.id !== newReminder.id));
      }, delay);
      
      setReminders(prev => [...prev, newReminder].sort((a, b) => a.fireDate.getTime() - b.fireDate.getTime()));
      setMessage('');
      setRecipientEmail('');
      showToast('Reminder set! An email will be sent at the scheduled time.', 'success');
    } catch (error) {
      console.error(error);
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
      showToast(`Failed to set reminder: ${errorMessage}`, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const deleteReminder = (id: string) => {
    setReminders(reminders.filter(r => r.id !== id));
    showToast('Reminder removed.', 'success');
  }

  return (
    <div className="p-6 bg-gray-800 rounded-lg max-w-2xl mx-auto border border-gray-700">
      <h2 className="text-2xl font-bold mb-4 flex items-center gap-3"><BellIcon className="w-6 h-6"/> Email Reminder Scheduler</h2>
      <div className="text-sm bg-blue-900/50 border border-blue-700 text-blue-200 p-3 rounded-md mb-4">
        <strong>Note:</strong> Reminders trigger an email notification via Resend. This requires the page to remain open.
      </div>
      <form onSubmit={handleSetReminder} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Reminder Message</label>
          <input type="text" value={message} onChange={e => setMessage(e.target.value)} placeholder="e.g., Team meeting" className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 focus:ring-2 focus:ring-blue-500 focus:outline-none" required />
        </div>

         <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Recipient Email</label>
            <div className="relative">
                 <EmailIcon className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
                <input type="email" value={recipientEmail} onChange={e => setRecipientEmail(e.target.value)} placeholder="recipient@example.com" className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 pl-10 focus:ring-2 focus:ring-blue-500 focus:outline-none" required />
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Date & Time</label>
            <input 
              type="datetime-local" 
              value={dateTime} 
              onChange={e => setDateTime(e.target.value)} 
              min={getMinDateTime()}
              className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 focus:ring-2 focus:ring-blue-500 focus:outline-none" 
              required 
            />
            <p className="text-xs text-gray-400 mt-1">Must be at least 1 minute in the future</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Timezone</label>
            <select value={selectedZone} onChange={e => setSelectedZone(e.target.value)} className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 focus:ring-2 focus:ring-blue-500 focus:outline-none" required disabled={timezoneCards.length === 0}>
              {timezoneCards.length === 0 ? (
                <option>Add a card first</option>
              ) : (
                timezoneCards.map(tz => <option key={tz.id} value={tz.timezone}>{tz.location} ({tz.timezone})</option>)
              )}
               <option value="UTC">UTC</option>
            </select>
          </div>
        </div>
        <button type="submit" disabled={isLoading || timezoneCards.length === 0} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md flex items-center justify-center gap-2 transition-colors disabled:bg-blue-800 disabled:cursor-not-allowed">
          {isLoading ? <><SpinnerIcon className="w-5 h-5 animate-spin"/> Setting...</> : <><BellIcon className="w-5 h-5"/> Set Reminder</>}
        </button>
      </form>
      {reminders.length > 0 && (
          <div className="mt-6">
              <h3 className="text-lg font-semibold border-b border-gray-700 pb-2 mb-3">Pending Reminders</h3>
              <ul className="space-y-2">
                  {reminders.map(r => (
                      <li key={r.id} className="flex justify-between items-center p-3 bg-gray-900/50 rounded-md">
                          <div>
                              <p className="font-medium">{r.message}</p>
                              <p className="text-sm text-gray-400">
                                  To: {r.recipientEmail} at {r.fireDate.toLocaleString()} ({r.location})
                              </p>
                          </div>
                          <button onClick={() => deleteReminder(r.id)} className="text-gray-500 hover:text-red-500"><TrashIcon className="w-5 h-5" /></button>
                      </li>
                  ))}
              </ul>
          </div>
      )}
    </div>
  );
};

export default ReminderScheduler;
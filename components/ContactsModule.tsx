'use client'

import React, { useState } from 'react';
import { Contact } from '@/types';
import { UsersIcon, PlusIcon, SpinnerIcon, TrashIcon, EmailIcon } from '@/components/icons';

interface ContactsModuleProps {
  contacts: Contact[];
  onAddContact: (name: string, email: string) => Promise<boolean>;
  onDeleteContact: (id: string) => void;
}

const ContactsModule: React.FC<ContactsModuleProps> = ({ contacts, onAddContact, onDeleteContact }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;
    setIsLoading(true);
    const success = await onAddContact(name, email);
    if (success) {
      setName('');
      setEmail('');
    }
    setIsLoading(false);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="p-6 bg-gray-800 rounded-lg border border-gray-700">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
          <UsersIcon className="w-6 h-6" /> Contact List
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Name</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="e.g., Jane Doe" className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 focus:ring-2 focus:ring-blue-500 focus:outline-none" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Email</label>
               <div className="relative">
                 <EmailIcon className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
                 <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="e.g., jane.doe@example.com" className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 pl-10 px-3 focus:ring-2 focus:ring-blue-500 focus:outline-none" required />
              </div>
            </div>
          </div>
          <button type="submit" disabled={isLoading} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md flex items-center justify-center gap-2 transition-colors disabled:bg-blue-800 disabled:cursor-not-allowed">
            {isLoading ? <><SpinnerIcon className="w-5 h-5 animate-spin" /> Adding...</> : <><PlusIcon className="w-5 h-5" /> Add Contact</>}
          </button>
        </form>
      </div>
      
      <div className="mt-8">
        {contacts.length === 0 ? (
          <div className="text-center text-gray-400 p-6 bg-gray-800/50 rounded-lg border border-dashed border-gray-700">
            <h3 className="text-lg font-semibold">No Contacts Yet</h3>
            <p className="mt-1 text-sm">Add a contact using the form above to get started.</p>
          </div>
        ) : (
          <ul className="space-y-3">
            {contacts.map(contact => (
              <li key={contact.id} className="flex justify-between items-center p-4 bg-gray-800 rounded-lg border border-gray-700">
                <div>
                  <p className="font-semibold text-white">{contact.name}</p>
                  <p className="text-sm text-gray-400">{contact.email}</p>
                </div>
                <button onClick={() => onDeleteContact(contact.id)} className="text-gray-500 hover:text-red-500 p-2 rounded-full hover:bg-gray-700 transition-colors">
                  <TrashIcon className="w-5 h-5" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default ContactsModule;

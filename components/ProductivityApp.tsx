'use client'

import React, { useState, useCallback, useEffect } from 'react';
import { TimezoneCardData, AppSection, ToastMessage, AmbiguousLocationError, Reminder, Contact, Document } from '@/types';
import { getTimezoneData, composeReminderEmail, analyzeText, composeAnalysisEmail } from '@/services/geminiService';
import { sendEmail } from '@/services/resendService';
import * as apiService from '@/services/apiService';
import AddZoneForm from '@/components/AddZoneForm';
import TimezoneCard from '@/components/TimezoneCard';
import TimeConverter from '@/components/TimeConverter';
import ReminderScheduler from '@/components/ReminderScheduler';
import AmbiguityResolver from '@/components/AmbiguityResolver';
import { WorldIcon, ConvertIcon, BellIcon, InfoIcon, ChatIcon, UsersIcon, CogIcon, ChevronLeftIcon, DatabaseIcon } from '@/components/icons';
import ChatModule from '@/components/ChatModule';
import ContactsModule from '@/components/ContactsModule';
import WorkflowModule from '@/components/WorkflowModule';
import DatabaseModule from '@/components/DatabaseModule';

interface ProductivityAppProps {
  onBack: () => void;
}

const ProductivityApp: React.FC<ProductivityAppProps> = ({ onBack }) => {
  const [activeSection, setActiveSection] = useState<AppSection>(AppSection.Cards);
  const [timezones, setTimezones] = useState<TimezoneCardData[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const [ambiguousLocations, setAmbiguousLocations] = useState<string[] | null>(null);
  const [originalQuery, setOriginalQuery] = useState('');

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const [initialTimezones, initialContacts, initialDocs] = await Promise.all([
          apiService.getTimezoneCards(),
          apiService.getContacts(),
          apiService.getDocuments(),
        ]);
        setTimezones(initialTimezones.map(tz => ({...tz, initialTime: new Date(tz.initialTime)})));
        setContacts(initialContacts);
        setDocuments(initialDocs);
      } catch (error) {
        console.error("Failed to load initial data:", error);
        showToast("Could not load saved data.", "error");
      }
    };
    loadInitialData();
  }, []);


  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const handleAddTimezone = useCallback(async (location: string) => {
    if (timezones.some(tz => tz.location.toLowerCase() === location.toLowerCase())) {
      showToast(`A card for '${location}' already exists.`, 'error');
      return;
    }
    setIsLoading(true);
    setAmbiguousLocations(null);
    try {
      const data = await getTimezoneData(location);
      if (data) {
        const newCard = { ...data, id: new Date().toISOString() };
        await apiService.addTimezoneCard(newCard);
        setTimezones(prev => [...prev, newCard]);
        showToast(`Successfully added card for ${data.location}.`, 'success');
      } else {
        throw new Error('Could not retrieve timezone data.');
      }
    } catch (error) {
      if (error instanceof AmbiguousLocationError) {
          setAmbiguousLocations(error.locations);
          setOriginalQuery(location);
          showToast(`'${location}' is ambiguous. Please clarify.`, 'error');
      } else {
        console.error(error);
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
        showToast(`Failed to add timezone: ${errorMessage}`, 'error');
      }
    } finally {
      setIsLoading(false);
    }
  }, [timezones]);

  const handleDeleteTimezone = useCallback(async (id: string) => {
    try {
        await apiService.deleteTimezoneCard(id);
        setTimezones(prev => prev.filter(tz => tz.id !== id));
        showToast('Timezone card removed.', 'success');
    } catch(error) {
        console.error(error);
        showToast('Failed to remove timezone card.', 'error');
    }
  }, []);

  const handleAddContact = async (name: string, email: string) => {
    try {
      const newContact = await apiService.addContact(name, email);
      setContacts(prev => [...prev, newContact]);
      showToast('Contact added successfully!', 'success');
      return true;
    } catch (error) {
      console.error(error);
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
      showToast(`Failed to add contact: ${errorMessage}`, 'error');
      return false;
    }
  };

  const handleDeleteContact = async (id: string) => {
    try {
      await apiService.deleteContact(id);
      setContacts(prev => prev.filter(c => c.id !== id));
      showToast('Contact deleted.', 'success');
    } catch (error) {
      console.error(error);
      showToast('Failed to delete contact.', 'error');
    }
  };
  
  const handleStartWorkflow = async (fileContent: string, filename: string, contactId: string): Promise<boolean> => {
    const contact = contacts.find(c => c.id === contactId);
    if (!fileContent || !contact) {
      showToast('A valid file and contact must be selected.', 'error');
      return false;
    }

    try {
      // Step 1: Analyze
      const analysis = await analyzeText(fileContent);
      // Step 2: Store
      const newDoc = {
        id: crypto.randomUUID(),
        filename: filename,
        originalText: fileContent,
        ...analysis,
      };
      await apiService.addDocument(newDoc);
      setDocuments(prev => [...prev, newDoc]);
      // Step 3: Compose
      const emailContent = await composeAnalysisEmail(analysis.summary, analysis.sentiment, filename);
      // Step 4: Notify
      await sendEmail(contact.email, emailContent.subject, emailContent.body);
      
      showToast(`Workflow complete! Analysis of '${filename}' sent to ${contact.name}.`, 'success');
      return true;
    } catch (error) {
      console.error(error);
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
      showToast(`Workflow failed: ${errorMessage}`, 'error');
      return false;
    }
  };


  const resolveAmbiguity = (selectedLocation: string) => {
    setAmbiguousLocations(null);
    setOriginalQuery('');
    handleAddTimezone(selectedLocation);
  };

  const handleReminderFired = async (reminder: Reminder) => {
    showToast(`Reminder triggered for "${reminder.message}". Composing email...`, 'success');
    try {
      const composedEmail = await composeReminderEmail(reminder.message, reminder.location);
      showToast('Email composed. Sending via Resend...', 'success');
      await sendEmail(reminder.recipientEmail, composedEmail.subject, composedEmail.body);
      showToast('Email sent successfully!', 'success');
    } catch (error) {
        console.error(error);
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
        showToast(`Failed to send reminder email: ${errorMessage}`, 'error');
    }
  };

  const renderSection = () => {
    switch (activeSection) {
      case AppSection.Converter:
        return <TimeConverter showToast={showToast} />;
      case AppSection.Reminders:
        return <ReminderScheduler timezoneCards={timezones} showToast={showToast} onReminderFired={handleReminderFired} />;
      case AppSection.Chat:
        return <ChatModule showToast={showToast} />;
      case AppSection.Contacts:
        return <ContactsModule contacts={contacts} onAddContact={handleAddContact} onDeleteContact={handleDeleteContact} />;
      case AppSection.Workflow:
        return <WorkflowModule contacts={contacts} onStartWorkflow={handleStartWorkflow} />;
      case AppSection.Database:
        return <DatabaseModule />;
      case AppSection.Cards:
      default:
        return (
          <>
            <AddZoneForm onAddTimezone={handleAddTimezone} isLoading={isLoading} />
            {timezones.length === 0 && !isLoading && (
              <div className="text-center text-gray-400 mt-12 p-6 bg-gray-800/50 rounded-lg border border-dashed border-gray-700">
                <WorldIcon className="w-12 h-12 mx-auto mb-4 text-gray-500" />
                <h3 className="text-lg font-semibold">Your World Clock is Empty</h3>
                <p className="mt-1 text-sm">Add a city or timezone (e.g., "Tokyo", "PST") to get started.</p>
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
              {isLoading && timezones.length === 0 && (
                 <div className="h-48 bg-gray-800 rounded-lg animate-pulse md:col-span-2 lg:col-span-3"></div>
              )}
              {timezones.map(tz => (
                <TimezoneCard key={tz.id} data={tz} onDelete={handleDeleteTimezone} />
              ))}
            </div>
          </>
        );
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
            <button 
                onClick={onBack} 
                className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
            >
                <ChevronLeftIcon className="w-5 h-5" />
                Back to menu
            </button>
        </div>

        <div className="text-center mb-12">
            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">Productivity Suite</h1>
            <p className="mt-4 text-lg text-gray-300">Your intelligent dashboard for time management, contacts, and document workflows.</p>
        </div>

        <div className="mt-8 flex flex-wrap gap-2 border-b border-gray-700 pb-4">
            <button onClick={() => setActiveSection(AppSection.Cards)} className={`px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2 transition-colors ${activeSection === AppSection.Cards ? 'bg-blue-600 text-white' : 'bg-gray-800 hover:bg-gray-700'}`}>
                <WorldIcon className="w-5 h-5" /> Time Zone Cards
            </button>
            <button onClick={() => setActiveSection(AppSection.Converter)} className={`px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2 transition-colors ${activeSection === AppSection.Converter ? 'bg-blue-600 text-white' : 'bg-gray-800 hover:bg-gray-700'}`}>
                <ConvertIcon className="w-5 h-5" /> Converter
            </button>
            <button onClick={() => setActiveSection(AppSection.Reminders)} className={`px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2 transition-colors ${activeSection === AppSection.Reminders ? 'bg-blue-600 text-white' : 'bg-gray-800 hover:bg-gray-700'}`}>
                <BellIcon className="w-5 h-5" /> Reminders
            </button>
            <button onClick={() => setActiveSection(AppSection.Chat)} className={`px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2 transition-colors ${activeSection === AppSection.Chat ? 'bg-blue-600 text-white' : 'bg-gray-800 hover:bg-gray-700'}`}>
                <ChatIcon className="w-5 h-5" /> Chat
            </button>
            <button onClick={() => setActiveSection(AppSection.Contacts)} className={`px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2 transition-colors ${activeSection === AppSection.Contacts ? 'bg-blue-600 text-white' : 'bg-gray-800 hover:bg-gray-700'}`}>
                <UsersIcon className="w-5 h-5" /> Contacts
            </button>
            <button onClick={() => setActiveSection(AppSection.Workflow)} className={`px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2 transition-colors ${activeSection === AppSection.Workflow ? 'bg-blue-600 text-white' : 'bg-gray-800 hover:bg-gray-700'}`}>
                <CogIcon className="w-5 h-5" /> Workflow
            </button>
            <button onClick={() => setActiveSection(AppSection.Database)} className={`px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2 transition-colors ${activeSection === AppSection.Database ? 'bg-blue-600 text-white' : 'bg-gray-800 hover:bg-gray-700'}`}>
                <DatabaseIcon className="w-5 h-5" /> Database
            </button>
        </div>
        
        <div className="mt-8">
          {renderSection()}
        </div>
      </div>

       {toast && (
        <div className={`fixed bottom-5 right-5 p-4 rounded-lg shadow-lg text-white max-w-sm flex items-start gap-3 z-50 animate-fade-in-up ${toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
            <InfoIcon className="w-6 h-6 mt-0.5" />
            <span>{toast.message}</span>
            <button onClick={() => setToast(null)} className="absolute top-1 right-1 text-white/70 hover:text-white">&times;</button>
        </div>
      )}
       {ambiguousLocations && (
        <AmbiguityResolver
          query={originalQuery}
          options={ambiguousLocations}
          onResolve={resolveAmbiguity}
          onCancel={() => setAmbiguousLocations(null)}
        />
      )}
    </div>
  );
};

export default ProductivityApp;
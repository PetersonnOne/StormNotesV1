import { TimezoneCardData, Contact, Document } from '@/types';

// Simulate network latency
const LATENCY = 200;

// Helper to simulate async operations
const simulateRequest = <T>(data: T): Promise<T> => {
    return new Promise(resolve => setTimeout(() => resolve(data), LATENCY));
};

// In-memory storage to simulate a database
let timezoneCards: TimezoneCardData[] = [];
let contacts: Contact[] = [];
let documents: Document[] = [];

// --- Timezone Cards API ---

export const getTimezoneCards = async (): Promise<TimezoneCardData[]> => {
    // Return a copy to prevent direct mutation of the "database" state
    return simulateRequest([...timezoneCards]);
};

export const addTimezoneCard = async (card: TimezoneCardData): Promise<TimezoneCardData> => {
    timezoneCards.push(card);
    return simulateRequest(card);
};

export const deleteTimezoneCard = async (id: string): Promise<{ success: boolean }> => {
    timezoneCards = timezoneCards.filter(card => card.id !== id);
    return simulateRequest({ success: true });
};

// --- Contacts API ---

export const getContacts = async (): Promise<Contact[]> => {
    // Return a copy to prevent direct mutation of the "database" state
    return simulateRequest([...contacts]);
};

export const addContact = async (name: string, email: string): Promise<Contact> => {
    if (contacts.some(c => c.email.toLowerCase() === email.toLowerCase())) {
        throw new Error("A contact with this email already exists.");
    }
    const newContact: Contact = {
        id: crypto.randomUUID(),
        name,
        email,
    };
    contacts.push(newContact);
    return simulateRequest(newContact);
};

export const deleteContact = async (id: string): Promise<{ success: boolean }> => {
    contacts = contacts.filter(contact => contact.id !== id);
    return simulateRequest({ success: true });
};


// --- Documents API ---

export const getDocuments = async (): Promise<Document[]> => {
    // Return a copy to prevent direct mutation of the "database" state
    return simulateRequest([...documents]);
}

export const addDocument = async (doc: Document): Promise<Document> => {
    documents.push(doc);
    return simulateRequest(doc);
}
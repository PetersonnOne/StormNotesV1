export interface TimezoneCardData {
  id: string;
  location: string;
  timezone: string;
  utcOffset: string;
  isDst: boolean;
  dstInfo: string;
  initialTime: Date;
  groundingSources: GroundingSource[];
}

export interface GroundingSource {
  uri: string;
  title: string;
}

export enum AppSection {
  Cards = 'Cards',
  Converter = 'Converter',
  Reminders = 'Reminders',
  Chat = 'Chat',
  Contacts = 'Contacts',
  Workflow = 'Workflow',
  Database = 'Database',
}

export interface Reminder {
  id: string;
  message: string;
  fireDate: Date;
  location: string;
  recipientEmail: string;
}

export interface ToastMessage {
  message: string;
  type: 'success' | 'error';
}

export class AmbiguousLocationError extends Error {
  constructor(public locations: string[]) {
    super(`Ambiguous location provided. Please choose one of: ${locations.join(', ')}`);
    this.name = 'AmbiguousLocationError';
  }
}

export interface FileAttachment {
  type: 'image' | 'text';
  content: string; // data URL for image, text content for text file
  name: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  attachment?: FileAttachment;
}

export interface Contact {
  id: string;
  name: string;
  email: string;
}

export interface Document {
  id: string;
  filename: string;
  originalText: string;
  summary: string;
  sentiment: string;
}

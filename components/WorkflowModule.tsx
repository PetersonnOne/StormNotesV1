'use client'

import React, { useState } from 'react';
import { Contact } from '@/types';
import { CogIcon, DocumentTextIcon, EmailIcon, SpinnerIcon } from '@/components/icons';

// Declare global libraries loaded from CDN
declare const mammoth: any;
declare const pdfjsLib: any;

// Configure pdf.js worker
if (typeof pdfjsLib !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js`;
}

interface WorkflowModuleProps {
  contacts: Contact[];
  onStartWorkflow: (fileContent: string, filename: string, contactId: string) => Promise<boolean>;
}

const extractTextFromFile = async (file: File): Promise<string> => {
    const reader = new FileReader();
  
    return new Promise((resolve, reject) => {
      const fileType = file.type;
      const fileName = file.name.toLowerCase();
  
      reader.onerror = (error) => reject(new Error(`Failed to read file: ${error}`));
  
      if (['text/plain', 'text/markdown'].includes(fileType) || fileName.endsWith('.md') || fileName.endsWith('.txt')) {
        reader.onload = (event) => resolve(event.target?.result as string);
        reader.readAsText(file);
      } else if (fileName.endsWith('.docx') || fileName.endsWith('.doc') || fileType === 'application/msword' || fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        reader.onload = async (event) => {
          try {
            const arrayBuffer = event.target?.result;
            if (!arrayBuffer) {
              return reject(new Error('File content is empty.'));
            }
            const result = await mammoth.extractRawText({ arrayBuffer });
            resolve(result.value);
          } catch (error) {
            console.error("Mammoth.js error:", error);
            reject(new Error(`Failed to parse ${fileName}. The file might be corrupt or password-protected.`));
          }
        };
        reader.readAsArrayBuffer(file);
      } else if (fileType === 'application/pdf' || fileName.endsWith('.pdf')) {
        reader.onload = async (event) => {
          try {
            const arrayBuffer = event.target?.result;
            if (!arrayBuffer) {
                return reject(new Error('File content is empty.'));
            }
            const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
            let fullText = '';
            for (let i = 1; i <= pdf.numPages; i++) {
              const page = await pdf.getPage(i);
              const textContent = await page.getTextContent();
              const pageText = textContent.items.map((item: any) => item.str).join(' ');
              fullText += pageText + '\n\n';
            }
            resolve(fullText.trim());
          } catch (error) {
            console.error("PDF.js error:", error);
            reject(new Error(`Failed to parse ${fileName}. The file might be corrupt or password-protected.`));
          }
        };
        reader.readAsArrayBuffer(file);
      } else {
        reject(new Error(`Unsupported file type: ${fileType || 'unknown'}. Please upload a .txt, .md, .doc, .docx, or .pdf file.`));
      }
    });
  };

const WorkflowModule: React.FC<WorkflowModuleProps> = ({ contacts, onStartWorkflow }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileContent, setFileContent] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const [selectedContactId, setSelectedContactId] = useState<string>('');
  const [progressMessage, setProgressMessage] = useState('');

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { // 2MB limit for binary files
        alert('File size cannot exceed 2MB.');
        return;
      }

      setSelectedFile(file);
      setFileContent(null);
      setIsParsing(true);
      setProgressMessage('');

      try {
        const text = await extractTextFromFile(file);
        setFileContent(text);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred during parsing.';
        alert(`Error: ${errorMessage}`);
        setSelectedFile(null);
      } finally {
        setIsParsing(false);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile || fileContent === null || !selectedContactId) {
      alert('Please select a file, wait for it to be processed, and select a contact.');
      return;
    }
    setIsLoading(true);
    setProgressMessage('Analyzing text with Gemini...');
    const success = await onStartWorkflow(fileContent, selectedFile.name, selectedContactId);
    
    if (success) {
      setProgressMessage('Workflow complete!');
      setSelectedFile(null);
      setFileContent(null);
      setSelectedContactId('');
    } else {
        setProgressMessage('An error occurred during the workflow. Please check the console and try again.');
    }

    setIsLoading(false);
    setTimeout(() => setProgressMessage(''), 4000); // Clear message after 4s
  };

  return (
    <div className="p-6 bg-gray-800 rounded-lg max-w-2xl mx-auto border border-gray-700">
      <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
        <CogIcon className="w-6 h-6" /> Agentic Workflow: Analyze & Notify
      </h2>
      <div className="text-sm bg-blue-900/50 border border-blue-700 text-blue-200 p-3 rounded-md mb-4">
        <strong>How it works:</strong> Upload a text document (.txt, .md, .doc, .docx, .pdf), and the AI agent will analyze it, save the findings, and email a summary to a selected contact.
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">1. Upload Document</label>
          <div className="mt-2 flex justify-center rounded-lg border border-dashed border-gray-600 px-6 py-10">
            <div className="text-center">
              <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-500" />
              <div className="mt-4 flex text-sm leading-6 text-gray-400">
                <label htmlFor="file-upload" className="relative cursor-pointer rounded-md font-semibold text-blue-400 focus-within:outline-none focus-within:ring-2 focus-within:ring-blue-600 focus-within:ring-offset-2 focus-within:ring-offset-gray-900 hover:text-blue-500">
                  <span>Upload a file</span>
                  <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleFileChange} accept=".txt,.md,text/plain,text/markdown,.doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,.pdf,application/pdf" />
                </label>
                <p className="pl-1">or drag and drop</p>
              </div>
              <p className="text-xs leading-5 text-gray-400">TXT, MD, DOC, DOCX, PDF up to 2MB</p>
            </div>
          </div>
          {selectedFile && (
            <p className="text-sm text-center text-gray-300 mt-2">
                Selected: {selectedFile.name} 
                {isParsing && <span className="text-yellow-400"> (Parsing...)</span>}
                {!isParsing && fileContent !== null && <span className="text-green-400"> (Ready)</span>}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">2. Select Recipient</label>
          <div className="relative">
            <EmailIcon className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <select
              value={selectedContactId}
              onChange={e => setSelectedContactId(e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 pl-10 px-3 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              required
              disabled={contacts.length === 0}
            >
              {contacts.length === 0 ? (
                <option>Please add a contact first</option>
              ) : (
                <>
                  <option value="">-- Select a contact --</option>
                  {contacts.map(c => <option key={c.id} value={c.id}>{c.name} ({c.email})</option>)}
                </>
              )}
            </select>
          </div>
        </div>

        <button type="submit" disabled={isLoading || isParsing || !selectedFile || fileContent === null || !selectedContactId} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md flex items-center justify-center gap-2 transition-colors disabled:bg-blue-800 disabled:cursor-not-allowed">
          {isLoading ? <><SpinnerIcon className="w-5 h-5 animate-spin" /> {progressMessage || 'Processing...'}</> : <><CogIcon className="w-5 h-5" /> Start Analysis Workflow</>}
        </button>
      </form>
      {progressMessage && !isLoading && <p className="text-center mt-4 text-green-400">{progressMessage}</p>}
    </div>
  );
};

export default WorkflowModule;
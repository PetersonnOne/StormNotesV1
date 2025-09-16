'use client'

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ChatMessage, FileAttachment } from '@/types';
import { sendChatMessage } from '@/services/geminiService';
import { ChatIcon, PaperClipIcon, SendIcon, SpinnerIcon, XMarkIcon, ClearChatIcon, DocumentTextIcon } from '@/components/icons';
import ChatMessageBubble from '@/components/ChatMessageBubble';

interface ChatModuleProps {
    showToast: (message: string, type: 'success' | 'error') => void;
}

const CHAT_HISTORY_KEY = 'gemini-chat-history';

const ChatModule: React.FC<ChatModuleProps> = ({ showToast }) => {
    const [history, setHistory] = useState<ChatMessage[]>(() => {
        try {
            const saved = localStorage.getItem(CHAT_HISTORY_KEY);
            return saved ? JSON.parse(saved) : [];
        } catch (error) {
            console.error('Failed to load chat history from storage:', error);
            return [];
        }
    });
    const [inputText, setInputText] = useState('');
    const [inputAttachment, setInputAttachment] = useState<FileAttachment | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const chatEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [history, isLoading]);

    useEffect(() => {
        try {
            localStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(history));
        } catch (error) {
            console.error('Failed to save chat history to storage:', error);
            showToast('Could not save chat history.', 'error');
        }
    }, [history, showToast]);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        if (file.size > 4 * 1024 * 1024) { // 4MB limit
            showToast('File size should not exceed 4MB.', 'error');
            return;
        }

        const reader = new FileReader();
        reader.onerror = () => showToast('Failed to read the file.', 'error');

        if (file.type.startsWith('image/')) {
            reader.onloadend = () => {
                setInputAttachment({
                    type: 'image',
                    content: reader.result as string,
                    name: file.name
                });
            };
            reader.readAsDataURL(file);
        } else if (file.type === 'text/plain' || file.name.endsWith('.md')) {
            reader.onloadend = () => {
                setInputAttachment({
                    type: 'text',
                    content: reader.result as string,
                    name: file.name
                });
            };
            reader.readAsText(file);
        } else {
            showToast(`Unsupported file type. Please upload an image, .txt, or .md file.`, 'error');
        }
    };


    const handleSendMessage = useCallback(async () => {
        if ((!inputText.trim() && !inputAttachment) || isLoading) {
            return;
        }

        const userMessage: ChatMessage = {
            role: 'user',
            text: inputText.trim(),
            attachment: inputAttachment || undefined,
        };

        const currentHistory = [...history, userMessage];
        setHistory(currentHistory);
        setInputText('');
        setInputAttachment(null);
        if(fileInputRef.current) {
            fileInputRef.current.value = '';
        }
        setIsLoading(true);

        try {
            // We pass the history *before* this message was added to sendChatMessage
            const modelResponseText = await sendChatMessage(history, userMessage);
            const modelMessage: ChatMessage = {
                role: 'model',
                text: modelResponseText,
            };
            setHistory(prev => [...prev, modelMessage]);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
            showToast(`Failed to get response: ${errorMessage}`, 'error');
            // On error, the user's message remains in the history for them to see and retry.
        } finally {
            setIsLoading(false);
        }
    }, [inputText, inputAttachment, isLoading, history, showToast]);

    const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          handleSendMessage();
        }
    };

    const handleClearChat = () => {
        if (history.length > 0 && confirm('Are you sure you want to clear the entire chat history?')) {
            setHistory([]);
            showToast('Chat history cleared.', 'success');
        }
    };

    return (
        <div className="bg-gray-800 rounded-lg max-w-4xl mx-auto border border-gray-700 flex flex-col h-[75vh]">
            <div className="flex justify-between items-center p-4 border-b border-gray-700">
                <h2 className="text-2xl font-bold flex items-center gap-3">
                    <ChatIcon className="w-6 h-6"/>
                    Chat with Gemini
                </h2>
                <button 
                    onClick={handleClearChat}
                    disabled={history.length === 0}
                    className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-full disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    aria-label="Clear chat history"
                >
                    <ClearChatIcon className="w-6 h-6" />
                </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {history.length === 0 && (
                    <div className="text-center text-gray-400 mt-12">
                        <p>Start a conversation with Gemini.</p>
                        <p className="text-sm">You can ask questions and upload an image or text file.</p>
                    </div>
                )}
                {history.map((msg, index) => (
                    <ChatMessageBubble key={index} message={msg} />
                ))}
                {isLoading && (
                    <div className="flex justify-start">
                        <div className="bg-gray-700 rounded-lg p-3 max-w-xl animate-pulse flex items-center gap-2">
                           <SpinnerIcon className="w-5 h-5 animate-spin" /> Thinking...
                        </div>
                    </div>
                )}
                <div ref={chatEndRef} />
            </div>
            <div className="p-4 border-t border-gray-700 bg-gray-800">
                {inputAttachment && (
                    <div className="relative inline-block mb-2 border border-gray-600 rounded-lg p-2">
                        {inputAttachment.type === 'image' ? (
                            <img src={inputAttachment.content} alt={inputAttachment.name} className="h-20 w-20 object-cover rounded-md" />
                        ) : (
                            <div className="flex items-center gap-2 h-20 w-40">
                                <DocumentTextIcon className="w-8 h-8 text-gray-400 flex-shrink-0"/>
                                <span className="text-sm text-gray-300 break-all">{inputAttachment.name}</span>
                            </div>
                        )}
                        <button 
                            onClick={() => {
                                setInputAttachment(null);
                                if(fileInputRef.current) fileInputRef.current.value = '';
                            }} 
                            className="absolute top-0 right-0 -mt-2 -mr-2 bg-red-600 text-white rounded-full p-0.5"
                            aria-label="Remove attachment"
                        >
                            <XMarkIcon className="w-4 h-4" />
                        </button>
                    </div>
                )}
                <div className="flex items-center gap-2 bg-gray-700 border border-gray-600 rounded-lg p-2">
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        className="p-2 text-gray-400 hover:text-white hover:bg-gray-600 rounded-full transition-colors"
                        aria-label="Attach file"
                    >
                        <PaperClipIcon className="w-5 h-5" />
                    </button>
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        className="hidden"
                        accept="image/png, image/jpeg, image/webp, text/plain, .md"
                    />
                    <textarea
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        onKeyDown={handleKeyPress}
                        placeholder="Type a message or upload a file..."
                        className="flex-1 bg-transparent focus:outline-none resize-none"
                        rows={1}
                        disabled={isLoading}
                    />
                    <button
                        onClick={handleSendMessage}
                        disabled={(!inputText.trim() && !inputAttachment) || isLoading}
                        className="bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed transition-colors"
                        aria-label="Send message"
                    >
                        <SendIcon className="w-5 h-5" />
                    </button>
                </div>
                 <p className="text-xs text-center text-gray-500 mt-2">
                    Max file size: 4MB. Attach one image, .txt, or .md file per message.
                </p>
            </div>
        </div>
    );
};

export default ChatModule;
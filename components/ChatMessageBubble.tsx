'use client'

import React from 'react';
import { ChatMessage } from '@/types';
import { DocumentTextIcon } from '@/components/icons';

interface ChatMessageBubbleProps {
  message: ChatMessage;
}

const ChatMessageBubble: React.FC<ChatMessageBubbleProps> = ({ message }) => {
  const isUser = message.role === 'user';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`p-3 rounded-lg max-w-xl ${isUser ? 'bg-blue-600 text-white' : 'bg-gray-700'}`}>
        {message.attachment?.type === 'image' && (
          <img src={message.attachment.content} alt={message.attachment.name} className="max-w-xs rounded-md mb-2" />
        )}
        {message.attachment?.type === 'text' && (
             <div className="mb-2 p-2 bg-black/20 rounded-md border border-white/20">
                <div className="flex items-center gap-2">
                    <DocumentTextIcon className="w-6 h-6 text-white/70 flex-shrink-0" />
                    <span className="text-sm font-medium truncate">{message.attachment.name}</span>
                </div>
            </div>
        )}
        {message.text && <p className="whitespace-pre-wrap">{message.text}</p>}
      </div>
    </div>
  );
};

export default ChatMessageBubble;
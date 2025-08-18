import React from 'react';
import { Message } from '../types';

interface ChatMessageProps {
  message: Message;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className={`flex mb-4 ${message.isOwn ? 'justify-end' : 'justify-start'}`}>
      <div className={`flex max-w-xs lg:max-w-md ${message.isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
        {/* Avatar */}
        <div className={`flex-shrink-0 ${message.isOwn ? 'ml-2' : 'mr-2'}`}>
          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center text-white text-sm font-semibold">
            {message.username.charAt(0).toUpperCase()}
          </div>
        </div>

        {/* Message Content */}
        <div className={`flex flex-col ${message.isOwn ? 'items-end' : 'items-start'}`}>
          {/* Username and timestamp */}
          <div className={`flex items-center mb-1 ${message.isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
            <span className="text-xs font-semibold text-gray-600">
              {message.username}
            </span>
            <span className={`text-xs text-gray-400 ${message.isOwn ? 'mr-2' : 'ml-2'}`}>
              {formatTime(message.timestamp)}
            </span>
          </div>

          {/* Message Bubble */}
          <div
            className={`rounded-2xl px-4 py-3 shadow-sm ${
              message.isOwn
                ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-br-md'
                : 'bg-white border border-gray-200 text-gray-800 rounded-bl-md'
            }`}
          >
            <p className="text-sm leading-relaxed">{message.content}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;
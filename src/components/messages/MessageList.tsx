import { useEffect, useRef } from 'react';
import { formatDistanceToNow } from 'date-fns';
import type { Message } from '../../types/database';

interface MessageListProps {
  messages: Message[];
  currentUserId: string | undefined;
}

export function MessageList({ messages, currentUserId }: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {messages.map((message) => {
        const isSentByCurrentUser = message.sender_id === currentUserId;
        
        return (
          <div
            key={message.id}
            className={`flex ${isSentByCurrentUser ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[70%] rounded-lg px-4 py-2 ${
                isSentByCurrentUser
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-900'
              }`}
            >
              <p className="text-sm">{message.content}</p>
              <p className={`text-xs mt-1 ${
                isSentByCurrentUser ? 'text-blue-100' : 'text-gray-500'
              }`}>
                {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
              </p>
            </div>
          </div>
        );
      })}
      <div ref={messagesEndRef} />
    </div>
  );
}
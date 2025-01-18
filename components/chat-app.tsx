'use client';

import { useState } from 'react';
import { Textarea } from './ui/textarea';
import { Button } from './ui/button';
import { useChat } from '@/context/chat.context';

const ChatApp = () => {
  const [message, setMessage] = useState('');
  const { messages, sendMessages, joinChat, leaveChat, peer } = useChat();

  return (
    <div className="flex flex-col justify-between h-screen">
      <div className="p-4">
        {peer ? (
          <Button variant="destructive" onClick={leaveChat}>
            Leave Chat
          </Button>
        ) : (
          <Button onClick={joinChat}>Join Chat</Button>
        )}
      </div>
      <footer className="p-4 flex flex-col justify-center gap-4">
        <ul className="max-h-96 scroll-auto">
          {messages.map((msg, index) => (
            <li key={index} className="p-2 rounded-md bg-slate-500 mb-2">
              {msg}
            </li>
          ))}
        </ul>

        <Textarea
          placeholder="Type your message here. Hit Enter to execute"
          disabled={!peer}
          value={message}
          onChange={(e) => {
            const msg = e.currentTarget.value;
            setMessage(msg);
          }}
          onKeyUp={(e) => {
            if (e.key === 'Enter') {
              sendMessages(message);
              setMessage('');
            }
          }}
        />
      </footer>
    </div>
  );
};

export default ChatApp;

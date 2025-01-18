'use client';

import { useEffect, useState } from 'react';
import { Textarea } from './ui/textarea';
import { useChat } from '@/lib/chat.context';

const ChatApp = () => {
  const [message, setMessage] = useState('');
  const { dataChannel, messages, sendMessage, initDataChannel } = useChat();

  useEffect(() => {
    initDataChannel();
  }, [initDataChannel]);

  return (
    <div>
      <Textarea
        placeholder="Type your message here."
        value={message}
        onChange={(e) => {
          const msg = e.currentTarget.value;
          setMessage(msg);
          sendMessage(msg);
          dataChannel?.send(msg);
        }}
      />
      <ul>
        {messages.map((msg, index) => (
          <li key={index}>{msg}</li>
        ))}
      </ul>
    </div>
  );
};

export default ChatApp;

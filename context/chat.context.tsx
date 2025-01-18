'use client';

import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import { app, Peer, usePeer } from './peer.context';

type ChatMessage = {
  messages: string[];
  sendMessages: (message: string) => void;
  joinChat: () => void;
  leaveChat: () => void;
  peer: Peer | null;
};

const defaultValue: ChatMessage = {
  messages: [],
  sendMessages: () => {},
  joinChat: () => {},
  leaveChat: () => {},
  peer: null,
};

const ChatContext = createContext<ChatMessage>(defaultValue);

type ChatProviderProps = {
  children: ReactNode;
};

export const useChat = () => {
  return useContext(ChatContext);
};

export const ChatProvider = ({ children }: ChatProviderProps) => {
  const [messages, setMessages] = useState<string[]>([]);
  const [dataChannel, setDataChannel] = useState<RTCDataChannel | null>(null);
  const [peer, setPeer] = useState<Peer | null>(null);
  const { roomId, clientId } = usePeer();

  const addDataChannelHandler = useCallback(async () => {
    if (!roomId) return;
    const created = await app.createDataChannel(roomId, 'chat');

    if (created.ok) {
      console.log('data channel created');
    } else {
      console.log('data channel failed');
    }
  }, [roomId]);

  const joinChat = useCallback(async () => {
    if (!roomId) return;
    const peer = await app.createPeer(roomId, clientId);
    await peer.connect(roomId, clientId);

    setPeer(peer);
  }, [roomId, clientId]);

  const leaveChat = useCallback(() => {
    if (!peer) return;
    peer.disconnect();
    setPeer(null);
  }, [peer]);

  const dataChannelHandler = useCallback((event: RTCDataChannelEvent) => {
    console.log('data channel event', event);
    const dataChannel = event.channel;

    if (dataChannel.label === 'chat') {
      dataChannel.addEventListener('message', (event) => {
        const textDecoder = new TextDecoder();
        const bufferData = event.data as ArrayBuffer;
        const data = textDecoder.decode(bufferData);
        const message: string = JSON.parse(data);
        setMessages((prevData) => [...prevData, message]);
      });
    }
    setDataChannel(dataChannel);
  }, []);

  useEffect(() => {
    if (!peer) return;
    const peerConnection = peer.getPeerConnection();

    if (!peerConnection) return;

    peerConnection.addEventListener('datachannel', dataChannelHandler);

    return () => {
      peerConnection.removeEventListener('datachannel', dataChannelHandler);
    };
  }, [peer, dataChannelHandler]);

  useEffect(() => {
    addDataChannelHandler();
  }, [addDataChannelHandler]);

  const sendMessages = useCallback(
    (message: string) => {
      setMessages((prev) => [...prev, message]);
      if (!dataChannel) return;
      dataChannel.send(JSON.stringify(message));
    },
    [dataChannel]
  );

  return (
    <ChatContext.Provider
      value={{ messages, sendMessages, joinChat, leaveChat, peer }}
    >
      {children}
    </ChatContext.Provider>
  );
};

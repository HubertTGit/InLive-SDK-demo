'use client';

import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import { createPeer, Peer, room } from './peer-connection';
import { usePeer } from './peer.context';

type ChatMessage = {
  messages: string[];
  sendMessage: (message: string) => void;
  dataChannel: RTCDataChannel | null;
  initDataChannel: () => void;
};

const defaultValue: ChatMessage = {
  messages: [],
  sendMessage: () => {},
  dataChannel: null,
  initDataChannel: () => {},
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
  const [_peer, setPeer] = useState<Peer | null>(null);
  const [init, setInit] = useState<boolean>(false);
  const { roomId } = usePeer();

  const addRoomHandler = useCallback(async () => {
    if (!roomId) return;
    const created = await room.createDataChannel(roomId, 'chat');

    if (created.ok) {
      console.log('data channel created');
    } else {
      console.log('data channel failed');
    }
  }, [roomId]);

  const initPeerHandler = useCallback(async () => {
    if (!roomId) return;
    const { peer } = await createPeer(roomId);
    setPeer(peer);
  }, [roomId]);

  useEffect(() => {
    if (!init) return;
    initPeerHandler();
  }, [init, initPeerHandler]);

  const dataChannelHandler = useCallback((event: RTCDataChannelEvent) => {
    const dataChannel = event.channel;
    dataChannel.binaryType = 'arraybuffer';

    console.log('data channel', dataChannel);

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
    const peerConnection = _peer?.getPeerConnection() || null;

    if (!peerConnection) return;

    console.log('peer connection', peerConnection);

    peerConnection.addEventListener('datachannel', dataChannelHandler);

    return () => {
      peerConnection.removeEventListener('datachannel', dataChannelHandler);
    };
  }, [_peer, dataChannelHandler, roomId]);

  useEffect(() => {
    addRoomHandler();
  }, [addRoomHandler]);

  const sendMessage = (message: string) => {
    setMessages((prev) => [...prev, message]);
  };

  const initDataChannel = () => {
    setInit(true);
  };

  return (
    <ChatContext.Provider
      value={{ messages, sendMessage, dataChannel, initDataChannel }}
    >
      {children}
    </ChatContext.Provider>
  );
};

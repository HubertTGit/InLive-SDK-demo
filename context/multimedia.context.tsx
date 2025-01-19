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

interface MultimediaProviderProps {
  children: ReactNode;
}

type MultimediaContextType = {
  messages: string[];
  sendMessages: (message: string) => void;
  join: (graphic?: MediaStream) => Promise<void>;
  leave: () => void;
  peer: Peer | null;
};

const defaultValue: MultimediaContextType = {
  messages: [],
  sendMessages: () => {},
  join: () => Promise.resolve(),
  leave: () => {},
  peer: null,
};

const MultiMediaContext = createContext(defaultValue);

export const useMultimedia = () => {
  return useContext(MultiMediaContext);
};

export const MultimediaProvider = ({ children }: MultimediaProviderProps) => {
  const [messages, setMessages] = useState<string[]>([]);
  const [peer, setPeer] = useState<Peer | null>(null);
  const [dataChannel, setDataChannel] = useState<RTCDataChannel | null>(null);

  const { roomId, clientId, clientName } = usePeer();

  const addDataChannelHandler = useCallback(async () => {
    if (!roomId) return;
    const created = await app.createDataChannel(roomId, 'story');

    if (created.ok) {
      console.log('data channel created');
    } else {
      console.log('data channel failed');
    }
  }, [roomId]);

  const join = useCallback(
    async (graphic?: MediaStream) => {
      if (!roomId && !clientName && !graphic) return;

      const peer = await app.createPeer(roomId, clientId);

      if (graphic) {
        peer.addStream(graphic.id, {
          clientId,
          name: clientName,
          origin: 'local',
          source: 'media',
          mediaStream: graphic,
        });
      }

      await peer.connect(roomId, clientId);
      setPeer(peer);
    },
    [roomId, clientId, clientName]
  );

  const leave = useCallback(() => {
    if (!peer) return;
    peer.disconnect();
    setPeer(null);
  }, [peer]);

  const sendMessages = useCallback(
    (message: string) => {
      setMessages((prev) => [...prev, message]);
      if (!dataChannel) return;
      console.log('sending message', message, dataChannel);
      dataChannel.send(message);
    },
    [dataChannel]
  );

  const dataChannelHandler = useCallback((event: RTCDataChannelEvent) => {
    const dataChannel = event.channel;

    if (dataChannel.label === 'story') {
      //set data channel
      setDataChannel(dataChannel);
      dataChannel.onmessage = (event) => {
        if (event.data instanceof ArrayBuffer) {
          const textDecoder = new TextDecoder();
          const bufferData = event.data as ArrayBuffer;
          const message = textDecoder.decode(bufferData);
          setMessages((prevData) => [...prevData, message]);
        }
      };
    }
  }, []);

  useEffect(() => {
    if (!peer) return;
    const peerConnection = peer.getPeerConnection();

    if (!peerConnection) return;

    peerConnection.addEventListener('datachannel', dataChannelHandler);

    peer.startViewOnly();

    return () => {
      peerConnection.removeEventListener('datachannel', dataChannelHandler);
    };
  }, [peer, dataChannelHandler]);

  useEffect(() => {
    addDataChannelHandler();
  }, [addDataChannelHandler]);

  return (
    <MultiMediaContext.Provider
      value={{ join, leave, messages, sendMessages, peer }}
    >
      {children}
    </MultiMediaContext.Provider>
  );
};

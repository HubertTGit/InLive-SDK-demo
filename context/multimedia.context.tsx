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

      const media = await window.navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      const peer = await app.createPeer(roomId, clientId);

      if (graphic) {
        media.removeTrack(media.getVideoTracks()[0]);
        media.addTrack(graphic.getVideoTracks()[0]);
        await addDataChannelHandler();
        peer.addStream(media.id, {
          clientId,
          name: clientName,
          origin: 'local',
          source: 'media',
          mediaStream: media,
        });
      }

      await peer.connect(roomId, clientId);
      setPeer(peer);
    },
    [roomId, clientId, clientName, addDataChannelHandler]
  );

  const leave = useCallback(async () => {
    if (!roomId && !clientId) return;
    await app.leaveRoom(roomId, clientId);
    peer?.disconnect();

    setPeer(null);
  }, [roomId, clientId, peer]);

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

    return () => {
      peerConnection.removeEventListener('datachannel', dataChannelHandler);
    };
  }, [peer, dataChannelHandler]);

  return (
    <MultiMediaContext.Provider
      value={{ join, leave, messages, sendMessages, peer }}
    >
      {children}
    </MultiMediaContext.Provider>
  );
};

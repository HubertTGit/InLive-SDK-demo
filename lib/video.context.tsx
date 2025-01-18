'use client';

import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import { Peer } from './peer-connection';
import { v4 as uuidv4 } from 'uuid';
import { app, useRoom } from './room.context';

type VideoContext = {
  mediaStream: MediaStream | null;
  peer: Peer | null;
  clientId: string | undefined;
  join: () => void;
  leave: () => void;
};

const defaultValue: VideoContext = {
  mediaStream: null,
  peer: null,
  clientId: undefined,
  join: () => {},
  leave: () => {},
};

const VideoContext = createContext<VideoContext>(defaultValue);

type VideoProviderProps = {
  children: ReactNode;
};

export const useVideo = () => {
  return useContext(VideoContext);
};

export const VideoProvider = ({ children }: VideoProviderProps) => {
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
  const [peer, setPeer] = useState<Peer | null>(null);
  const [clientId, setClientId] = useState<string>('');
  const [clientName, setClientName] = useState<string>('');
  const { roomId } = useRoom();

  const join = useCallback(async () => {
    if (!roomId && !clientId && !clientName) return;

    const mediaStream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });

    setMediaStream(mediaStream);

    const peer = await app.createPeer(roomId, clientId);

    setPeer(peer);

    peer.addStream(mediaStream.id, {
      clientId,
      name: clientName,
      origin: 'local',
      source: 'media',
      mediaStream: mediaStream,
    });

    await peer.connect(roomId, clientId);
  }, [clientId, clientName, roomId]);

  const leave = useCallback(async () => {
    if (!peer && !roomId) return;

    peer?.disconnect();
  }, [peer, roomId]);

  useEffect(() => {
    const createPeerAndAndStream = async (roomId: string | null) => {
      if (!roomId) return;

      const _clientId = uuidv4();

      const _createdClient = await app.createClient(roomId, {
        clientName: `client_${_clientId}`,
      });

      const clientId = _createdClient.data.clientId;
      const clientName = _createdClient.data.clientName;

      setClientId(clientId);
      setClientName(clientName);
    };

    createPeerAndAndStream(roomId);
  }, [roomId]);

  return (
    <VideoContext.Provider value={{ peer, mediaStream, clientId, join, leave }}>
      {children}
    </VideoContext.Provider>
  );
};

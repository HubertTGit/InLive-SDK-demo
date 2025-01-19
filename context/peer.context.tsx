'use client';

import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from 'react';
import { createAuth, Room } from '@inlivedev/inlive-js-sdk';
import { v4 as uuidv4 } from 'uuid';

type RoomInit = {
  roomId: string;
  clientId: string;
  clientName: string;
};

const defaultValue: RoomInit = {
  roomId: '',
  clientId: '',
  clientName: '',
};

const RoomContext = createContext<RoomInit>(defaultValue);

export const app = Room();
export type Peer = Awaited<ReturnType<typeof app.createPeer>>;

type PeerProviderProps = {
  children: ReactNode;
  roomId: string;
};

export const usePeer = () => {
  return useContext(RoomContext);
};

export const authentication = async () => {
  const apiKey = await fetch('/api').then((res) => res.json());

  const auth = await createAuth({
    apiKey,
    expirySeconds: 3600,
  });

  app.setAuth(auth);
};

export const createRoomHandler = async (
  roomId: string
): Promise<{ id: string; name: string }> => {
  const existingRoom = await app.getRoom(roomId);

  console.log('get new room', existingRoom);

  const {
    ok,
    data: { id, name },
  } = existingRoom;

  if (ok) {
    return { id, name };
  } else {
    const createdRoom = await app.createRoom(`Conference-${roomId}`, roomId);
    console.log('new created room', createdRoom);

    const {
      data: { id, name },
    } = createdRoom;

    return { id, name };
  }
};

export const PeerAppProvider = ({
  children,
  roomId: id,
}: PeerProviderProps) => {
  const [roomId, setRoomId] = useState<string>('');
  const [clientId, setClientId] = useState<string>('');
  const [clientName, setClientName] = useState<string>('');

  useEffect(() => {
    console.log('peer app provider', id);
    if (!id) return;

    const createClientHandler = async (roomId: string) => {
      const _clientId = uuidv4();

      const _createdClient = await app.createClient(roomId, {
        clientName: `client_${_clientId}`,
      });

      const clientId = _createdClient.data.clientId;
      const clientName = _createdClient.data.clientName;

      setClientId(clientId);
      setClientName(clientName);
    };

    const init = async () => {
      await authentication();
      const created = await createRoomHandler(id);
      await createClientHandler(created.id);

      setRoomId(created.id);
    };
    init();
  }, [id]);

  return (
    <RoomContext.Provider value={{ roomId, clientId, clientName }}>
      {children}
    </RoomContext.Provider>
  );
};

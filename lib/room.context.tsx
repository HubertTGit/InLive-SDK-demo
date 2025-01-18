'use client';

import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from 'react';
import { createAuth, Room } from '@inlivedev/inlive-js-sdk';

type RoomInit = {
  roomId: string | null;
};

const defaultValue: RoomInit = {
  roomId: null,
};

const RoomContext = createContext<RoomInit>(defaultValue);

export const app = Room();
export type Peer = Awaited<ReturnType<typeof app.createPeer>>;

type RoomProviderProps = {
  children: ReactNode;
  neededId: string;
};

export const createAppHandler = async (
  roomId: string
): Promise<{ id: string; name: string }> => {
  await authentication();

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

export const useRoom = () => {
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

export const RoomProvider = ({ children, neededId: id }: RoomProviderProps) => {
  const [roomId, setRoomId] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const init = async () => {
      await authentication();
      const created = await createRoomHandler(id);

      setRoomId(created.id);
    };
    init();
  }, [id]);

  return (
    <RoomContext.Provider value={{ roomId }}>{children}</RoomContext.Provider>
  );
};

import { createAuth, Room } from '@inlivedev/inlive-js-sdk';
import { v4 as uuidv4 } from 'uuid';

export const room = Room();

export const authentication = async () => {
  const apiKey = await fetch('/api').then((res) => res.json());

  const auth = await createAuth({
    apiKey,
    expirySeconds: 3600,
  });

  room.setAuth(auth);
};

export const createRoom = async (): Promise<{ id: string; name: string }> => {
  const roomId = uuidv4();

  await authentication();
  const createdRoom = await room.createRoom(roomId);

  const {
    data: { id, name },
  } = createdRoom;

  return { id, name };
};

export const createPeerAndAndStream = async (
  roomId: string
): Promise<{ mediaStream: MediaStream; peer: any }> => {
  const generatedClientId = uuidv4();

  await authentication();

  const getRoom = await room.getRoom(roomId);
  const {
    data: { id },
  } = getRoom;
  const client = await room.createClient(getRoom.data.id, {
    clientName: `client_${generatedClientId}`,
  });

  const {
    data: { clientId, clientName },
  } = client;
  const mediaStream = await navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true,
  });

  const peer = await room.createPeer(id, clientId);

  peer.addStream(mediaStream.id, {
    clientId,
    name: clientName,
    origin: 'local',
    source: 'media',
    mediaStream: mediaStream,
  });

  await peer.connect(id, clientId);

  return { mediaStream, peer };
};

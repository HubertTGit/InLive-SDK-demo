import { createAuth, Room } from '@inlivedev/inlive-js-sdk';
import { v4 as uuidv4 } from 'uuid';

export const room = Room();
export type Peer = Awaited<ReturnType<typeof room.createPeer>>;

export const authentication = async () => {
  const apiKey = await fetch('/api').then((res) => res.json());

  const auth = await createAuth({
    apiKey,
    expirySeconds: 3600,
  });

  room.setAuth(auth);
};

//create room function
export const createRoom = async (
  roomId: string
): Promise<{ id: string; name: string }> => {
  await authentication();

  const existingRoom = await room.getRoom(roomId);

  console.log('get new room', existingRoom);

  const {
    ok,
    data: { id, name },
  } = existingRoom;

  if (ok) {
    return { id, name };
  } else {
    const createdRoom = await room.createRoom(`Conference-${roomId}`, roomId);
    console.log('new created room', createdRoom);

    const {
      data: { id, name },
    } = createdRoom;

    return { id, name };
  }
};

// create peer and stream function
export const createPeerAndAndStream = async (
  roomId: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): Promise<{ mediaStream: MediaStream; peer: any; clientId: string }> => {
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

  return { mediaStream, peer, clientId };
};

export const createPeer = async (
  roomId: string
): Promise<{
  peer: Peer;
  clientId: string;
}> => {
  const generatedClientId = uuidv4();

  await authentication();

  const client = await room.createClient(roomId, {
    clientName: `client_${generatedClientId}`,
  });

  const {
    data: { clientId },
  } = client;

  const peer = await room.createPeer(roomId, clientId);

  await peer.connect(roomId, clientId);

  return { peer, clientId };
};

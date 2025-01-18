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

// create peer and stream function

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

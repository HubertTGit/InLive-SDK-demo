'use client';
import { usePeer } from '@/context/peer.context';

export const Multimedia = () => {
  const { roomId } = usePeer();

  return (
    <>
      <h1>Join: #{roomId}</h1>
    </>
  );
};

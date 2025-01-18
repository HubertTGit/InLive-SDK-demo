'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Button } from './ui/button';
import { createPeerAndAndStream, Peer, room } from '@/lib/peer-connection';
import { RoomEvent } from '@inlivedev/inlive-js-sdk';
import UserVideo from './user-video';
import { TelephoneCall, TelephoneSlash } from '@mynaui/icons-react';
import { useRoom } from '@/lib/room.context';

type Join = {
  hasJoined: boolean;
  firstTime: boolean;
};

type UserVideo = {
  stream: MediaStream;
  clientId: string;
};

export const GroupCallCmp = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [clientId, setClientId] = useState<string>();
  const [userVideos, setUserVideos] = useState<UserVideo[]>([]);
  const [joined, setJoined] = useState<Join>({
    hasJoined: false,
    firstTime: true,
  });

  const { roomId } = useRoom();

  const [peer, setPeer] = useState<Peer>();

  //create room on component mount
  useEffect(() => {
    if (!roomId) return;

    //listen for stream available event
    room.on(RoomEvent.STREAM_AVAILABLE, (data) => {
      //only show remote streams ignore local streams
      if (data.stream.origin === 'local') return;

      const { mediaStream, clientId } = data.stream;

      setUserVideos((prev) => [...prev, { stream: mediaStream, clientId }]);
    });

    //listen for stream removed event
    room.on(RoomEvent.STREAM_REMOVED, ({ stream }) => {
      setUserVideos((prev) =>
        prev.filter((prevStream) => prevStream.stream.id !== stream.id)
      );
    });
  }, [roomId]);

  const joinHandler = useCallback(async () => {
    if (!roomId) return;

    const joinConference = await createPeerAndAndStream(roomId);
    const { mediaStream, clientId, peer } = joinConference;
    setClientId(clientId);
    if (videoRef.current) {
      videoRef.current.srcObject = mediaStream;
      setJoined({ hasJoined: true, firstTime: false });
      setPeer(peer);
    }
  }, [roomId]);

  const reconnectHandler = useCallback(async () => {
    if (!peer && !roomId) return;
    await peer?.connect(roomId!, clientId!);
  }, [roomId, clientId, peer]);

  const leaveHandler = useCallback(async () => {
    if (videoRef.current && clientId && peer) {
      videoRef.current.srcObject = null;
      setUserVideos([]);
      //await room.leaveRoom(insertedRoomId, clientId);
      peer.disconnect();
      setJoined({ hasJoined: false, firstTime: false });
    }
  }, [peer, clientId]);

  return (
    <>
      <div className="flex flex-col justify-between h-screen">
        <div className="p-4">
          <div>
            <h2>You are in Group Call: #{roomId}</h2>
          </div>

          <div className="grid grid-cols-3 gap-4 mt-4">
            <div>
              <video
                className="border-5 border-orange-400 rounded-md"
                ref={videoRef}
                autoPlay
                playsInline
                height={300}
                width={300}
              ></video>
              {joined.hasJoined && <p className="text-sm">User#:{clientId}</p>}
            </div>

            {userVideos.map((data) => (
              <UserVideo key={data.clientId} {...data} />
            ))}
          </div>
        </div>

        <footer className="p-4 mb-12 flex justify-center">
          {joined.hasJoined ? (
            <Button variant="destructive" onClick={leaveHandler}>
              Leave <TelephoneSlash />
            </Button>
          ) : (
            <Button onClick={joined.firstTime ? joinHandler : reconnectHandler}>
              Call <TelephoneCall />
            </Button>
          )}
        </footer>
      </div>
    </>
  );
};

export default GroupCallCmp;

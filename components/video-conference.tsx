'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Button } from './ui/button';
import {
  createPeerAndAndStream,
  createRoom,
  room,
} from '@/lib/peer-connection';
import { Input } from './ui/input';
import { RoomEvent } from '@inlivedev/inlive-js-sdk';
import UserVideo from './user-video';
import { TelephoneCall, TelephoneSlash } from '@mynaui/icons-react';

type Join = {
  hasJoined: boolean;
  firstTime: boolean;
};
type VideoConferenceProps = {
  roomId: string;
};

type UserVideo = {
  stream: MediaStream;
  clientId: string;
};

export const GroupCallCmp = ({ roomId }: VideoConferenceProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [clientId, setClientId] = useState<string>();
  const [userVideos, setUserVideos] = useState<UserVideo[]>([]);
  const [joined, setJoined] = useState<Join>({
    hasJoined: false,
    firstTime: true,
  });
  const [peer, setPeer] = useState<any>();

  const createRoomHandler = useCallback(async () => {
    await createRoom(roomId);
  }, [roomId]);

  //create room on component mount
  useEffect(() => {
    //find or create a room
    createRoomHandler();

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
  }, [createRoomHandler]);

  const joinHandler = useCallback(async () => {
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
    await peer.connect(roomId, clientId);
  }, [roomId, clientId, peer]);

  const leaveHandler = useCallback(async () => {
    if (videoRef.current && clientId) {
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

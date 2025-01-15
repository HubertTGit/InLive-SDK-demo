'use client';

import { use, useCallback, useEffect, useRef, useState } from 'react';
import { Button } from './ui/button';
import { createPeerAndAndStream, createRoom, room } from '@/lib/remote';
import { Input } from './ui/input';
import { RoomEvent } from '@inlivedev/inlive-js-sdk';
import UserVideo from './user-video';

export const VideoConference = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [createdRoomId, setCreatedRoomId] = useState<string>('');
  const [insertedRoomId, setInsertedRoomId] = useState<string>('');
  const [peer, setPeer] = useState<any>(null);
  const [userVideos, setUserVideos] = useState<MediaStream[]>([]);

  useEffect(() => {
    room.on(RoomEvent.STREAM_AVAILABLE, (data) => {
      //only show remote streams ignore local streams
      if (data.stream.origin === 'local') return;
      setUserVideos((prev) => [...prev, data.stream.mediaStream]);
    });

    room.on(RoomEvent.STREAM_REMOVED, ({ stream }) => {
      setUserVideos((prev) =>
        prev.filter((prevStream) => prevStream.id !== stream.id)
      );
    });
  }, []);

  const createRoomHandler = async () => {
    const createdRoom = await createRoom();
    const { id } = createdRoom;
    setCreatedRoomId(id);
  };

  const joinHandler = useCallback(async () => {
    const joinConference = await createPeerAndAndStream(insertedRoomId);
    const { mediaStream, peer } = joinConference;
    setPeer(peer);
    if (videoRef.current) {
      videoRef.current.srcObject = mediaStream;
    }
  }, [insertedRoomId]);

  const leaveHandler = useCallback(async () => {
    if (peer) {
      await peer.disconnect();
    }
    setPeer(null);
  }, [peer]);

  return (
    <>
      <div>
        {!createdRoomId && (
          <Button onClick={createRoomHandler}>Create Room</Button>
        )}
        {createdRoomId && <p>Room ID: {createdRoomId}</p>}
        <div>
          <h2>Join Conference</h2>
          <Input
            type="text"
            placeholder="Enter Room ID"
            value={insertedRoomId}
            onChange={(e) => setInsertedRoomId(e.target.value)}
          />
          {peer ? (
            <Button onClick={leaveHandler}>Leave Conference</Button>
          ) : (
            <Button
              onClick={joinHandler}
              disabled={insertedRoomId.length === 0}
            >
              Join Conference
            </Button>
          )}
        </div>

        <video
          ref={videoRef}
          autoPlay
          playsInline
          height={300}
          width={400}
        ></video>

        <div>
          {userVideos.map((stream) => (
            <UserVideo key={stream.id} stream={stream} />
          ))}
        </div>
      </div>
    </>
  );
};

export default VideoConference;

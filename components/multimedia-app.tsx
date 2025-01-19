'use client';
import { useMultimedia } from '@/context/multimedia.context';
import { app, usePeer } from '@/context/peer.context';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Application } from 'pixi.js';
import { pixijsStuff } from '@/lib/utils';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { RoomEvent } from '@inlivedev/inlive-js-sdk';
import { UserVideo } from './user-video';

type UserVideoType = {
  stream: MediaStream;
  clientId: string;
};

export const Multimedia = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [media, setMedia] = useState<MediaStream | null>(null);
  const [userVideos, setUserVideos] = useState<UserVideoType[]>([]);
  const [msg, setMsg] = useState<string>('');
  const { roomId } = usePeer();
  const { messages, sendMessages, join, leave, peer } = useMultimedia();

  useEffect(() => {
    const app = new Application();

    setTimeout(async () => {
      await pixijsStuff(app, containerRef.current!);

      const stream = app.canvas.captureStream();

      setMedia(stream);
    }, 100);
  }, []);

  useEffect(() => {
    //listen for stream available event
    app.on(RoomEvent.STREAM_AVAILABLE, (data) => {
      //only show remote streams ignore local streams
      if (data.stream.origin === 'local') return;

      const { mediaStream, clientId } = data.stream;

      console.log('stream available', clientId);

      setUserVideos((prev) => [...prev, { stream: mediaStream, clientId }]);
    });

    //listen for stream removed event
    app.on(RoomEvent.STREAM_REMOVED, ({ stream }) => {
      setUserVideos((prev) =>
        prev.filter((prevStream) => prevStream.stream.id !== stream.id)
      );
    });
  }, []);

  const joinHandler = useCallback(async () => {
    if (!media) return;
    await join(media);
  }, [media, join]);

  return (
    <div className="p-3">
      <div className="flex gap-3">
        <h1>Join: #{roomId}</h1>
        {!peer ? (
          <Button onClick={joinHandler}>Join</Button>
        ) : (
          <Button variant="destructive" onClick={leave}>
            Leave
          </Button>
        )}
      </div>
      <div className="flex gap-3">
        <div
          ref={containerRef}
          style={{ height: '300px', width: '300px' }}
        ></div>

        <div className="flex gap-3">
          {userVideos.map((data) => (
            <UserVideo key={data.clientId} {...data} />
          ))}
        </div>
      </div>

      <div>
        <Textarea
          placeholder="write anything then press ENTER"
          value={msg}
          onChange={(e) => setMsg(e.currentTarget.value)}
          onKeyUp={(e) => {
            if (e.key === 'Enter') {
              sendMessages(msg);
              setMsg('');
            }
          }}
        />
        <ul>
          {messages.map((msg, index) => (
            <li key={index} className=" bg-slate-400 p-2 mb-2 rounded-md">
              {msg}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

'use client';
import { useMultimedia } from '@/context/multimedia.context';
import { usePeer } from '@/context/peer.context';
import { useEffect, useRef, useState } from 'react';
import { Application } from 'pixi.js';
import { pixijsStuff } from '@/lib/utils';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';

export const Multimedia = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [media, setMedia] = useState<MediaStream | null>(null);
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

  return (
    <>
      <div className="flex gap-3">
        <h1>Join: #{roomId}</h1> <Button>Join</Button>
      </div>
      <div>
        <div
          ref={containerRef}
          style={{ height: '500px', width: '500px' }}
        ></div>
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
    </>
  );
};

'use client';

import { useEffect, useRef } from 'react';

type UserVideoProps = {
  stream: MediaStream;
  clientId: string;
};

const UserVideo = ({ stream, clientId }: UserVideoProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (!videoRef.current) return;

    videoRef.current.srcObject = stream;
  }, [stream]);

  return (
    <div>
      <video
        className="border-5 border-gray-500 rounded-md"
        ref={videoRef}
        autoPlay
        playsInline
        height={300}
        width={300}
      ></video>
      <p className="text-sm">User#:{clientId}</p>
    </div>
  );
};

export default UserVideo;

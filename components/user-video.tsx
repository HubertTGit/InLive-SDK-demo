'use client';

import { useRef } from 'react';

type UserVideoProps = {
  stream: MediaStream;
};

const UserVideo = ({ stream }: UserVideoProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  if (videoRef.current) {
    videoRef.current.srcObject = stream;
  }

  return (
    <div>
      <video
        ref={videoRef}
        autoPlay
        playsInline
        height={300}
        width={400}
      ></video>
    </div>
  );
};

export default UserVideo;

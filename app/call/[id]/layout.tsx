import { RoomProvider } from '@/lib/room.context';
import { VideoProvider } from '@/lib/video.context';
import { ReactNode } from 'react';

type VideoLayoutProps = {
  children: ReactNode;
  params: Promise<{ id: string }>;
};

export default async function VideoLayout({
  children,
  params,
}: VideoLayoutProps) {
  const { id } = await params;
  return (
    <RoomProvider neededId={id}>
      <VideoProvider>{children}</VideoProvider>
    </RoomProvider>
  );
}

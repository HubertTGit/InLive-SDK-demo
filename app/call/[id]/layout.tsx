import { PeerAppProvider } from '@/context/peer.context';
import { VideoProvider } from '@/context/video.context';
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
    <PeerAppProvider roomId={id}>
      <VideoProvider>{children}</VideoProvider>
    </PeerAppProvider>
  );
}

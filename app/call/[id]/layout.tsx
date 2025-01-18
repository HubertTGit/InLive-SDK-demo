import { PeerAppProvider } from '@/context/peer.context';
import { CallProvider } from '@/context/call.context';
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
      <CallProvider>{children}</CallProvider>
    </PeerAppProvider>
  );
}

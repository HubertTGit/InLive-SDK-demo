import { MultimediaProvider } from '@/context/multimedia.context';
import { PeerAppProvider } from '@/context/peer.context';
import { ReactNode } from 'react';

type MultimediaLayoutProps = {
  children: ReactNode;
  params: Promise<{ id: string }>;
};

export default async function ChatLayout({
  children,
  params,
}: MultimediaLayoutProps) {
  const { id } = await params;

  return (
    <PeerAppProvider roomId={id}>
      <MultimediaProvider> {children}</MultimediaProvider>
    </PeerAppProvider>
  );
}

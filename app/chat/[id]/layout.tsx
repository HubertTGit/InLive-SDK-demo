import { ChatProvider } from '@/context/chat.context';
import { PeerAppProvider } from '@/context/peer.context';
import { ReactNode } from 'react';

type ChatLayoutProps = {
  children: ReactNode;
  params: Promise<{ id: string }>;
};

export default async function ChatLayout({
  children,
  params,
}: ChatLayoutProps) {
  const { id } = await params;

  return (
    <PeerAppProvider roomId={id}>
      <ChatProvider>{children}</ChatProvider>
    </PeerAppProvider>
  );
}

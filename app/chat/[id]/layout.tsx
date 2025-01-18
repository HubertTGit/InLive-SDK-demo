import { ChatProvider } from '@/lib/chat.context';
import { RoomProvider } from '@/lib/room.context';
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
    <RoomProvider neededId={id}>
      <ChatProvider roomId={id}>{children}</ChatProvider>
    </RoomProvider>
  );
}

import { ChatProvider } from '@/lib/chat.context';
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
  return <ChatProvider roomId={id}>{children}</ChatProvider>;
}

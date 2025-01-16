import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { v4 as uuidv4 } from 'uuid';

import { ChatMessages, TelephoneCall } from '@mynaui/icons-react';

export default function Home() {
  const randomId = uuidv4();
  return (
    <>
      <div className="grid items-center justify-center">
        <h1 className="text-center my-4">InLive Demo</h1>
        <div className="grid grid-cols-2 gap-4">
          <Button>
            <Link href={`call/${randomId}`}>Group Call</Link> <TelephoneCall />
          </Button>
          <Button disabled>
            <Link href={`chat/${randomId}`}>Group Chat </Link>
            <ChatMessages />
          </Button>
        </div>
      </div>
    </>
  );
}

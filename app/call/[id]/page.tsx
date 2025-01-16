import GroupCallCmp from '@/components/video-conference';

export default async function ConferenceCallRoom({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <>
      <GroupCallCmp roomId={id} />
    </>
  );
}

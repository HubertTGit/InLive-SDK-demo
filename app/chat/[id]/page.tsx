export default async function ConferenceChatRoom({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <>{id}</>;
}

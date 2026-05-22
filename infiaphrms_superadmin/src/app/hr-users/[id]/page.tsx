import { HRUserDetailPage } from "@/components/hr-users/HRUserDetailPage";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function HRUserDetailRoute({ params }: Props) {
  const { id } = await params;
  return <HRUserDetailPage hrUserId={id} />;
}

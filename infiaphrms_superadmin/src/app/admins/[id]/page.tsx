import { AdminDetailPage } from "@/components/admins/AdminDetailPage";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function AdminDetailRoute({ params }: Props) {
  const { id } = await params;
  return <AdminDetailPage adminId={id} />;
}

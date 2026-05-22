import { RoleFormPage } from "@/components/roles/RoleFormPage";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditRoleRoute({ params }: Props) {
  const { id } = await params;
  return <RoleFormPage roleId={id} />;
}

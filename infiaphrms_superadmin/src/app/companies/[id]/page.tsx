import { CompanyDetailPage } from "@/components/companies/CompanyDetailPage";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function CompanyDetailRoute({ params }: Props) {
  const { id } = await params;
  return <CompanyDetailPage companyId={id} />;
}

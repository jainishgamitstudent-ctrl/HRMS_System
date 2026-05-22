import { InvoiceDetailPage } from "@/components/billing/InvoiceDetailPage";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function InvoiceDetailRoute({ params }: Props) {
  const { id } = await params;
  return <InvoiceDetailPage invoiceId={id} />;
}

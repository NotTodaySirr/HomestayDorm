import { notFound } from "next/navigation";
import { getDepositTickets } from "@/actions/deposit";
import { DepositListView } from "@/components/Deposit";

type DepositDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function DepositDetailPage({ params }: DepositDetailPageProps) {
  const { id } = await params;
  const deposits = await getDepositTickets();
  const depositExists = deposits.some((deposit) => deposit.id === id);

  // Server data includes Date objects, so serialize before passing into the client component.
  const serialized = JSON.parse(JSON.stringify(deposits));

  if (!depositExists) {
    notFound();
  }

  return <DepositListView initialDeposits={serialized} initialSelectedDepositId={id} />;
}

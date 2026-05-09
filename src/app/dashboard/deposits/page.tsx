import { getDepositTickets } from '@/actions/deposit';
import { DepositListView } from '@/components/Deposit';

export default async function DepositsPage() {
  const deposits = await getDepositTickets();

  // Serialize dates for client component
  const serialized = JSON.parse(JSON.stringify(deposits));

  return <DepositListView initialDeposits={serialized} />;
}

import { getAvailableRoomsWithBeds, getRegistrationsForDeposit } from '@/actions/deposit';
import { CreateDepositView } from '@/components/Deposit';

export default async function NewDepositPage() {
  const [rooms, registrations] = await Promise.all([
    getAvailableRoomsWithBeds(),
    getRegistrationsForDeposit(),
  ]);

  const serializedRooms = JSON.parse(JSON.stringify(rooms));
  const serializedRegs = JSON.parse(JSON.stringify(registrations));

  return <CreateDepositView rooms={serializedRooms} registrations={serializedRegs} />;
}

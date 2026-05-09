import React from 'react';
import { RegistrationListView } from '@/components/RoomRegistration';
import { getRegistrationTickets } from '@/actions/room-registration';

export default async function RegistrationsPage() {
  const tickets = await getRegistrationTickets();
  
  return (
    <div className="h-full w-full">
      <RegistrationListView initialTickets={tickets} />
    </div>
  );
}

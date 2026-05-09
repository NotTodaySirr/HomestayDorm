import React from 'react';
import { RoomRegistrationView } from '@/components/RoomRegistration';
import { getAvailableRooms } from '@/actions/room-registration';

export default async function NewRegistrationPage() {
  const rooms = await getAvailableRooms();

  return (
    <div className="h-full w-full">
      <RoomRegistrationView initialRooms={rooms} />
    </div>
  );
}

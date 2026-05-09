import React from 'react';
import { RoomRegistrationView } from '@/components/RoomRegistration';

export default function TestRoomRegistrationPage() {
  return (
    <div className="h-screen w-full bg-surface p-4">
      <RoomRegistrationView initialRooms={[]} />
    </div>
  );
}

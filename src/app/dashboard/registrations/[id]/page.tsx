import React from 'react';
import { notFound } from 'next/navigation';
import { RoomRegistrationView } from '@/components/RoomRegistration';
import { getAvailableRooms, getRegistrationById } from '@/actions/room-registration';

type EditRegistrationPageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditRegistrationPage({ params }: EditRegistrationPageProps) {
  const { id } = await params;
  const rooms = await getAvailableRooms();
  const registration = await getRegistrationById(id);

  if (!registration) {
    notFound();
  }

  return (
    <div className="h-full w-full">
      <RoomRegistrationView 
        initialRooms={rooms} 
        initialRegistration={registration} 
      />
    </div>
  );
}

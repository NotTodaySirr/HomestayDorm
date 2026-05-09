import React from 'react';
import { AppointmentListView } from '@/components/RoomRegistration';
import { getViewingAppointments } from '@/actions/room-registration';

export default async function AppointmentsPage() {
  const appointments = await getViewingAppointments();

  return (
    <div className="h-full w-full">
      <AppointmentListView initialAppointments={appointments} />
    </div>
  );
}

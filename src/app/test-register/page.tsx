import React from 'react';
import { RegistrationListView } from '@/components/RoomRegistration'; // Đổi đường dẫn theo dự án

export default function TestRegistrationListPage() {
  return (
    <div className="h-[calc(100vh-2rem)] w-full"> 
      <RegistrationListView />
    </div>
  );
}
"use client";

import React, { useTransition, useEffect, useState } from 'react';
import { createViewingAppointment, getRegistrationById } from '@/actions/room-registration';
import { Loader2 } from 'lucide-react';

interface ScheduleAppointmentModalProps {
  registrationId: string;
  onClose: () => void;
}

const CURRENT_BRANCH = "CN1 - Q.Bình Thạnh";

export const ScheduleAppointmentModal: React.FC<ScheduleAppointmentModalProps> = ({ registrationId, onClose }) => {
  const [isPending, startTransition] = useTransition();
  const [consultingRooms, setConsultingRooms] = useState<{id: string, name: string}[]>([]);
  const [isLoadingRooms, setIsLoadingRooms] = useState(true);

  // Lấy danh sách phòng đã tư vấn của phiếu này khi mở Modal
  useEffect(() => {
    async function fetchTicketData() {
      try {
        const data = await getRegistrationById(registrationId);
        if (data?.consultingRooms) {
          setConsultingRooms(data.consultingRooms);
        }
      } catch (error) {
        console.error("Lỗi lấy thông tin phòng:", error);
      } finally {
        setIsLoadingRooms(false);
      }
    }
    fetchTicketData();
  }, [registrationId]);

  const handleFormSubmit = async (formData: FormData) => {
    startTransition(async () => {
      try {
        await createViewingAppointment(registrationId, formData);
        onClose();
      } catch (error) {
        console.error('Schedule error:', error);
      }
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-[16px] font-['Segoe_UI'] text-on-surface">
      <form action={handleFormSubmit} className="bg-surface rounded-[8px] border border-border w-full max-w-md flex flex-col shadow-none">
        <div className="p-[16px] border-b border-border flex justify-between items-center bg-secondary rounded-t-[8px]">
          <h3 className="font-semibold text-[13px] uppercase tracking-wide">Lập lịch hẹn xem phòng</h3>
          <button type="button" onClick={onClose} disabled={isPending} className="text-on-surface-secondary hover:text-on-surface transition-colors disabled:opacity-50">&times;</button>
        </div>
        
        <div className="p-[16px] space-y-[12px]">
          <div className="grid grid-cols-2 gap-[10px]">
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-[0.06em] text-on-surface-secondary mb-[4px]">Ngày hẹn</label>
              <input name="date" type="date" required disabled={isPending} className="w-full bg-surface border border-border rounded-[5px] px-[10px] py-[7px] text-[13px] focus:outline-none focus:border-primary disabled:opacity-50" />
            </div>
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-[0.06em] text-on-surface-secondary mb-[4px]">Giờ hẹn</label>
              <input name="time" type="time" required disabled={isPending} className="w-full bg-surface border border-border rounded-[5px] px-[10px] py-[7px] text-[13px] focus:outline-none focus:border-primary disabled:opacity-50" />
            </div>
          </div>
        <div className="col-span-2">
            <label className="block text-[11px] font-semibold uppercase tracking-[0.06em] text-on-surface-secondary mb-[4px]">
              Phòng dự kiến xem (Có thể chọn nhiều)
            </label>
            {isLoadingRooms ? (
              <div className="text-[12px] text-on-surface-secondary animate-pulse">Đang tải danh sách phòng...</div>
            ) : consultingRooms.length > 0 ? (
              <div className="grid grid-cols-2 gap-[8px] max-h-[100px] overflow-y-auto p-[8px] bg-secondary border border-border rounded-[5px]">
                {consultingRooms.map(room => (
                  <label key={room.id} className="flex items-center gap-[8px] cursor-pointer hover:opacity-80 transition-opacity">
                    <input 
                      type="checkbox" 
                      name="roomIds" 
                      value={room.id} 
                      disabled={isPending}
                      className="w-[14px] h-[14px] accent-primary" 
                    />
                    <span className="text-[13px] font-semibold">Phòng {room.name}</span>
                  </label>
                ))}
              </div>
            ) : (
              <div className="text-[12px] text-on-surface-secondary italic p-[8px] bg-secondary border border-dashed border-border rounded-[5px]">
                Khách chưa được tư vấn phòng nào. Vẫn có thể tạo lịch hẹn chung.
              </div>
            )}
          </div>
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-[0.06em] text-on-surface-secondary mb-[4px]">Nơi hẹn / Lễ tân</label>
            <input name="meetingLocation" disabled={isPending} className="w-full bg-surface border border-border rounded-[5px] px-[10px] py-[7px] text-[13px] focus:outline-none focus:border-primary disabled:opacity-50" placeholder="VD: Sảnh lễ tân CN1..." />
          </div>
        </div>

        <div className="p-[16px] border-t border-border flex justify-end gap-[10px] bg-surface rounded-b-[8px]">
          <button type="button" onClick={onClose} disabled={isPending} className="px-[14px] py-[7px] border border-border rounded-[5px] text-[12px] font-semibold hover:bg-secondary">
            Đóng
          </button>
          <button 
            type="submit" 
            disabled={isPending || isLoadingRooms}
            className="bg-primary text-white px-[14px] py-[7px] rounded-[5px] text-[12px] font-semibold hover:bg-primary-light flex items-center gap-[6px] disabled:opacity-50"
          >
            {isPending ? <Loader2 className="w-[14px] h-[14px] animate-spin" /> : "Xác nhận lịch hẹn"}
          </button>
        </div>
      </form>
    </div>
  );
};
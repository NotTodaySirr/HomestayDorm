"use client";

import React, { useState, useTransition } from 'react';
import { UpdateViewingResultModal } from './UpdateViewingResultModal';
import { cancelViewingAppointment } from '@/actions/room-registration';
import { Loader2, AlertCircle } from 'lucide-react';

// ... (other imports remain)

const CURRENT_BRANCH = "CN1 - Q.Bình Thạnh";

export interface AppointmentData {
  id: string;
  datetime: Date;
  registration: { customerName: string; phoneNumber: string; } | null;
  room: { name: string; } | null;
  assignee: { name: string | null; } | null;
  status: string;
}

const formatDateTime = (date: Date) => {
  return new Intl.DateTimeFormat('vi-VN', { 
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  }).format(date);
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'UPCOMING': return 'bg-primary-container text-primary';
    case 'VIEWED': return 'bg-success-container text-success';
    case 'CANCELLED': return 'bg-error-container text-error';
    default: return 'bg-secondary text-on-surface';
  }
};

const getStatusLabel = (status: string) => {
  switch (status) {
    case 'UPCOMING': return 'Sắp tới';
    case 'VIEWED': return 'Đã xem';
    case 'CANCELLED': return 'Đã hủy';
    default: return status;
  }
};

function CancelModal({ aptId, onClose }: { aptId: string; onClose: () => void }) {
  const [isPending, startTransition] = useTransition();

  const handleConfirm = () => {
    startTransition(async () => {
      try {
        await cancelViewingAppointment(aptId);
        onClose();
      } catch (error) {
        console.error('Lỗi khi hủy:', error);
      }
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 font-['Segoe_UI']">
      <div className="bg-surface rounded-[8px] border border-border w-full max-w-sm shadow-lg overflow-hidden transform transition-all">
        <div className="p-4 border-b border-border bg-error-container/30 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-error-container flex items-center justify-center shrink-0">
            <AlertCircle className="w-4 h-4 text-error" />
          </div>
          <div>
            <h3 className="font-semibold text-[14px] text-error">Hủy lịch hẹn xem phòng</h3>
            <p className="text-[11px] text-on-surface-secondary mt-0.5">Xác nhận hủy lịch hẹn với khách hàng</p>
          </div>
        </div>
        <div className="p-5 text-[13px] text-on-surface-secondary leading-relaxed">
          Bạn có chắc chắn muốn hủy lịch hẹn xem phòng này không? Trạng thái của phiếu đăng ký liên quan có thể cũng sẽ được cập nhật.
        </div>
        <div className="p-4 border-t border-border bg-secondary/50 flex justify-end gap-2">
          <button onClick={onClose} disabled={isPending} className="px-4 py-2 bg-surface border border-border rounded-[5px] text-[12px] font-semibold hover:bg-secondary disabled:opacity-50 transition-colors">
            Giữ lại lịch
          </button>
          <button onClick={handleConfirm} disabled={isPending} className="px-4 py-2 bg-error text-white rounded-[5px] text-[12px] font-semibold hover:bg-error/90 disabled:opacity-50 flex items-center gap-2 transition-colors">
            {isPending ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Đang hủy...</> : 'Xác nhận hủy'}
          </button>
        </div>
      </div>
    </div>
  );
}

interface Props {
  initialAppointments: AppointmentData[];
}

export const AppointmentListView: React.FC<Props> = ({ initialAppointments }) => {
  const [updateModalAptId, setUpdateModalAptId] = useState<string | null>(null);
  const [cancelModalAptId, setCancelModalAptId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isPending, startTransition] = useTransition();

  const handleCancel = (id: string) => {
    setCancelModalAptId(id);
  };

  const filteredAppointments = initialAppointments.filter(apt => {
    if (!searchQuery) return true;
    const lowerQ = searchQuery.toLowerCase();
    return (
      apt.registration?.customerName.toLowerCase().includes(lowerQ) ||
      apt.registration?.phoneNumber.includes(lowerQ) ||
      apt.room?.name.toLowerCase().includes(lowerQ)
    );
  });

  const ITEMS_PER_PAGE = 5;
  const totalPages = Math.ceil(filteredAppointments.length / ITEMS_PER_PAGE);
  const paginatedAppointments = filteredAppointments.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  return (
    <div className="h-full flex flex-col gap-[10px] p-[16px] bg-secondary font-['Segoe_UI'] text-on-surface">
      {/* Header Area */}
      <div className="bg-surface border border-border rounded-[8px] p-[16px] flex flex-col gap-[12px] shrink-0">
        <h2 className="text-[15px] font-semibold">Lịch hẹn xem phòng</h2>
        
        {/* Filter Bar */}
        <div className="grid grid-cols-4 gap-[10px]">
          <input 
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
            className="bg-surface border border-border rounded-[5px] px-[10px] py-[7px] text-[13px] focus:outline-none focus:border-primary placeholder:text-on-surface-secondary col-span-2" 
            placeholder="Tìm theo tên khách, SĐT, hoặc phòng..." 
          />
          <select className="bg-surface border border-border rounded-[5px] px-[10px] py-[7px] text-[13px] focus:outline-none focus:border-primary text-on-surface-secondary">
            <option value="">Tất cả trạng thái</option>
            <option value="upcoming">Sắp tới</option>
            <option value="viewed">Đã xem</option>
            <option value="cancelled">Đã hủy</option>
          </select>
        </div>
      </div>

      {/* Data Grid */}
      <div className="flex-1 overflow-auto border border-border rounded-[8px] bg-surface flex flex-col">
        <table className="w-full text-[13px] text-left border-collapse">
          <thead className="bg-secondary border-b border-border sticky top-0 z-10">
            <tr>
              <th className="px-[12px] py-[8px] text-[11px] font-semibold uppercase tracking-[0.06em] text-on-surface-secondary">Ngày Giờ</th>
              <th className="px-[12px] py-[8px] text-[11px] font-semibold uppercase tracking-[0.06em] text-on-surface-secondary">Khách Hàng</th>
              <th className="px-[12px] py-[8px] text-[11px] font-semibold uppercase tracking-[0.06em] text-on-surface-secondary">SĐT</th>
              <th className="px-[12px] py-[8px] text-[11px] font-semibold uppercase tracking-[0.06em] text-on-surface-secondary">Phòng Dự Kiến Xem</th>
              <th className="px-[12px] py-[8px] text-[11px] font-semibold uppercase tracking-[0.06em] text-on-surface-secondary">Nhân Viên Phụ Trách</th>
              <th className="px-[12px] py-[8px] text-[11px] font-semibold uppercase tracking-[0.06em] text-on-surface-secondary">Trạng Thái</th>
              <th className="px-[12px] py-[8px] text-[11px] font-semibold uppercase tracking-[0.06em] text-on-surface-secondary text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {paginatedAppointments.map((apt, idx) => (
              <tr key={apt.id} className="border-b border-border hover:bg-primary-container transition-colors group">
                <td className="px-[12px] py-[8px] text-[13px] font-mono text-primary font-semibold">{formatDateTime(apt.datetime)}</td>
                <td className="px-[12px] py-[8px] text-[13px] font-semibold">{apt.registration?.customerName || 'N/A'}</td>
                <td className="px-[12px] py-[8px] text-[13px] font-mono text-on-surface-secondary">{apt.registration?.phoneNumber || 'N/A'}</td>
                <td className="px-[12px] py-[8px] text-[13px]">Phòng {apt.room?.name || 'N/A'}</td>
                <td className="px-[12px] py-[8px] text-[13px] text-on-surface-secondary">{apt.assignee?.name || 'Chưa phân công'}</td>
                <td className="px-[12px] py-[8px]">
                  <span className={`px-[9px] py-[3px] text-[10px] font-semibold rounded-full uppercase tracking-wider inline-flex items-center justify-center ${getStatusColor(apt.status)}`}>
                    {getStatusLabel(apt.status)}
                  </span>
                </td>
                <td className="px-[12px] py-[8px] text-right flex items-center justify-end gap-[6px]">
                  {apt.status === 'UPCOMING' && (
                    <>
                      <button 
                        onClick={() => setUpdateModalAptId(apt.id)}
                        disabled={isPending}
                        className="bg-primary text-white px-[14px] py-[5px] rounded-[5px] text-[12px] font-semibold hover:bg-primary-light flex items-center gap-[6px] transition-colors disabled:opacity-50"
                      >
                        K.Quả 
                      </button>
                      <button 
                        onClick={() => handleCancel(apt.id)}
                        disabled={isPending}
                        className="bg-surface border border-error/50 text-error px-[14px] py-[5px] rounded-[5px] text-[12px] font-semibold hover:bg-error-container flex items-center gap-[6px] transition-colors disabled:opacity-50"
                      >
                        Hủy 
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
            {paginatedAppointments.length === 0 && (
              <tr>
                <td colSpan={7} className="px-[12px] py-[32px] text-center text-on-surface-secondary text-[13px]">
                  Không tìm thấy lịch hẹn nào.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center bg-surface border border-border rounded-[8px] p-[10px] shrink-0">
          <div className="text-[12px] text-on-surface-secondary">
            Hiển thị <span className="font-semibold text-on-surface">{((currentPage - 1) * ITEMS_PER_PAGE) + 1}</span> - <span className="font-semibold text-on-surface">{Math.min(currentPage * ITEMS_PER_PAGE, filteredAppointments.length)}</span> trong số <span className="font-semibold text-on-surface">{filteredAppointments.length}</span> lịch hẹn
          </div>
          <div className="flex gap-[6px]">
            <button 
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-[10px] py-[5px] bg-secondary border border-border rounded-[5px] text-[12px] font-semibold hover:bg-surface disabled:opacity-50 transition-colors"
            >
              Trang trước
            </button>
            <button 
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-[10px] py-[5px] bg-secondary border border-border rounded-[5px] text-[12px] font-semibold hover:bg-surface disabled:opacity-50 transition-colors"
            >
              Trang sau
            </button>
          </div>
        </div>
      )}

      {updateModalAptId && <UpdateViewingResultModal appointmentId={updateModalAptId} onClose={() => setUpdateModalAptId(null)} />}
      {cancelModalAptId && <CancelModal aptId={cancelModalAptId} onClose={() => setCancelModalAptId(null)} />}
    </div>
  );
};

"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { ScheduleAppointmentModal } from './ScheduleAppointmentModal';
import { WaitlistModal } from './WaitlistModal';
import { CancelRegistrationModal } from './CancelRegistrationModal';

export interface RegistrationTicketData {
  id: string;
  customerName: string;
  phoneNumber: string;
  createdAt: Date;
  headcount: number | null;
  gender: string | null;
  preferredArea: string | null;
  status: string;
}

const formatNeed = (headcount: number | null, gender: string | null, area: string | null) => {
  const parts = [];
  if (headcount) parts.push(`${headcount} ${gender === 'm' ? 'Nam' : gender === 'f' ? 'Nữ' : 'Người'}`);
  if (area) {
    const areaName = area === 'binh_thanh' ? 'Q.Bình Thạnh' : area === 'q10' ? 'Q.10' : area === 'q7' ? 'Q.7' : area;
    parts.push(areaName);
  }
  return parts.join(' - ') || 'Chưa xác định';
};

const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(date);
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'DRAFT': return 'bg-secondary-dark text-on-surface-secondary';
    case 'CONSULTING': return 'bg-primary-container text-primary';
    case 'WAITING_VIEW': return 'bg-warning-container text-warning';
    case 'WAITLIST': return 'bg-warning-container text-warning opacity-80';
    case 'CANCELLED': return 'bg-error-container text-error';
    case 'COMPLETED': return 'bg-success-container text-success';
    default: return 'bg-secondary text-on-surface';
  }
};

const getStatusLabel = (status: string) => {
  switch (status) {
    case 'DRAFT': return 'Nháp';
    case 'CONSULTING': return 'Đang tư vấn';
    case 'WAITING_VIEW': return 'Chờ xem phòng';
    case 'WAITLIST': return 'Danh sách chờ';
    case 'CANCELLED': return 'Đã hủy';
    case 'COMPLETED': return 'Hoàn thành';
    default: return status;
  }
};

interface Props {
  initialTickets: RegistrationTicketData[];
}

export const RegistrationListView: React.FC<Props> = ({ initialTickets }) => {
  const router = useRouter();
  const [scheduleModalRegId, setScheduleModalRegId] = React.useState<string | null>(null);
  const [waitlistModalRegId, setWaitlistModalRegId] = React.useState<string | null>(null);
  const [cancelModalRegId, setCancelModalRegId] = React.useState<string | null>(null);

  const [searchQuery, setSearchQuery] = React.useState('');
  const [currentPage, setCurrentPage] = React.useState(1);

  const filteredTickets = initialTickets.filter(reg => {
    if (!searchQuery) return true;
    const lowerQ = searchQuery.toLowerCase();
    return (
      reg.id.toLowerCase().includes(lowerQ) ||
      reg.customerName.toLowerCase().includes(lowerQ) ||
      reg.phoneNumber.includes(lowerQ)
    );
  });

  const ITEMS_PER_PAGE = 5;
  const totalPages = Math.ceil(filteredTickets.length / ITEMS_PER_PAGE);
  const paginatedTickets = filteredTickets.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  return (
    <div className="h-full flex flex-col gap-[10px] p-[16px] bg-secondary font-['Segoe_UI'] text-on-surface">
      {/* Header Area */}
      <div className="bg-surface border border-border rounded-[8px] p-[16px] flex flex-col gap-[12px] shrink-0">
        <h2 className="text-[15px] font-semibold">Danh sách phiếu đăng ký</h2>
        
        {/* Filter Bar */}
        <div className="grid grid-cols-4 gap-[10px]">
          <input 
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
            className="bg-surface border border-border rounded-[5px] px-[10px] py-[7px] text-[13px] focus:outline-none focus:border-primary placeholder:text-on-surface-secondary col-span-3" 
            placeholder="Tìm theo mã phiếu, tên khách, hoặc SĐT..." 
          />
          <select className="bg-surface border border-border rounded-[5px] px-[10px] py-[7px] text-[13px] focus:outline-none focus:border-primary text-on-surface-secondary">
            <option value="">Tất cả trạng thái</option>
            <option value="draft">Nháp</option>
            <option value="consulting">Đang tư vấn</option>
            <option value="waiting_view">Chờ xem phòng</option>
            <option value="waitlist">Danh sách chờ</option>
            <option value="cancelled">Đã hủy</option>
          </select>
        </div>
      </div>

      {/* Data Grid */}
      <div className="flex-1 overflow-auto border border-border rounded-[8px] bg-surface flex flex-col">
        <table className="w-full text-[13px] text-left border-collapse">
          <thead className="bg-secondary border-b border-border sticky top-0 z-10">
            <tr>
              <th className="px-[12px] py-[8px] text-[11px] font-semibold uppercase tracking-[0.06em] text-on-surface-secondary">Mã Phiếu</th>
              <th className="px-[12px] py-[8px] text-[11px] font-semibold uppercase tracking-[0.06em] text-on-surface-secondary">Khách Hàng</th>
              <th className="px-[12px] py-[8px] text-[11px] font-semibold uppercase tracking-[0.06em] text-on-surface-secondary">SĐT</th>
              <th className="px-[12px] py-[8px] text-[11px] font-semibold uppercase tracking-[0.06em] text-on-surface-secondary">Ngày Tạo</th>
              <th className="px-[12px] py-[8px] text-[11px] font-semibold uppercase tracking-[0.06em] text-on-surface-secondary">Nhu Cầu</th>
              <th className="px-[12px] py-[8px] text-[11px] font-semibold uppercase tracking-[0.06em] text-on-surface-secondary">Trạng Thái</th>
              <th className="px-[12px] py-[8px] text-[11px] font-semibold uppercase tracking-[0.06em] text-on-surface-secondary text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {paginatedTickets.map((reg, idx) => (
              <tr key={reg.id} className="border-b border-border hover:bg-primary-container transition-colors group">
                <td className="px-[12px] py-[8px] font-semibold text-[13px] text-primary">{reg.id.split('-')[0].toUpperCase()}</td>
                <td className="px-[12px] py-[8px] text-[13px] font-semibold">{reg.customerName}</td>
                <td className="px-[12px] py-[8px] text-[13px] font-mono text-on-surface-secondary">{reg.phoneNumber}</td>
                <td className="px-[12px] py-[8px] text-[13px] text-on-surface-secondary">{formatDate(reg.createdAt)}</td>
                <td className="px-[12px] py-[8px] text-[13px]">{formatNeed(reg.headcount, reg.gender, reg.preferredArea)}</td>
                <td className="px-[12px] py-[8px]">
                  <span className={`px-[9px] py-[3px] text-[10px] font-semibold rounded-full uppercase tracking-wider inline-flex items-center justify-center ${getStatusColor(reg.status)}`}>
                    {getStatusLabel(reg.status)}
                  </span>
                </td>
                <td className="px-[12px] py-[8px] text-right flex justify-end gap-[6px]">
                  {reg.status !== 'CANCELLED' && reg.status !== 'COMPLETED' && (
                    <>
                      <button 
                        onClick={() => setScheduleModalRegId(reg.id)}
                        title="Lập lịch hẹn"
                        className="bg-surface border border-border text-on-surface px-[10px] py-[5px] rounded-[5px] text-[12px] font-semibold hover:bg-secondary transition-colors"
                      >
                        Lịch hẹn
                      </button>
                      <button 
                        onClick={() => setWaitlistModalRegId(reg.id)}
                        title="Đưa vào Waitlist"
                        className="bg-surface border border-warning text-warning px-[10px] py-[5px] rounded-[5px] text-[12px] font-semibold hover:bg-warning-container transition-colors"
                      >
                        Chờ
                      </button>
                      <button 
                        onClick={() => setCancelModalRegId(reg.id)}
                        title="Hủy phiếu"
                        className="bg-surface border border-error text-error px-[10px] py-[5px] rounded-[5px] text-[12px] font-semibold hover:bg-error-container transition-colors"
                      >
                        Hủy
                      </button>
                    </>
                  )}
                  <button 
                    onClick={() => router.push('/dashboard/registrations/new')}
                    className="bg-surface border border-border text-on-surface px-[10px] py-[5px] rounded-[5px] text-[12px] font-semibold hover:bg-secondary flex items-center justify-center gap-[6px] transition-colors"
                  >
                    Mở 
                  </button>
                </td>
              </tr>
            ))}
            {paginatedTickets.length === 0 && (
              <tr>
                <td colSpan={7} className="px-[12px] py-[32px] text-center text-on-surface-secondary text-[13px]">
                  Không tìm thấy phiếu đăng ký nào.
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
            Hiển thị <span className="font-semibold text-on-surface">{((currentPage - 1) * ITEMS_PER_PAGE) + 1}</span> - <span className="font-semibold text-on-surface">{Math.min(currentPage * ITEMS_PER_PAGE, filteredTickets.length)}</span> trong số <span className="font-semibold text-on-surface">{filteredTickets.length}</span> phiếu
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

      {scheduleModalRegId && <ScheduleAppointmentModal registrationId={scheduleModalRegId} onClose={() => setScheduleModalRegId(null)} />}
      {waitlistModalRegId && <WaitlistModal registrationId={waitlistModalRegId} onClose={() => setWaitlistModalRegId(null)} />}
      {cancelModalRegId && <CancelRegistrationModal registrationId={cancelModalRegId} onClose={() => setCancelModalRegId(null)} />}
    </div>
  );
};

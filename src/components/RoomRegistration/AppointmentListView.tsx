"use client";

import React, { useState } from 'react';
import { UpdateViewingResultModal } from './UpdateViewingResultModal';

const CURRENT_BRANCH = "CN1 - Q.Bình Thạnh";

const MOCK_APPOINTMENTS = [
  { id: 'APT-101', datetime: '06/05/2026 14:30', customer: 'Nguyễn Văn A', phone: '0901234567', room: 'Phòng 101', assignee: 'NV001 - Tâm', status: 'Sắp tới' },
  { id: 'APT-102', datetime: '05/05/2026 09:00', customer: 'Lê Thị C', phone: '0912345678', room: 'Phòng 205', assignee: 'NV002 - Phát', status: 'Đã xem' },
  { id: 'APT-103', datetime: '04/05/2026 16:00', customer: 'Trần Văn B', phone: '0923456789', room: 'Phòng 302', assignee: 'NV001 - Tâm', status: 'Đã hủy' },
  { id: 'APT-104', datetime: '07/05/2026 10:00', customer: 'Phạm Văn D', phone: '0934567890', room: 'Phòng 401', assignee: 'NV003 - Hùng', status: 'Sắp tới' },
  { id: 'APT-105', datetime: '05/05/2026 15:30', customer: 'Hoàng Thị E', phone: '0945678901', room: 'Phòng 202', assignee: 'NV002 - Phát', status: 'Đã xem' },
];

const getStatusColor = (status: string) => {
  switch (status) {
    case 'Sắp tới': return 'bg-primary-container text-primary';
    case 'Đã xem': return 'bg-success-container text-success';
    case 'Đã hủy': return 'bg-error-container text-error';
    default: return 'bg-secondary text-on-surface';
  }
};

export const AppointmentListView: React.FC = () => {
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);

  return (
    <div className="h-full flex flex-col gap-[10px] p-[16px] bg-secondary font-['Segoe_UI'] text-on-surface">
      {/* Header Area */}
      <div className="bg-surface border border-border rounded-[8px] p-[16px] flex flex-col gap-[12px] shrink-0">
        <h2 className="text-[15px] font-semibold">Lịch hẹn xem phòng</h2>
        
        {/* Filter Bar */}
        <div className="grid grid-cols-3 gap-[10px]">
          <input 
            type="date"
            className="bg-surface border border-border rounded-[5px] px-[10px] py-[7px] text-[13px] focus:outline-none focus:border-primary text-on-surface" 
          />
          <input 
            className="bg-surface border border-border rounded-[5px] px-[10px] py-[7px] text-[13px] focus:outline-none focus:border-primary placeholder:text-on-surface-secondary" 
            placeholder="Tên khách hàng..." 
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
            {MOCK_APPOINTMENTS.map((apt, idx) => (
              <tr key={idx} className="border-b border-border hover:bg-primary-container transition-colors group">
                <td className="px-[12px] py-[8px] text-[13px] font-mono text-primary font-semibold">{apt.datetime}</td>
                <td className="px-[12px] py-[8px] text-[13px] font-semibold">{apt.customer}</td>
                <td className="px-[12px] py-[8px] text-[13px] font-mono text-on-surface-secondary">{apt.phone}</td>
                <td className="px-[12px] py-[8px] text-[13px]">{apt.room}</td>
                <td className="px-[12px] py-[8px] text-[13px] text-on-surface-secondary">{apt.assignee}</td>
                <td className="px-[12px] py-[8px]">
                  <span className={`px-[9px] py-[3px] text-[10px] font-semibold rounded-full uppercase tracking-wider inline-flex items-center justify-center ${getStatusColor(apt.status)}`}>
                    {apt.status}
                  </span>
                </td>
                <td className="px-[12px] py-[8px] text-right flex items-center justify-end gap-[6px]">
                  <button 
                    onClick={() => setIsUpdateModalOpen(true)}
                    className="bg-primary text-white px-[14px] py-[5px] rounded-[5px] text-[12px] font-semibold hover:bg-primary-light flex items-center gap-[6px] transition-colors"
                  >
                    Cập nhật K.Quả 
                    <span className="bg-primary-light text-secondary-darker rounded-[3px] font-mono text-[10px] px-[4px] py-[1px]">U</span>
                  </button>
                  <button className="bg-surface border border-error/50 text-error px-[14px] py-[5px] rounded-[5px] text-[12px] font-semibold hover:bg-error-container flex items-center gap-[6px] transition-colors">
                    Hủy Lịch 
                    <span className="bg-error-container text-error rounded-[3px] font-mono text-[10px] px-[4px] py-[1px]">Del</span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {isUpdateModalOpen && <UpdateViewingResultModal onClose={() => setIsUpdateModalOpen(false)} />}
    </div>
  );
};

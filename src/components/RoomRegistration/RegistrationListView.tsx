"use client";

import React from 'react';
import { useRouter } from 'next/navigation';

const MOCK_REGISTRATIONS = [
  { id: 'REG-001', customer: 'Nguyễn Văn A', phone: '0901234567', date: '05/05/2026', need: '1 Nam - Q.Bình Thạnh', status: 'Nháp' },
  { id: 'REG-002', customer: 'Trần Thị B', phone: '0912345678', date: '04/05/2026', need: '2 Nữ - Q.10', status: 'Đang tư vấn' },
  { id: 'REG-003', customer: 'Lê Văn C', phone: '0923456789', date: '03/05/2026', need: '1 Nam - Q.7', status: 'Chờ xem phòng' },
  { id: 'REG-004', customer: 'Phạm Thị D', phone: '0934567890', date: '02/05/2026', need: '4 Nữ - Q.Bình Thạnh', status: 'Danh sách chờ' },
  { id: 'REG-005', customer: 'Hoàng Văn E', phone: '0945678901', date: '01/05/2026', need: '1 Nam - Q.10', status: 'Đã hủy' },
];

const getStatusColor = (status: string) => {
  switch (status) {
    case 'Nháp': return 'bg-secondary-dark text-on-surface-secondary';
    case 'Đang tư vấn': return 'bg-primary-container text-primary';
    case 'Chờ xem phòng': return 'bg-warning-container text-warning';
    case 'Danh sách chờ': return 'bg-warning-container text-warning opacity-80';
    case 'Đã hủy': return 'bg-error-container text-error';
    default: return 'bg-secondary text-on-surface';
  }
};

export const RegistrationListView: React.FC = () => {
  const router = useRouter();

  return (
    <div className="h-full flex flex-col gap-[10px] p-[16px] bg-secondary font-['Segoe_UI'] text-on-surface">
      {/* Header Area */}
      <div className="bg-surface border border-border rounded-[8px] p-[16px] flex flex-col gap-[12px] shrink-0">
        <h2 className="text-[15px] font-semibold">Danh sách phiếu đăng ký</h2>
        
        {/* Filter Bar */}
        <div className="grid grid-cols-5 gap-[10px]">
          <input 
            className="bg-surface border border-border rounded-[5px] px-[10px] py-[7px] text-[13px] focus:outline-none focus:border-primary placeholder:text-on-surface-secondary" 
            placeholder="Mã phiếu..." 
          />
          <input 
            className="bg-surface border border-border rounded-[5px] px-[10px] py-[7px] text-[13px] focus:outline-none focus:border-primary placeholder:text-on-surface-secondary" 
            placeholder="Tên khách hàng..." 
          />
          <input 
            className="bg-surface border border-border rounded-[5px] px-[10px] py-[7px] text-[13px] focus:outline-none focus:border-primary placeholder:text-on-surface-secondary" 
            placeholder="Số điện thoại..." 
          />
          <select className="bg-surface border border-border rounded-[5px] px-[10px] py-[7px] text-[13px] focus:outline-none focus:border-primary text-on-surface-secondary col-span-2">
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
            {MOCK_REGISTRATIONS.map((reg, idx) => (
              <tr key={idx} className="border-b border-border hover:bg-primary-container transition-colors group">
                <td className="px-[12px] py-[8px] font-semibold text-[13px]">{reg.id}</td>
                <td className="px-[12px] py-[8px] text-[13px]">{reg.customer}</td>
                <td className="px-[12px] py-[8px] text-[13px] font-mono text-on-surface-secondary">{reg.phone}</td>
                <td className="px-[12px] py-[8px] text-[13px] text-on-surface-secondary">{reg.date}</td>
                <td className="px-[12px] py-[8px] text-[13px]">{reg.need}</td>
                <td className="px-[12px] py-[8px]">
                  <span className={`px-[9px] py-[3px] text-[10px] font-semibold rounded-full uppercase tracking-wider inline-flex items-center justify-center ${getStatusColor(reg.status)}`}>
                    {reg.status}
                  </span>
                </td>
                <td className="px-[12px] py-[8px] text-right">
                  <button 
                    onClick={() => router.push('/dashboard/registrations/new')}
                    className="bg-surface border border-border text-on-surface px-[14px] py-[5px] rounded-[5px] text-[12px] font-semibold hover:bg-secondary flex items-center justify-center gap-[6px] ml-auto transition-colors"
                  >
                    Mở / Cập nhật 
                    <span className="bg-secondary-dark text-on-surface-secondary rounded-[3px] font-mono text-[10px] px-[4px] py-[1px] ml-[2px]">Enter</span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

"use client";

import React, { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { createDepositTicket } from '@/actions/deposit';
import { Loader2 } from 'lucide-react';

type RoomWithBeds = {
  id: string;
  name: string;
  capacity: number;
  occupancy: number;
  price: number;
  status: string;
  beds: {
    id: string;
    position: string;
    price: number;
    status: string;
  }[];
};

type Registration = {
  id: string;
  customerName: string;
  phoneNumber: string;
  email: string | null;
  cccd: string | null;
  gender: string | null;
  rentalType: string | null;
  headcount: number | null;
  preferredArea: string | null;
  status: string;
};

interface Props {
  rooms: RoomWithBeds[];
  registrations: Registration[];
}

function formatCurrency(n: number) {
  return n.toLocaleString('vi-VN') + 'đ';
}

const bedStatusLabel: Record<string, { label: string; cls: string }> = {
  AVAILABLE:   { label: 'Trống',     cls: 'bg-success-container text-success' },
  OCCUPIED:    { label: 'Đã thuê',   cls: 'bg-error-container text-error' },
  DEPOSITED:   { label: 'Đã cọc',    cls: 'bg-warning-container text-warning' },
  MAINTENANCE: { label: 'Bảo trì',   cls: 'bg-secondary text-on-surface-secondary' },
};

export const CreateDepositView: React.FC<Props> = ({ rooms, registrations }) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [selectedRegId, setSelectedRegId] = useState('');
  const [selectedRoomId, setSelectedRoomId] = useState('');
  const [selectedBedIds, setSelectedBedIds] = useState<Set<string>>(new Set());

  const selectedRoom = rooms.find(r => r.id === selectedRoomId);
  const availableBeds = selectedRoom?.beds.filter(b => b.status === 'AVAILABLE') || [];

  // Calculate deposit: Σ(bed.price × 2)
  const selectedBeds = selectedRoom?.beds.filter(b => selectedBedIds.has(b.id)) || [];
  const totalDeposit = selectedBeds.reduce((sum, bed) => sum + bed.price * 2, 0);

  const toggleBed = (bedId: string) => {
    setSelectedBedIds(prev => {
      const next = new Set(prev);
      if (next.has(bedId)) next.delete(bedId);
      else next.add(bedId);
      return next;
    });
  };

  const handleRoomChange = (roomId: string) => {
    setSelectedRoomId(roomId);
    setSelectedBedIds(new Set());
  };

  const handleSubmit = () => {
    if (!selectedRegId || selectedBedIds.size === 0) return;
    startTransition(async () => {
      const formData = new FormData();
      formData.set('registrationId', selectedRegId);
      formData.set('bedIds', Array.from(selectedBedIds).join(','));
      await createDepositTicket(formData);
      router.push('/dashboard/deposits');
    });
  };

  const selectedReg = registrations.find(r => r.id === selectedRegId);

  return (
    <div className="h-full flex gap-[10px] p-4 bg-secondary font-['Segoe_UI'] text-on-surface">

      {/* Left Panel — Room & Bed Selection */}
      <div className="w-[55%] flex flex-col gap-[10px]">
        {/* Room List */}
        <div className="bg-surface border border-border rounded-[8px] p-4 shrink-0">
          <h2 className="text-[15px] font-semibold mb-3">Chọn phòng</h2>
          <div className="grid grid-cols-3 gap-2">
            {rooms.map(room => {
              const available = room.beds.filter(b => b.status === 'AVAILABLE').length;
              const isSelected = room.id === selectedRoomId;
              return (
                <button
                  key={room.id}
                  onClick={() => handleRoomChange(room.id)}
                  className={`p-3 border rounded-[6px] text-left transition-all ${
                    isSelected 
                      ? 'border-primary bg-primary-container ring-1 ring-primary' 
                      : 'border-border hover:border-primary hover:bg-primary-container'
                  } ${available === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                  disabled={available === 0}
                >
                  <div className="font-semibold text-[13px]">Phòng {room.name}</div>
                  <div className="text-[11px] text-on-surface-secondary mt-1">
                    {available}/{room.capacity} giường trống • {formatCurrency(room.price)}/giường
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Bed Grid */}
        <div className="flex-1 bg-surface border border-border rounded-[8px] p-4 overflow-auto">
          <h2 className="text-[15px] font-semibold mb-3">
            {selectedRoom ? `Giường trong Phòng ${selectedRoom.name}` : 'Chọn phòng để xem giường'}
          </h2>
          {selectedRoom ? (
            <div className="grid grid-cols-2 gap-3">
              {selectedRoom.beds.map(bed => {
                const st = bedStatusLabel[bed.status] || { label: bed.status, cls: '' };
                const isAvailable = bed.status === 'AVAILABLE';
                const isSelected = selectedBedIds.has(bed.id);
                return (
                  <button
                    key={bed.id}
                    onClick={() => isAvailable && toggleBed(bed.id)}
                    disabled={!isAvailable}
                    className={`p-4 border-2 rounded-[8px] text-left transition-all ${
                      isSelected
                        ? 'border-primary bg-primary-container ring-2 ring-primary'
                        : isAvailable
                          ? 'border-border hover:border-primary cursor-pointer'
                          : 'border-border opacity-50 cursor-not-allowed'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-semibold text-[14px]">{bed.position}</div>
                        <div className="text-[13px] text-primary font-semibold mt-1">{formatCurrency(bed.price)}/tháng</div>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${st.cls}`}>
                        {st.label}
                      </span>
                    </div>
                    {isSelected && (
                      <div className="mt-2 text-[11px] text-primary font-semibold">✓ Đã chọn — Cọc: {formatCurrency(bed.price * 2)}</div>
                    )}
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="flex items-center justify-center h-40 text-on-surface-secondary text-[13px] italic">
              Vui lòng chọn một phòng từ danh sách bên trên
            </div>
          )}
        </div>
      </div>

      {/* Right Panel — Deposit Form */}
      <div className="flex-1 flex flex-col bg-surface border border-border rounded-[8px] p-4">
        <div className="flex justify-between items-center mb-4 pb-3 border-b border-border">
          <h2 className="text-[15px] font-semibold">Phiếu đặt cọc</h2>
          <span className="bg-warning-container text-warning px-[9px] py-[3px] rounded-full text-[10px] font-semibold uppercase tracking-wider">
            Mới
          </span>
        </div>

        <div className="flex-1 overflow-auto space-y-6">
          {/* Select Registration */}
          <section>
            <div className="text-[11px] font-semibold uppercase tracking-[0.06em] text-on-surface-secondary mb-2">
              1. Liên kết phiếu đăng ký
            </div>
            <select
              value={selectedRegId}
              onChange={(e) => setSelectedRegId(e.target.value)}
              className="w-full bg-surface border border-border rounded-[5px] px-3 py-2 text-[13px] focus:outline-none focus:border-primary"
            >
              <option value="">Chọn phiếu đăng ký...</option>
              {registrations.map(reg => (
                <option key={reg.id} value={reg.id}>
                  {reg.customerName} — {reg.phoneNumber}
                </option>
              ))}
            </select>
            {selectedReg && (
              <div className="mt-2 p-3 bg-secondary rounded-[5px] border border-border text-[12px] space-y-1">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-[13px]">{selectedReg.customerName}</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-success-container text-success">
                    {selectedReg.status}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-2 text-[12px]">
                  <div><span className="text-on-surface-secondary">SĐT:</span> {selectedReg.phoneNumber}</div>
                  {selectedReg.email && <div><span className="text-on-surface-secondary">Email:</span> {selectedReg.email}</div>}
                  {selectedReg.cccd && <div><span className="text-on-surface-secondary">CCCD:</span> {selectedReg.cccd}</div>}
                  {selectedReg.gender && <div><span className="text-on-surface-secondary">Giới tính:</span> {selectedReg.gender === 'm' ? 'Nam' : selectedReg.gender === 'f' ? 'Nữ' : 'Khác'}</div>}
                  {selectedReg.rentalType && <div><span className="text-on-surface-secondary">Hình thức:</span> {selectedReg.rentalType === 'nguyen_can' ? 'Nguyên căn' : 'Ở ghép'}</div>}
                  {selectedReg.headcount && <div><span className="text-on-surface-secondary">Số người:</span> {selectedReg.headcount}</div>}
                  {selectedReg.preferredArea && <div><span className="text-on-surface-secondary">Khu vực:</span> {selectedReg.preferredArea}</div>}
                </div>
              </div>
            )}
          </section>

          {/* Selected Beds Summary */}
          <section>
            <div className="text-[11px] font-semibold uppercase tracking-[0.06em] text-on-surface-secondary mb-2">
              2. Giường đã chọn
            </div>
            {selectedBeds.length > 0 ? (
              <div className="border border-border rounded-[5px] overflow-hidden">
                <table className="w-full text-[12px]">
                  <thead className="bg-secondary border-b border-border">
                    <tr>
                      <th className="px-3 py-2 text-left text-[11px] text-on-surface-secondary font-semibold">Vị trí</th>
                      <th className="px-3 py-2 text-right text-[11px] text-on-surface-secondary font-semibold">Giá/tháng</th>
                      <th className="px-3 py-2 text-right text-[11px] text-on-surface-secondary font-semibold">Cọc (×2)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedBeds.map(bed => (
                      <tr key={bed.id} className="border-b border-border">
                        <td className="px-3 py-2 font-semibold">P.{selectedRoom?.name} — {bed.position}</td>
                        <td className="px-3 py-2 text-right">{formatCurrency(bed.price)}</td>
                        <td className="px-3 py-2 text-right font-semibold text-primary">{formatCurrency(bed.price * 2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-3 bg-secondary rounded-[5px] border border-dashed border-border text-center text-[13px] text-on-surface-secondary italic">
                Chưa chọn giường nào. Chọn phòng rồi bấm vào giường trống bên trái.
              </div>
            )}
          </section>

          {/* Deposit Calculation */}
          <section>
            <div className="text-[11px] font-semibold uppercase tracking-[0.06em] text-on-surface-secondary mb-2">
              3. Tổng tiền cọc
            </div>
            <div className="p-4 bg-primary-container rounded-[8px] border border-primary">
              <div className="text-[11px] text-on-surface-secondary mb-1">Công thức: Σ(Đơn giá × 2 tháng)</div>
              <div className="text-[24px] font-bold text-primary">{formatCurrency(totalDeposit)}</div>
              <div className="text-[11px] text-on-surface-secondary mt-1">
                {selectedBeds.length} giường × 2 tháng • Hạn thanh toán: 24 giờ sau khi tạo
              </div>
            </div>
          </section>
        </div>

        {/* Actions */}
        <div className="pt-4 mt-4 border-t border-border flex justify-between items-center">
          <a href="/dashboard/deposits" className="px-3 py-2 border border-border rounded-[5px] text-[12px] font-semibold hover:bg-secondary transition-colors">
            ← Quay lại
          </a>
          <button
            onClick={handleSubmit}
            disabled={isPending || !selectedRegId || selectedBedIds.size === 0}
            className={`flex items-center gap-1 text-white px-4 py-2 rounded-[5px] text-[12px] font-semibold transition-colors ${
              isPending || !selectedRegId || selectedBedIds.size === 0
                ? 'bg-primary-light cursor-not-allowed opacity-60'
                : 'bg-primary hover:bg-primary-light'
            }`}
          >
            {isPending ? (
              <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Đang tạo phiếu...</>
            ) : (
              <>Tạo phiếu cọc — {formatCurrency(totalDeposit)}</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

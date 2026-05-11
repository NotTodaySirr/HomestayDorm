"use client";

import React, { useState, useTransition, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { createRegistrationTicket, updateRegistrationTicket, openSingleBed } from '@/actions/room-registration';

const CURRENT_BRANCH = "CN1 - Q.Bình Thạnh";

export interface RoomData {
  id: string;
  name: string;
  capacity: number;
  occupancy: number;
  price: number;
  status: string;
  roomType: string;
  gender: string;
  amenities: string | null;
  beds: {
    id: string;
    position: string;
    status: string;
  }[];
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('vi-VN').format(amount);
};

type ModalType = null;

export interface RegistrationData {
  id: string;
  cccd: string | null;
  customerName: string;
  phoneNumber: string;
  email: string | null;
  dateOfBirth: Date | null;
  gender: string | null;
  address: string | null;
  rentalType: string | null;
  roomTypePreference: string | null;
  headcount: number | null;
  preferredArea: string | null;
  minPrice: number | null;
  maxPrice: number | null;
  rentalDuration: string | null;
  moveInDate: Date | null;
  contactChannel: string | null;
  additionalPreferences: string | null;
  status: string;
  consultingRooms: RoomData[];
}

interface Props {
  initialRooms: RoomData[];
  initialRegistration?: RegistrationData;
}

export const RoomRegistrationView: React.FC<Props> = ({ initialRooms, initialRegistration }) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [consultingRooms, setConsultingRooms] = useState<RoomData[]>(
    initialRegistration?.consultingRooms || []
  );
  const [expandedRoomId, setExpandedRoomId] = useState<string | null>(null);

  const isEditMode = !!initialRegistration;

  // Form & Filter states
  const [formData, setFormData] = useState({
    gender: initialRegistration?.gender || "",
    rentalType: initialRegistration?.rentalType || "",
    roomTypePreference: initialRegistration?.roomTypePreference || "",
    headcount: initialRegistration?.headcount?.toString() || "",
    minPrice: initialRegistration?.minPrice?.toString() || "",
    maxPrice: initialRegistration?.maxPrice?.toString() || "",
    rentalDuration: initialRegistration?.rentalDuration || "",
    moveInDate: initialRegistration?.moveInDate ? new Date(initialRegistration.moveInDate).toISOString().split('T')[0] : "",
    contactChannel: initialRegistration?.contactChannel || "",
    additionalPreferences: initialRegistration?.additionalPreferences || ""
  });
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const filteredRooms = initialRooms.filter((room) => {
    const available = room.beds.filter((bed) => bed.status === 'AVAILABLE').length;
    if (formData.headcount && available < parseInt(formData.headcount)) return false;
    if (formData.maxPrice && room.price > parseInt(formData.maxPrice)) return false;
    if (formData.minPrice && room.price < parseInt(formData.minPrice)) return false;
    if (formData.roomTypePreference && room.roomType !== formData.roomTypePreference) return false;
    if (formData.gender && room.gender !== 'all' && room.gender !== formData.gender) return false;
    
    return true;
  });

  const handleAddToConsulting = (room: RoomData) => {
    if (!consultingRooms.find(r => r.id === room.id)) {
      setConsultingRooms([...consultingRooms, room]);
    }
  };

  const handleRemoveFromConsulting = (roomId: string) => {
    setConsultingRooms(consultingRooms.filter(r => r.id !== roomId));
  };

  const handleFormSubmit = async (formData: FormData) => {
    const roomIds = consultingRooms.map(room => room.id).join(',');
    formData.append('roomIds', roomIds);
    startTransition(async () => {
      try {
        if (isEditMode) {
          await updateRegistrationTicket(initialRegistration.id, formData);
        } else {
          await createRegistrationTicket(formData);
        }
        router.push('/dashboard/registrations');
      } catch (error) {
        console.error('Submission error:', error);
      }
    });
  };

  return (
    <div className="flex h-full w-full gap-[10px] p-[16px] bg-secondary font-['Segoe_UI'] text-on-surface">
      {/* Left Pane - Room Search & Grid */}
      <div className="flex-[1.3] flex flex-col gap-[10px] bg-surface border border-border rounded-[8px] p-[16px]">
        <div className="text-[11px] font-semibold uppercase tracking-[0.06em] text-on-surface-secondary mb-[4px]">
          Danh sách phòng trống
        </div>
        
        {/* Filter Bar (Now Auto-Filtered) */}
        <div className="bg-primary-container text-primary text-[12px] font-semibold px-[12px] py-[8px] rounded-[5px] mb-[8px] flex justify-between items-center">
          <span>Hệ thống đang tự động lọc phòng theo "Yêu cầu thuê" bên phải</span>
          <span className="bg-primary text-white px-[8px] py-[2px] rounded-[10px] text-[11px]">{filteredRooms.length} kết quả</span>
        </div>

        {/* Data Grid */}
        <div className="flex-1 overflow-auto border border-border rounded-[8px] bg-surface">
          <table className="w-full text-[13px] text-left border-collapse">
            <thead className="bg-secondary border-b border-border sticky top-0 z-10">
              <tr>
                <th className="px-[12px] py-[8px] text-[11px] font-semibold uppercase tracking-[0.06em] text-on-surface-secondary">Mã Phòng</th>
                <th className="px-[12px] py-[8px] text-[11px] font-semibold uppercase tracking-[0.06em] text-on-surface-secondary">Sức Chứa</th>
                <th className="px-[12px] py-[8px] text-[11px] font-semibold uppercase tracking-[0.06em] text-on-surface-secondary">Giá</th>
                <th className="px-[12px] py-[8px] text-[11px] font-semibold uppercase tracking-[0.06em] text-on-surface-secondary">Trạng Thái</th>
                <th className="px-[12px] py-[8px] text-[11px] font-semibold uppercase tracking-[0.06em] text-on-surface-secondary text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredRooms.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-[12px] py-[16px] text-center text-[13px] text-on-surface-secondary">
                    Không tìm thấy phòng phù hợp với tiêu chí lọc.
                  </td>
                </tr>
              ) : filteredRooms.map((room) => {
                const occupiedOrReservedCount = room.beds.filter((bed) =>
                  bed.status === 'OCCUPIED' || bed.status === 'DEPOSITED',
                ).length;
                const maintenanceCount = room.beds.filter((bed) => bed.status === 'MAINTENANCE').length;
                const available = room.beds.filter((bed) => bed.status === 'AVAILABLE').length;
                const isRoomMaintenance = room.status === 'MAINTENANCE';
                const statusLabel = isRoomMaintenance
                  ? `Bảo trì ${maintenanceCount}/${room.beds.length}`
                  : available > 0
                    ? maintenanceCount > 0
                      ? `Trống ${available} · Bảo trì ${maintenanceCount}`
                      : `Trống ${available}`
                    : 'Đã đầy';
                const statusClass = isRoomMaintenance
                  ? 'bg-warning-container text-warning'
                  : available <= 0
                    ? 'bg-error-container text-error'
                    : 'bg-success-container text-success';
                const isExpanded = expandedRoomId === room.id;

                return (
                  <React.Fragment key={room.id}>
                    {/* DÒNG HIỂN THỊ PHÒNG */}
                    <tr className="border-b border-border hover:bg-primary-container transition-colors group">
                      <td className="px-[12px] py-[8px] font-semibold text-[13px]">Phòng {room.name}</td>
                      <td className="px-[12px] py-[8px] text-[13px]">{occupiedOrReservedCount}/{room.capacity}</td>
                      <td className="px-[12px] py-[8px] text-[13px] font-mono">{formatCurrency(room.price)}</td>
                      <td className="px-[12px] py-[8px]">
                        <span className={`px-[9px] py-[3px] text-[10px] font-semibold rounded-full uppercase tracking-wider inline-flex items-center justify-center ${statusClass}`}>
                          {statusLabel}
                        </span>
                      </td>
                      <td className="px-[12px] py-[8px] text-right">
                        <div className="flex items-center justify-end gap-[8px]">
                          <button 
                            type="button"
                            onClick={() => setExpandedRoomId(isExpanded ? null : room.id)}
                            className="text-primary hover:underline text-[12px] font-semibold"
                          >
                            {isExpanded ? 'Đóng lại' : 'Chi tiết'}
                          </button>
                          <button 
                            type="button"
                            onClick={() => handleAddToConsulting(room)}
                            className="bg-primary text-white px-[14px] py-[7px] rounded-[5px] text-[12px] font-semibold hover:bg-primary-light flex items-center justify-center gap-[6px]"
                          >
                            Tạo phiếu 
                            <span className="bg-secondary-dark text-on-surface-secondary rounded-[3px] font-mono text-[10px] px-[4px] py-[1px] ml-[2px]">T</span>
                          </button>
                        </div>
                      </td>
                    </tr>

                    {/* KHU VỰC MỞ RỘNG - DANH SÁCH GIƯỜNG */}
                    {isExpanded && (
                      <tr className="bg-secondary/50 border-b border-border">
                        <td colSpan={5} className="p-[16px]">
                          <div className="text-[11px] font-semibold uppercase tracking-[0.06em] text-on-surface-secondary mb-[8px]">
                            Tra cứu chi tiết giường - Phòng {room.name}
                          </div>
                          <div className="grid grid-cols-4 gap-[10px]">
                            {room.beds.map(bed => {
                              const isDeposited = bed.status === 'DEPOSITED';
                              const isOccupied = bed.status === 'OCCUPIED';
                              const isMaintenance = bed.status === 'MAINTENANCE';
                              const bedStatusLabel = isDeposited
                                ? 'Đã cọc (Khóa)'
                                : isOccupied
                                  ? 'Đang ở'
                                  : isMaintenance
                                    ? 'Bảo trì'
                                    : 'Trống';
                              const bedStatusClass = isDeposited
                                ? 'text-warning'
                                : isOccupied
                                  ? 'text-error'
                                  : isMaintenance
                                    ? 'text-warning'
                                    : 'text-success';
                              
                              return (
                                <div key={bed.id} className={`p-[10px] border rounded-[6px] bg-surface flex flex-col justify-between ${
                                  isDeposited ? 'border-warning' : isOccupied ? 'border-error opacity-70' : isMaintenance ? 'border-warning bg-warning-container/20' : 'border-border'
                                }`}>
                                  <div>
                                    <div className="font-semibold text-[13px]">{bed.position}</div>
                                    <div className="text-[11px] mt-[4px]">
                                      Trạng thái: <span className={`font-bold ${bedStatusClass}`}>
                                        {bedStatusLabel}
                                      </span>
                                    </div>
                                  </div>

                                  {/* USE CASE EXTEND: MỞ PHÒNG (CHECK-IN) */}
                                  {isDeposited && (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        if(confirm(`Xác nhận khách tới nhận giường ${bed.position}?`)) {
                                          startTransition(async () => {
                                            await openSingleBed(bed.id);
                                          });
                                        }
                                      }}
                                      disabled={isPending}
                                      className="mt-[10px] w-full py-[5px] bg-primary-container text-primary rounded-[4px] text-[11px] font-bold hover:opacity-80 transition-opacity disabled:opacity-50"
                                    >
                                      {isPending ? 'Đang xử lý...' : 'Mở phòng (Check-in) ↗'}
                                    </button>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Right Pane - Registration Form */}
      <form action={handleFormSubmit} className="flex-1 flex flex-col bg-surface border border-border rounded-[8px] p-[16px]">
        <div className="flex justify-between items-center mb-[16px] pb-[12px] border-b border-border">
          <h2 className="text-[15px] font-semibold">{isEditMode ? 'Cập nhật phiếu đăng ký' : 'Phiếu đăng ký thuê phòng'}</h2>
          <span className={`px-[9px] py-[3px] rounded-full text-[10px] font-semibold uppercase tracking-wider ${
            isEditMode ? 'bg-primary-container text-primary' : 'bg-warning-container text-warning'
          }`}>
            {isEditMode ? (initialRegistration.status === 'CONSULTING' ? 'Đang tư vấn' : initialRegistration.status === 'WAITING_VIEW' ? 'Chờ xem phòng' : initialRegistration.status === 'COMPLETED' ? 'Hoàn thành' : initialRegistration.status) : 'Đang tư vấn'}
          </span>
        </div>

        <div className="flex-1 overflow-auto space-y-[24px]">
          {/* Section 1 */}
          <section>
            <div className="text-[11px] font-semibold uppercase tracking-[0.06em] text-on-surface-secondary mb-[12px]">
              1. Thông tin khách hàng
            </div>
            <div className="grid grid-cols-2 gap-[12px]">
              <div>
                <label className="block text-[11px] font-semibold text-on-surface-secondary mb-[4px]">CCCD / CMND</label>
                <input name="cccd" defaultValue={initialRegistration?.cccd || ''} className="w-full bg-surface border border-border rounded-[5px] px-[10px] py-[7px] text-[13px] focus:outline-none focus:border-primary" placeholder="Nhập số CCCD..." />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-on-surface-secondary mb-[4px]">Họ và tên <span className="text-error">*</span></label>
                <input name="customerName" required defaultValue={initialRegistration?.customerName || ''} className="w-full bg-surface border border-border rounded-[5px] px-[10px] py-[7px] text-[13px] focus:outline-none focus:border-primary" placeholder="Nhập họ tên đầy đủ..." />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-on-surface-secondary mb-[4px]">Số điện thoại <span className="text-error">*</span></label>
                <input name="phoneNumber" required defaultValue={initialRegistration?.phoneNumber || ''} className="w-full bg-surface border border-border rounded-[5px] px-[10px] py-[7px] text-[13px] focus:outline-none focus:border-primary" placeholder="VD: 0901234567" />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-on-surface-secondary mb-[4px]">Email</label>
                <input name="email" type="email" defaultValue={initialRegistration?.email || ''} className="w-full bg-surface border border-border rounded-[5px] px-[10px] py-[7px] text-[13px] focus:outline-none focus:border-primary" placeholder="VD: email@gmail.com" />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-on-surface-secondary mb-[4px]">Ngày sinh</label>
                <input name="dateOfBirth" type="date" defaultValue={initialRegistration?.dateOfBirth ? new Date(initialRegistration.dateOfBirth).toISOString().split('T')[0] : ''} className="w-full bg-surface border border-border rounded-[5px] px-[10px] py-[7px] text-[13px] focus:outline-none focus:border-primary" />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-on-surface-secondary mb-[4px]">Giới tính khách hàng</label>
                <select name="gender" value={formData.gender} onChange={handleFormChange} className="w-full bg-surface border border-border rounded-[5px] px-[10px] py-[7px] text-[13px] focus:outline-none focus:border-primary">
                  <option value="">Chọn giới tính...</option>
                  <option value="m">Nam</option>
                  <option value="f">Nữ</option>
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-on-surface-secondary mb-[4px]">Kênh tiếp nhận</label>
                <select name="contactChannel" value={formData.contactChannel} onChange={handleFormChange} className="w-full bg-surface border border-border rounded-[5px] px-[10px] py-[7px] text-[13px] focus:outline-none focus:border-primary">
                  <option value="">Chọn kênh liên hệ...</option>
                  <option value="facebook">Facebook</option>
                  <option value="zalo">Zalo</option>
                  <option value="hotline">Hotline</option>
                  <option value="referral">Người quen giới thiệu</option>
                  <option value="walkin">Đến trực tiếp</option>
                </select>
              </div>
              <div className="col-span-2">
                <label className="block text-[11px] font-semibold text-on-surface-secondary mb-[4px]">Địa chỉ thường trú</label>
                <input name="address" defaultValue={initialRegistration?.address || ''} className="w-full bg-surface border border-border rounded-[5px] px-[10px] py-[7px] text-[13px] focus:outline-none focus:border-primary" placeholder="Nhập địa chỉ đầy đủ..." />
              </div>
            </div>
          </section>
          
          <section>
            <div className="flex justify-between items-center mb-[12px]">
              <div className="text-[11px] font-semibold uppercase tracking-[0.06em] text-on-surface-secondary">
                2. Yêu cầu thuê
              </div>
              <button 
                type="button" 
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="text-[11px] font-semibold text-primary hover:underline"
              >
                {showAdvanced ? '- Thu gọn' : '+ Tiêu chí nâng cao'}
              </button>
            </div>
            
            <div className="grid grid-cols-2 gap-[12px]">
              {/* YÊU CẦU CƠ BẢN */}
              <div>
                <label className="block text-[11px] font-semibold text-on-surface-secondary mb-[4px]">Hình thức thuê</label>
                <select name="rentalType" value={formData.rentalType} onChange={handleFormChange} className="w-full bg-surface border border-border rounded-[5px] px-[10px] py-[7px] text-[13px] focus:outline-none focus:border-primary">
                  <option value="">Chọn hình thức...</option>
                  <option value="nguyen_can">Nguyên căn</option>
                  <option value="o_ghep">Ở ghép</option>
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-on-surface-secondary mb-[4px]">Loại phòng</label>
                <select name="roomTypePreference" value={formData.roomTypePreference} onChange={handleFormChange} className="w-full bg-surface border border-border rounded-[5px] px-[10px] py-[7px] text-[13px] focus:outline-none focus:border-primary">
                  <option value="">Tất cả loại phòng</option>
                  <option value="ktx">KTX</option>
                  <option value="studio">Studio</option>
                  <option value="1pn">1 Phòng ngủ</option>
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-on-surface-secondary mb-[4px]">Số người ở</label>
                <input name="headcount" value={formData.headcount} onChange={handleFormChange} type="number" min="1" className="w-full bg-surface border border-border rounded-[5px] px-[10px] py-[7px] text-[13px] focus:outline-none focus:border-primary" placeholder="VD: 2" />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-on-surface-secondary mb-[4px]">Ngân sách tối đa (VNĐ)</label>
                <input name="maxPrice" value={formData.maxPrice} onChange={handleFormChange} type="number" className="w-full bg-surface border border-border rounded-[5px] px-[10px] py-[7px] text-[13px] focus:outline-none focus:border-primary" placeholder="VD: 3000000" />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-on-surface-secondary mb-[4px]">Ngày dự kiến vào ở</label>
                <input name="moveInDate" value={formData.moveInDate} onChange={handleFormChange} type="date" className="w-full bg-surface border border-border rounded-[5px] px-[10px] py-[7px] text-[13px] focus:outline-none focus:border-primary" />
              </div>

              {/* YÊU CẦU NÂNG CAO */}
              {showAdvanced && (
                <>
                  <div className="col-span-2 border-t border-border mt-[4px] pt-[12px] grid grid-cols-2 gap-[12px]">
                    <div>
                      <label className="block text-[11px] font-semibold text-on-surface-secondary mb-[4px]">Ngân sách tối thiểu (VNĐ)</label>
                      <input name="minPrice" value={formData.minPrice} onChange={handleFormChange} type="number" className="w-full bg-surface border border-border rounded-[5px] px-[10px] py-[7px] text-[13px] focus:outline-none focus:border-primary" placeholder="VD: 1500000" />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-on-surface-secondary mb-[4px]">Thời hạn thuê</label>
                      <select name="rentalDuration" value={formData.rentalDuration} onChange={handleFormChange} className="w-full bg-surface border border-border rounded-[5px] px-[10px] py-[7px] text-[13px] focus:outline-none focus:border-primary">
                        <option value="">Chọn thời hạn...</option>
                        <option value="6m">6 tháng</option>
                        <option value="12m">12 tháng</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-on-surface-secondary mb-[4px]">Khu vực ưu tiên</label>
                      <input type="hidden" name="preferredArea" value="binh_thanh" />
                      <select disabled defaultValue="binh_thanh" className="w-full bg-surface border border-border rounded-[5px] px-[10px] py-[7px] text-[13px] focus:outline-none focus:border-primary opacity-70 cursor-not-allowed">
                        <option value="binh_thanh">{CURRENT_BRANCH}</option>
                      </select>
                    </div>
                    <div className="col-span-2">
                      <label className="block text-[11px] font-semibold text-on-surface-secondary mb-[4px]">Tiêu chí ưu tiên khác</label>
                      <textarea name="additionalPreferences" value={formData.additionalPreferences} onChange={handleFormChange} rows={2} className="w-full bg-surface border border-border rounded-[5px] px-[10px] py-[7px] text-[13px] focus:outline-none focus:border-primary resize-none" placeholder="VD: Yêu cầu có máy lạnh, ban công, cho nuôi pet..."></textarea>
                    </div>
                  </div>
                </>
              )}
            </div>
          </section>

          {/* Section 3 */}
          <section>
            <div className="text-[11px] font-semibold uppercase tracking-[0.06em] text-on-surface-secondary mb-[8px]">
              3. Danh sách phòng/giường tư vấn
            </div>
            {consultingRooms.length === 0 ? (
              <div className="text-[13px] text-on-surface-secondary italic p-[10px] bg-secondary rounded-[5px] text-center border border-dashed border-border">
                Chưa có phòng nào được chọn. Hãy chọn từ danh sách bên trái.
              </div>
            ) : (
              <div className="border border-border rounded-[5px] overflow-hidden">
                <table className="w-full text-[13px] text-left border-collapse">
                  <thead className="bg-secondary border-b border-border">
                    <tr>
                      <th className="px-[10px] py-[6px] font-semibold text-[11px] text-on-surface-secondary">Mã Phòng</th>
                      <th className="px-[10px] py-[6px] font-semibold text-[11px] text-on-surface-secondary">Giá</th>
                      <th className="px-[10px] py-[6px] font-semibold text-[11px] text-on-surface-secondary text-right">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {consultingRooms.map((room) => (
                      <tr key={room.id} className="border-b border-border last:border-none">
                        <td className="px-[10px] py-[8px] font-semibold">Phòng {room.name}</td>
                        <td className="px-[10px] py-[8px]">{formatCurrency(room.price)}</td>
                        <td className="px-[10px] py-[8px] text-right">
                          <button 
                            type="button"
                            onClick={() => handleRemoveFromConsulting(room.id)}
                            className="text-error hover:text-error-light text-[12px] font-semibold"
                          >
                            Xóa
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-[10px] pt-[16px] mt-[16px] border-t border-border">
          <button 
            type="submit" 
            disabled={isPending}
            className={`flex items-center gap-[6px] text-white px-[14px] py-[7px] rounded-[5px] text-[12px] font-semibold transition-colors ${isPending ? 'bg-primary-light cursor-not-allowed' : 'bg-primary hover:bg-primary-light'}`}
          >
            {isPending ? (
              <><Loader2 className="w-[14px] h-[14px] animate-spin" /> Đang lưu...</>
            ) : (
              <>
                {isEditMode ? 'Cập nhật Phiếu' : 'Lưu Phiếu'} 
                <span className="bg-primary-light text-secondary-darker rounded-[3px] font-mono text-[10px] px-[4px] py-[1px]">Ctrl+S</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
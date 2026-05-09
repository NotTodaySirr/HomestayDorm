"use client";

import React, { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { createRegistrationTicket, openSingleBed } from '@/actions/room-registration';

const CURRENT_BRANCH = "CN1 - Q.Bình Thạnh";

export interface RoomData {
  id: string;
  name: string;
  capacity: number;
  occupancy: number;
  price: number;
  status: string;
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

interface Props {
  initialRooms: RoomData[];
}

export const RoomRegistrationView: React.FC<Props> = ({ initialRooms }) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [consultingRooms, setConsultingRooms] = useState<RoomData[]>([]);
  const [expandedRoomId, setExpandedRoomId] = useState<string | null>(null);

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
        await createRegistrationTicket(formData);
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
        
        {/* Filter Bar */}
        <div className="grid grid-cols-4 gap-[10px] mb-[8px]">
          <select disabled defaultValue="binh_thanh" className="bg-surface border border-border rounded-[5px] px-[10px] py-[7px] text-[13px] focus:outline-none focus:border-primary text-on-surface-secondary opacity-70 cursor-not-allowed">
            <option value="binh_thanh">{CURRENT_BRANCH}</option>
          </select>
          <select className="bg-surface border border-border rounded-[5px] px-[10px] py-[7px] text-[13px] focus:outline-none focus:border-primary text-on-surface-secondary">
            <option value="">Loại phòng...</option>
            <option value="male">KTX Nam</option>
            <option value="female">KTX Nữ</option>
          </select>
          <select className="bg-surface border border-border rounded-[5px] px-[10px] py-[7px] text-[13px] focus:outline-none focus:border-primary text-on-surface-secondary">
            <option value="">Giới tính...</option>
            <option value="m">Nam</option>
            <option value="f">Nữ</option>
          </select>
          <input type="number" className="bg-surface border border-border rounded-[5px] px-[10px] py-[7px] text-[13px] focus:outline-none focus:border-primary placeholder:text-on-surface-secondary" placeholder="Số lượng..." />
          <input className="bg-surface border border-border rounded-[5px] px-[10px] py-[7px] text-[13px] focus:outline-none focus:border-primary placeholder:text-on-surface-secondary" placeholder="Mức giá..." />
          <input type="date" className="bg-surface border border-border rounded-[5px] px-[10px] py-[7px] text-[13px] focus:outline-none focus:border-primary text-on-surface-secondary" />
          <select className="bg-surface border border-border rounded-[5px] px-[10px] py-[7px] text-[13px] focus:outline-none focus:border-primary text-on-surface-secondary">
            <option value="">Thời hạn thuê...</option>
            <option value="6m">6 tháng</option>
            <option value="12m">12 tháng</option>
          </select>
          <input className="bg-surface border border-border rounded-[5px] px-[10px] py-[7px] text-[13px] focus:outline-none focus:border-primary placeholder:text-on-surface-secondary" placeholder="Tiện ích ưu tiên..." />
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
              {initialRooms.map((room) => {
                const available = room.capacity - room.occupancy;
                const statusLabel = available > 0 ? `Trống ${available}` : 'Đã đầy';
                const isExpanded = expandedRoomId === room.id;

                return (
                  <React.Fragment key={room.id}>
                    {/* DÒNG HIỂN THỊ PHÒNG */}
                    <tr className="border-b border-border hover:bg-primary-container transition-colors group">
                      <td className="px-[12px] py-[8px] font-semibold text-[13px]">Phòng {room.name}</td>
                      <td className="px-[12px] py-[8px] text-[13px]">{room.occupancy}/{room.capacity}</td>
                      <td className="px-[12px] py-[8px] text-[13px] font-mono">{formatCurrency(room.price)}</td>
                      <td className="px-[12px] py-[8px]">
                        <span className={`px-[9px] py-[3px] text-[10px] font-semibold rounded-full uppercase tracking-wider inline-flex items-center justify-center ${
                          available <= 0 ? 'bg-error-container text-error' : 'bg-success-container text-success'
                        }`}>
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
                              
                              return (
                                <div key={bed.id} className={`p-[10px] border rounded-[6px] bg-surface flex flex-col justify-between ${
                                  isDeposited ? 'border-warning' : isOccupied ? 'border-error opacity-70' : 'border-border'
                                }`}>
                                  <div>
                                    <div className="font-semibold text-[13px]">{bed.position}</div>
                                    <div className="text-[11px] mt-[4px]">
                                      Trạng thái: <span className={`font-bold ${isDeposited ? 'text-warning' : isOccupied ? 'text-error' : 'text-success'}`}>
                                        {isDeposited ? 'Đã cọc (Khóa)' : isOccupied ? 'Đang ở' : 'Trống'}
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
          <h2 className="text-[15px] font-semibold">Phiếu đăng ký thuê phòng</h2>
          <span className="bg-warning-container text-warning px-[9px] py-[3px] rounded-full text-[10px] font-semibold uppercase tracking-wider">
            Nháp
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
                <input name="cccd" className="w-full bg-surface border border-border rounded-[5px] px-[10px] py-[7px] text-[13px] focus:outline-none focus:border-primary" placeholder="Nhập số CCCD..." />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-on-surface-secondary mb-[4px]">Họ và tên <span className="text-error">*</span></label>
                <input name="customerName" required className="w-full bg-surface border border-border rounded-[5px] px-[10px] py-[7px] text-[13px] focus:outline-none focus:border-primary" placeholder="Nhập họ tên đầy đủ..." />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-on-surface-secondary mb-[4px]">Số điện thoại <span className="text-error">*</span></label>
                <input name="phoneNumber" required className="w-full bg-surface border border-border rounded-[5px] px-[10px] py-[7px] text-[13px] focus:outline-none focus:border-primary" placeholder="VD: 0901234567" />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-on-surface-secondary mb-[4px]">Email</label>
                <input name="email" type="email" className="w-full bg-surface border border-border rounded-[5px] px-[10px] py-[7px] text-[13px] focus:outline-none focus:border-primary" placeholder="VD: email@gmail.com" />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-on-surface-secondary mb-[4px]">Ngày sinh</label>
                <input name="dateOfBirth" type="date" className="w-full bg-surface border border-border rounded-[5px] px-[10px] py-[7px] text-[13px] focus:outline-none focus:border-primary" />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-on-surface-secondary mb-[4px]">Giới tính</label>
                <select name="gender" className="w-full bg-surface border border-border rounded-[5px] px-[10px] py-[7px] text-[13px] focus:outline-none focus:border-primary">
                  <option value="">Chọn giới tính...</option>
                  <option value="m">Nam</option>
                  <option value="f">Nữ</option>
                </select>
              </div>
              <div className="col-span-2">
                <label className="block text-[11px] font-semibold text-on-surface-secondary mb-[4px]">Địa chỉ thường trú</label>
                <input name="address" className="w-full bg-surface border border-border rounded-[5px] px-[10px] py-[7px] text-[13px] focus:outline-none focus:border-primary" placeholder="Nhập địa chỉ đầy đủ..." />
              </div>
            </div>
          </section>
          
          <section>
            <div className="text-[11px] font-semibold uppercase tracking-[0.06em] text-on-surface-secondary mb-[12px]">
              2. Yêu cầu thuê
            </div>
            <div className="grid grid-cols-2 gap-[12px]">
              <div>
                <label className="block text-[11px] font-semibold text-on-surface-secondary mb-[4px]">Hình thức thuê</label>
                <select name="rentalType" className="w-full bg-surface border border-border rounded-[5px] px-[10px] py-[7px] text-[13px] focus:outline-none focus:border-primary">
                  <option value="">Chọn hình thức...</option>
                  <option value="nguyen_can">Nguyên căn</option>
                  <option value="o_ghep">Ở ghép</option>
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-on-surface-secondary mb-[4px]">Loại phòng mong muốn</label>
                <select name="roomTypePreference" className="w-full bg-surface border border-border rounded-[5px] px-[10px] py-[7px] text-[13px] focus:outline-none focus:border-primary">
                  <option value="">Chọn loại phòng...</option>
                  <option value="ktx">KTX</option>
                  <option value="studio">Studio</option>
                  <option value="1pn">1 Phòng ngủ</option>
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-on-surface-secondary mb-[4px]">Khu vực ưu tiên</label>
                <input type="hidden" name="preferredArea" value="binh_thanh" />
                <select disabled defaultValue="binh_thanh" className="w-full bg-surface border border-border rounded-[5px] px-[10px] py-[7px] text-[13px] focus:outline-none focus:border-primary opacity-70 cursor-not-allowed">
                  <option value="binh_thanh">{CURRENT_BRANCH}</option>
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-on-surface-secondary mb-[4px]">Số người ở</label>
                <input name="headcount" type="number" min="1" className="w-full bg-surface border border-border rounded-[5px] px-[10px] py-[7px] text-[13px] focus:outline-none focus:border-primary" placeholder="VD: 2" />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-on-surface-secondary mb-[4px]">Ngân sách tối thiểu (VNĐ)</label>
                <input name="minPrice" type="number" className="w-full bg-surface border border-border rounded-[5px] px-[10px] py-[7px] text-[13px] focus:outline-none focus:border-primary" placeholder="VD: 1500000" />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-on-surface-secondary mb-[4px]">Ngân sách tối đa (VNĐ)</label>
                <input name="maxPrice" type="number" className="w-full bg-surface border border-border rounded-[5px] px-[10px] py-[7px] text-[13px] focus:outline-none focus:border-primary" placeholder="VD: 3000000" />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-on-surface-secondary mb-[4px]">Thời hạn thuê</label>
                <select name="rentalDuration" className="w-full bg-surface border border-border rounded-[5px] px-[10px] py-[7px] text-[13px] focus:outline-none focus:border-primary">
                  <option value="">Chọn thời hạn...</option>
                  <option value="6m">6 tháng</option>
                  <option value="12m">12 tháng</option>
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-on-surface-secondary mb-[4px]">Ngày dự kiến vào ở</label>
                <input name="moveInDate" type="date" className="w-full bg-surface border border-border rounded-[5px] px-[10px] py-[7px] text-[13px] focus:outline-none focus:border-primary" />
              </div>
              <div className="col-span-2">
                <label className="block text-[11px] font-semibold text-on-surface-secondary mb-[4px]">Kênh tiếp nhận</label>
                <select name="contactChannel" className="w-full bg-surface border border-border rounded-[5px] px-[10px] py-[7px] text-[13px] focus:outline-none focus:border-primary">
                  <option value="">Chọn kênh liên hệ...</option>
                  <option value="facebook">Facebook</option>
                  <option value="zalo">Zalo</option>
                  <option value="hotline">Hotline</option>
                  <option value="referral">Người quen giới thiệu</option>
                  <option value="walkin">Đến trực tiếp</option>
                </select>
              </div>
              <div className="col-span-2">
                <label className="block text-[11px] font-semibold text-on-surface-secondary mb-[4px]">Tiêu chí ưu tiên khác</label>
                <textarea name="additionalPreferences" rows={2} className="w-full bg-surface border border-border rounded-[5px] px-[10px] py-[7px] text-[13px] focus:outline-none focus:border-primary resize-none" placeholder="VD: Yêu cầu có máy lạnh, ban công, cho nuôi pet..."></textarea>
              </div>
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
                Lưu Phiếu 
                <span className="bg-primary-light text-secondary-darker rounded-[3px] font-mono text-[10px] px-[4px] py-[1px]">Ctrl+S</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
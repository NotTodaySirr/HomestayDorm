"use client";

import React, { useState } from 'react';
import { ScheduleAppointmentModal } from './ScheduleAppointmentModal';
import { UpdateViewingResultModal } from './UpdateViewingResultModal';
import { WaitlistModal } from './WaitlistModal';
import { CancelRegistrationModal } from './CancelRegistrationModal';

const CURRENT_BRANCH = "CN1 - Q.Bình Thạnh";

// Dummy data
const MOCK_ROOMS = [
  { id: '101', capacity: '4/6', price: '1,500,000', status: 'Trống 2' },
  { id: '202', capacity: '2/4', price: '2,000,000', status: 'Trống 2' },
  { id: '305', capacity: '6/6', price: '1,200,000', status: 'Đã đầy' },
  { id: '401', capacity: '0/2', price: '3,000,000', status: 'Trống 2' },
  { id: '405', capacity: '3/4', price: '1,800,000', status: 'Trống 1' },
];

type ModalType = 'schedule' | 'update' | 'waitlist' | 'cancel' | null;

export const RoomRegistrationView: React.FC = () => {
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [consultingRooms, setConsultingRooms] = useState<typeof MOCK_ROOMS>([]);

  const handleAddToConsulting = (room: typeof MOCK_ROOMS[0]) => {
    if (!consultingRooms.find(r => r.id === room.id)) {
      setConsultingRooms([...consultingRooms, room]);
    }
  };

  const handleRemoveFromConsulting = (roomId: string) => {
    setConsultingRooms(consultingRooms.filter(r => r.id !== roomId));
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
          <select disabled className="bg-surface border border-border rounded-[5px] px-[10px] py-[7px] text-[13px] focus:outline-none focus:border-primary text-on-surface-secondary opacity-70 cursor-not-allowed">
            <option value="binh_thanh" selected>{CURRENT_BRANCH}</option>
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
          <input 
            type="number"
            className="bg-surface border border-border rounded-[5px] px-[10px] py-[7px] text-[13px] focus:outline-none focus:border-primary placeholder:text-on-surface-secondary" 
            placeholder="Số lượng..." 
          />
          <input 
            className="bg-surface border border-border rounded-[5px] px-[10px] py-[7px] text-[13px] focus:outline-none focus:border-primary placeholder:text-on-surface-secondary" 
            placeholder="Mức giá..." 
          />
          <input 
            type="date"
            className="bg-surface border border-border rounded-[5px] px-[10px] py-[7px] text-[13px] focus:outline-none focus:border-primary text-on-surface-secondary" 
          />
          <select className="bg-surface border border-border rounded-[5px] px-[10px] py-[7px] text-[13px] focus:outline-none focus:border-primary text-on-surface-secondary">
            <option value="">Thời hạn thuê...</option>
            <option value="6m">6 tháng</option>
            <option value="12m">12 tháng</option>
          </select>
          <input 
            className="bg-surface border border-border rounded-[5px] px-[10px] py-[7px] text-[13px] focus:outline-none focus:border-primary placeholder:text-on-surface-secondary" 
            placeholder="Tiện ích ưu tiên..." 
          />
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
              {MOCK_ROOMS.map((room, idx) => (
                <tr key={idx} className="border-b border-border hover:bg-primary-container transition-colors group">
                  <td className="px-[12px] py-[8px] font-semibold text-[13px]">{room.id}</td>
                  <td className="px-[12px] py-[8px] text-[13px]">{room.capacity}</td>
                  <td className="px-[12px] py-[8px] text-[13px] font-mono">{room.price}</td>
                  <td className="px-[12px] py-[8px]">
                    <span className={`px-[9px] py-[3px] text-[10px] font-semibold rounded-full uppercase tracking-wider inline-flex items-center justify-center ${
                      room.status === 'Đã đầy' 
                        ? 'bg-error-container text-error' 
                        : 'bg-success-container text-success'
                    }`}>
                      {room.status}
                    </span>
                  </td>
                  <td className="px-[12px] py-[8px] text-right">
                    <div className="flex items-center justify-end gap-[8px]">
                      <button className="text-primary hover:underline text-[12px] font-semibold">
                        Chi tiết
                      </button>
                      <button 
                        onClick={() => handleAddToConsulting(room)}
                        className="bg-primary text-white px-[14px] py-[7px] rounded-[5px] text-[12px] font-semibold hover:bg-primary-light flex items-center justify-center gap-[6px]"
                      >
                        Tạo phiếu 
                        <span className="bg-secondary-dark text-on-surface-secondary rounded-[3px] font-mono text-[10px] px-[4px] py-[1px] ml-[2px]">T</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Right Pane - Registration Form */}
      <div className="flex-1 flex flex-col bg-surface border border-border rounded-[8px] p-[16px]">
        <div className="flex justify-between items-center mb-[16px] pb-[12px] border-b border-border">
          <h2 className="text-[15px] font-semibold">Phiếu đăng ký thuê phòng</h2>
          <span className="bg-warning-container text-warning px-[9px] py-[3px] rounded-full text-[10px] font-semibold uppercase tracking-wider">
            Nháp
          </span>
        </div>

        <div className="flex-1 overflow-auto space-y-[24px]">
          {/* Section 1 */}
          <section>
            <div className="text-[11px] font-semibold uppercase tracking-[0.06em] text-on-surface-secondary mb-[8px]">
              1. Thông tin khách hàng
            </div>
            <div className="grid grid-cols-4 gap-[10px]">
              <div className="col-span-1">
                <input className="w-full bg-surface border border-border rounded-[5px] px-[10px] py-[7px] text-[13px] focus:outline-none focus:border-primary" placeholder="CCCD/CMND (*)..." />
              </div>
              <div className="col-span-2">
                <input className="w-full bg-surface border border-border rounded-[5px] px-[10px] py-[7px] text-[13px] focus:outline-none focus:border-primary" placeholder="Họ và tên (*)..." />
              </div>
              <div className="col-span-1">
                <select className="w-full bg-surface border border-border rounded-[5px] px-[10px] py-[7px] text-[13px] focus:outline-none focus:border-primary text-on-surface-secondary">
                  <option value="">Giới tính...</option>
                  <option value="m">Nam</option>
                  <option value="f">Nữ</option>
                </select>
              </div>
              <div className="col-span-2">
                <input className="w-full bg-surface border border-border rounded-[5px] px-[10px] py-[7px] text-[13px] focus:outline-none focus:border-primary" placeholder="Số điện thoại (*)..." />
              </div>
              <div className="col-span-2">
                <input className="w-full bg-surface border border-border rounded-[5px] px-[10px] py-[7px] text-[13px] focus:outline-none focus:border-primary" placeholder="Email..." />
              </div>
              <div className="col-span-4">
                <input className="w-full bg-surface border border-border rounded-[5px] px-[10px] py-[7px] text-[13px] focus:outline-none focus:border-primary" placeholder="Địa chỉ thường trú..." />
              </div>
            </div>
          </section>

          <section>
            <div className="text-[11px] font-semibold uppercase tracking-[0.06em] text-on-surface-secondary mb-[8px]">
              2. Yêu cầu thuê
            </div>
            <div className="grid grid-cols-4 gap-[10px]">
              <div>
                <select className="w-full bg-surface border border-border rounded-[5px] px-[10px] py-[7px] text-[13px] focus:outline-none focus:border-primary text-on-surface-secondary">
                  <option value="">Hình thức thuê...</option>
                  <option value="nguyen_can">Nguyên căn</option>
                  <option value="o_ghep">Ở ghép</option>
                </select>
              </div>
              <div>
                <select className="w-full bg-surface border border-border rounded-[5px] px-[10px] py-[7px] text-[13px] focus:outline-none focus:border-primary text-on-surface-secondary">
                  <option value="">Loại phòng...</option>
                  <option value="ktx">KTX</option>
                  <option value="studio">Studio</option>
                  <option value="1pn">1 Phòng ngủ</option>
                </select>
              </div>
              <div>
                <select className="w-full bg-surface border border-border rounded-[5px] px-[10px] py-[7px] text-[13px] focus:outline-none focus:border-primary text-on-surface-secondary">
                  <option value="">Giới tính phòng...</option>
                  <option value="m">Nam</option>
                  <option value="f">Nữ</option>
                  <option value="all">Không Y/C</option>
                </select>
              </div>
              <div>
                <input type="number" className="w-full bg-surface border border-border rounded-[5px] px-[10px] py-[7px] text-[13px] focus:outline-none focus:border-primary placeholder:text-on-surface-secondary" placeholder="Số người..." />
              </div>
              
              <div>
                <select disabled className="w-full bg-surface border border-border rounded-[5px] px-[10px] py-[7px] text-[13px] focus:outline-none focus:border-primary text-on-surface-secondary opacity-70 cursor-not-allowed">
                  <option value="binh_thanh" selected>{CURRENT_BRANCH}</option>
                </select>
              </div>
              <div>
                <input className="w-full bg-surface border border-border rounded-[5px] px-[10px] py-[7px] text-[13px] focus:outline-none focus:border-primary placeholder:text-on-surface-secondary" placeholder="Giá từ..." />
              </div>
              <div>
                <input className="w-full bg-surface border border-border rounded-[5px] px-[10px] py-[7px] text-[13px] focus:outline-none focus:border-primary placeholder:text-on-surface-secondary" placeholder="Giá đến..." />
              </div>
              <div>
                <select className="w-full bg-surface border border-border rounded-[5px] px-[10px] py-[7px] text-[13px] focus:outline-none focus:border-primary text-on-surface-secondary">
                  <option value="">Thời hạn thuê...</option>
                  <option value="6m">6 tháng</option>
                  <option value="12m">12 tháng</option>
                </select>
              </div>

              <div>
                <input type="date" className="w-full bg-surface border border-border rounded-[5px] px-[10px] py-[7px] text-[13px] focus:outline-none focus:border-primary text-on-surface" title="Ngày dự kiến vào ở" />
              </div>
              <div>
                <select className="w-full bg-surface border border-border rounded-[5px] px-[10px] py-[7px] text-[13px] focus:outline-none focus:border-primary text-on-surface-secondary">
                  <option value="">Kênh liên hệ...</option>
                  <option value="facebook">Facebook</option>
                  <option value="zalo">Zalo</option>
                  <option value="hotline">Hotline</option>
                  <option value="referral">Người quen giới thiệu</option>
                </select>
              </div>
              <div className="col-span-2">
                <input className="w-full bg-surface border border-border rounded-[5px] px-[10px] py-[7px] text-[13px] focus:outline-none focus:border-primary placeholder:text-on-surface-secondary" placeholder="Tiêu chí ưu tiên khác (Máy lạnh, ban công...)" />
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
                        <td className="px-[10px] py-[8px] font-semibold">{room.id}</td>
                        <td className="px-[10px] py-[8px]">{room.price}</td>
                        <td className="px-[10px] py-[8px] text-right">
                          <button 
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
            onClick={() => setActiveModal('cancel')}
            className="flex items-center gap-[6px] bg-surface border border-border text-error px-[14px] py-[7px] rounded-[5px] text-[12px] font-semibold hover:bg-error-container hover:border-error transition-colors"
          >
            Hủy Phiếu
            <span className="bg-secondary text-on-surface-secondary rounded-[3px] font-mono text-[10px] px-[4px] py-[1px]">Esc</span>
          </button>
          
          <div className="flex-1"></div> {/* Spacer */}

          <button 
            onClick={() => setActiveModal('waitlist')}
            className="flex items-center gap-[6px] bg-surface border border-border text-warning px-[14px] py-[7px] rounded-[5px] text-[12px] font-semibold hover:bg-warning-container hover:border-warning transition-colors"
          >
            Đưa vào Waitlist
          </button>
          <button 
            onClick={() => setActiveModal('schedule')}
            className="flex items-center gap-[6px] bg-surface border border-border text-on-surface px-[14px] py-[7px] rounded-[5px] text-[12px] font-semibold hover:bg-secondary transition-colors"
          >
            Lập Lịch Hẹn 
            <span className="bg-secondary-dark text-on-surface-secondary rounded-[3px] font-mono text-[10px] px-[4px] py-[1px]">L</span>
          </button>
          <button className="flex items-center gap-[6px] bg-primary text-white px-[14px] py-[7px] rounded-[5px] text-[12px] font-semibold hover:bg-primary-light transition-colors">
            Lưu Phiếu 
            <span className="bg-primary-light text-secondary-darker rounded-[3px] font-mono text-[10px] px-[4px] py-[1px]">Ctrl+S</span>
          </button>
        </div>
      </div>

      {activeModal === 'schedule' && <ScheduleAppointmentModal onClose={() => setActiveModal(null)} />}
      {activeModal === 'update' && <UpdateViewingResultModal onClose={() => setActiveModal(null)} />}
      {activeModal === 'waitlist' && <WaitlistModal onClose={() => setActiveModal(null)} />}
      {activeModal === 'cancel' && <CancelRegistrationModal onClose={() => setActiveModal(null)} />}
    </div>
  );
};

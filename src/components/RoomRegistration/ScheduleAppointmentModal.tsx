import React from 'react';

interface ScheduleAppointmentModalProps {
  onClose: () => void;
}

const CURRENT_BRANCH = "CN1 - Q.Bình Thạnh";

export const ScheduleAppointmentModal: React.FC<ScheduleAppointmentModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-[16px] font-['Segoe_UI'] text-on-surface">
      <div className="bg-surface rounded-[8px] border border-border w-full max-w-md flex flex-col shadow-none">
        <div className="p-[16px] border-b border-border flex justify-between items-center bg-secondary rounded-t-[8px]">
          <h3 className="font-semibold text-[13px] uppercase tracking-wide">Lập lịch hẹn xem phòng</h3>
          <button onClick={onClose} className="text-on-surface-secondary hover:text-on-surface transition-colors">&times;</button>
        </div>
        
        <div className="p-[16px] space-y-[12px]">
          <div className="grid grid-cols-2 gap-[10px]">
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-[0.06em] text-on-surface-secondary mb-[4px]">Ngày hẹn</label>
              <input type="date" className="w-full bg-surface border border-border rounded-[5px] px-[10px] py-[7px] text-[13px] focus:outline-none focus:border-primary" />
            </div>
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-[0.06em] text-on-surface-secondary mb-[4px]">Giờ hẹn</label>
              <input type="time" className="w-full bg-surface border border-border rounded-[5px] px-[10px] py-[7px] text-[13px] focus:outline-none focus:border-primary" />
            </div>
          </div>
          
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-[0.06em] text-on-surface-secondary mb-[4px]">Chi nhánh</label>
            <input 
              readOnly 
              disabled 
              value={CURRENT_BRANCH} 
              className="w-full bg-secondary border border-border rounded-[5px] px-[10px] py-[7px] text-[13px] text-on-surface-secondary cursor-not-allowed focus:outline-none" 
            />
          </div>
          
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-[0.06em] text-on-surface-secondary mb-[4px]">Nhân viên phụ trách</label>
            <select className="w-full bg-surface border border-border rounded-[5px] px-[10px] py-[7px] text-[13px] focus:outline-none focus:border-primary text-on-surface-secondary">
              <option value="">Chọn nhân viên...</option>
              <option value="NV1">NV001 - Nguyễn Văn A</option>
              <option value="NV2">NV002 - Trần Thị B</option>
            </select>
          </div>
        </div>

        <div className="p-[16px] border-t border-border flex justify-end gap-[10px] bg-surface rounded-b-[8px]">
          <button onClick={onClose} className="flex items-center gap-[6px] bg-surface border border-border text-on-surface px-[14px] py-[7px] rounded-[5px] text-[12px] font-semibold hover:bg-secondary transition-colors">
            Đóng 
            <span className="bg-secondary-dark text-on-surface-secondary rounded-[3px] font-mono text-[10px] px-[4px] py-[1px]">Esc</span>
          </button>
          <button className="flex items-center gap-[6px] bg-primary text-white px-[14px] py-[7px] rounded-[5px] text-[12px] font-semibold hover:bg-primary-light transition-colors">
            Xác nhận 
            <span className="bg-primary-light text-secondary-darker rounded-[3px] font-mono text-[10px] px-[4px] py-[1px]">Enter</span>
          </button>
        </div>
      </div>
    </div>
  );
};

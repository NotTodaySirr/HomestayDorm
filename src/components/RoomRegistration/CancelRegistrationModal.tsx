import React from 'react';

interface CancelRegistrationModalProps {
  onClose: () => void;
}

export const CancelRegistrationModal: React.FC<CancelRegistrationModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-[16px] font-['Segoe_UI'] text-on-surface">
      <div className="bg-surface rounded-[8px] border border-error w-full max-w-md flex flex-col shadow-none">
        <div className="p-[16px] border-b border-border flex justify-between items-center bg-error-container rounded-t-[8px]">
          <h3 className="font-semibold text-[13px] uppercase tracking-wide text-error">Hủy phiếu đăng ký</h3>
          <button onClick={onClose} className="text-error opacity-70 hover:opacity-100 transition-colors">&times;</button>
        </div>
        
        <div className="p-[16px] space-y-[12px]">
          <div className="bg-error-container text-error px-[12px] py-[8px] rounded-[5px] text-[13px] mb-[8px] border border-error/20">
            Bạn có chắc chắn muốn hủy phiếu đăng ký này? Hành động này không thể hoàn tác.
          </div>

          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-[0.06em] text-on-surface-secondary mb-[4px]">Lý do hủy</label>
            <textarea 
              rows={3}
              className="w-full bg-surface border border-border rounded-[5px] px-[10px] py-[7px] text-[13px] focus:outline-none focus:border-error resize-none placeholder:text-on-surface-secondary"
              placeholder="Nhập lý do khách hủy đăng ký..."
            />
          </div>
        </div>

        <div className="p-[16px] border-t border-border flex justify-end gap-[10px] bg-surface rounded-b-[8px]">
          <button onClick={onClose} className="flex items-center gap-[6px] bg-surface border border-border text-on-surface px-[14px] py-[7px] rounded-[5px] text-[12px] font-semibold hover:bg-secondary transition-colors">
            Đóng 
            <span className="bg-secondary-dark text-on-surface-secondary rounded-[3px] font-mono text-[10px] px-[4px] py-[1px]">Esc</span>
          </button>
          <button className="flex items-center gap-[6px] bg-error text-white px-[14px] py-[7px] rounded-[5px] text-[12px] font-semibold hover:opacity-90 transition-opacity">
            Xác nhận Hủy 
            <span className="bg-white/20 text-white rounded-[3px] font-mono text-[10px] px-[4px] py-[1px]">Enter</span>
          </button>
        </div>
      </div>
    </div>
  );
};

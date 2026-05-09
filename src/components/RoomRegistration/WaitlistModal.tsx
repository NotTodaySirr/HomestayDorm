"use client";

import React, { useTransition } from 'react';
import { updateRegistrationStatus } from '@/actions/room-registration';
import { Loader2 } from 'lucide-react';

interface WaitlistModalProps {
  registrationId: string;
  onClose: () => void;
}

export const WaitlistModal: React.FC<WaitlistModalProps> = ({ registrationId, onClose }) => {
  const [isPending, startTransition] = useTransition();

  const handleFormSubmit = async (formData: FormData) => {
    startTransition(async () => {
      try {
        const note = formData.get('note') as string;
        await updateRegistrationStatus(registrationId, 'WAITLIST', note);
        onClose();
      } catch (error) {
        console.error('Waitlist error:', error);
      }
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-[16px] font-['Segoe_UI'] text-on-surface">
      <form action={handleFormSubmit} className="bg-surface rounded-[8px] border border-border w-full max-w-md flex flex-col shadow-none">
        <div className="p-[16px] border-b border-border flex justify-between items-center bg-secondary rounded-t-[8px]">
          <h3 className="font-semibold text-[13px] uppercase tracking-wide">Đưa vào danh sách chờ (Waitlist)</h3>
          <button type="button" onClick={onClose} disabled={isPending} className="text-on-surface-secondary hover:text-on-surface transition-colors disabled:opacity-50">&times;</button>
        </div>
        
        <div className="p-[16px] space-y-[12px]">
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-[0.06em] text-on-surface-secondary mb-[4px]">Lý do chờ / Ghi chú</label>
            <textarea 
              name="note"
              required
              disabled={isPending}
              rows={3}
              className="w-full bg-surface border border-border rounded-[5px] px-[10px] py-[7px] text-[13px] focus:outline-none focus:border-primary resize-none placeholder:text-on-surface-secondary disabled:opacity-50"
              placeholder="Nhập lý do khách chờ phòng hoặc tiêu chí cần tìm thêm..."
            />
          </div>
        </div>

        <div className="p-[16px] border-t border-border flex justify-end gap-[10px] bg-surface rounded-b-[8px]">
          <button type="button" onClick={onClose} disabled={isPending} className="flex items-center gap-[6px] bg-surface border border-border text-on-surface px-[14px] py-[7px] rounded-[5px] text-[12px] font-semibold hover:bg-secondary transition-colors disabled:opacity-50">
            Đóng 
            <span className="bg-secondary-dark text-on-surface-secondary rounded-[3px] font-mono text-[10px] px-[4px] py-[1px]">Esc</span>
          </button>
          <button 
            type="submit" 
            disabled={isPending}
            className={`flex items-center gap-[6px] text-white px-[14px] py-[7px] rounded-[5px] text-[12px] font-semibold transition-colors ${isPending ? 'bg-primary-light cursor-not-allowed' : 'bg-primary hover:bg-primary-light'}`}
          >
            {isPending ? (
              <><Loader2 className="w-[14px] h-[14px] animate-spin" /> Đang lưu...</>
            ) : (
              <>
                Xác nhận 
                <span className="bg-primary-light text-secondary-darker rounded-[3px] font-mono text-[10px] px-[4px] py-[1px]">Enter</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

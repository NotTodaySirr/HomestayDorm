"use client";

import React, { useState, useTransition } from 'react';
import { markDepositPaid, confirmDeposit, cancelDeposit } from '@/actions/deposit';
import { Loader2 } from 'lucide-react';

type DepositWithRelations = {
  id: string;
  depositAmount: number;
  paymentDeadline: string;
  depositedAt: string | null;
  confirmedAt: string | null;
  status: string;
  cancelReason: string | null;
  createdAt: string;
  registration: {
    customerName: string;
    phoneNumber: string;
  };
  details: {
    id: string;
    bed: {
      position: string;
      price: number;
      room: { name: string };
    };
  }[];
};

interface Props {
  initialDeposits: DepositWithRelations[];
}

const statusMap: Record<string, { label: string; cls: string }> = {
  PENDING:   { label: 'Chờ thanh toán', cls: 'bg-warning-container text-warning' },
  PAID:      { label: 'Đã thanh toán',  cls: 'bg-[#e0f2fe] text-[#0369a1]' },
  CONFIRMED: { label: 'Đã xác nhận',   cls: 'bg-success-container text-success' },
  CANCELLED: { label: 'Đã hủy',        cls: 'bg-error-container text-error' },
  EXPIRED:   { label: 'Hết hạn',       cls: 'bg-secondary text-on-surface-secondary' },
};

function formatCurrency(n: number) {
  return n.toLocaleString('vi-VN') + 'đ';
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function Countdown({ deadline }: { deadline: string }) {
  const [now, setNow] = React.useState(Date.now());
  React.useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);
  const diff = new Date(deadline).getTime() - now;
  if (diff <= 0) return <span className="text-error font-semibold">Hết hạn</span>;
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);
  return <span className="font-mono text-warning font-semibold">{h}h {m}m {s}s</span>;
}

// ===== Sub-Modals =====

function PayModal({ depositId, onClose }: { depositId: string; onClose: () => void }) {
  const [isPending, startTransition] = useTransition();
  const [payMethod, setPayMethod] = useState(''); // State để theo dõi hình thức thanh toán
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement> | React.DragEvent<HTMLDivElement>, isDrop = false) => {
    let file: File | undefined;
    if (isDrop) {
      e.preventDefault();
      setIsDragging(false);
      file = (e as React.DragEvent<HTMLDivElement>).dataTransfer.files?.[0];
    } else {
      file = (e as React.ChangeEvent<HTMLInputElement>).target.files?.[0];
    }

    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (formData: FormData) => {
    if (payMethod === 'TRANSFER' && !previewUrl) {
      alert("Vui lòng tải lên ảnh minh chứng chuyển khoản!");
      return;
    }
    startTransition(async () => {
      await markDepositPaid(depositId, formData);
      onClose();
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 font-['Segoe_UI']">
      <form action={handleSubmit} className="bg-surface rounded-[8px] border border-border w-full max-w-sm">
        <div className="p-4 border-b border-border bg-secondary rounded-t-[8px]">
          <h3 className="font-semibold text-[13px] uppercase tracking-wide">Xác nhận thanh toán cọc</h3>
        </div>
        <div className="p-4 space-y-3">
          <div>
            <label className="block text-[11px] font-semibold text-on-surface-secondary mb-1">Phương thức thanh toán</label>
            <select 
              name="paymentMethod" 
              required 
              disabled={isPending} 
              value={payMethod}
              onChange={(e) => setPayMethod(e.target.value)}
              className="w-full bg-surface border border-border rounded-[5px] px-3 py-2 text-[13px] focus:outline-none focus:border-primary disabled:opacity-50"
            >
              <option value="">Chọn...</option>
              <option value="CASH">Tiền mặt</option>
              <option value="TRANSFER">Chuyển khoản</option>
            </select>
          </div>

          {/* CHỈ HIỂN THỊ CÁC Ô NÀY KHI CHỌN CHUYỂN KHOẢN */}
          {payMethod === 'TRANSFER' && (
            <>
              <div>
                <label className="block text-[11px] font-semibold text-on-surface-secondary mb-1">Mã giao dịch</label>
                <input name="transactionId" required disabled={isPending} className="w-full bg-surface border border-border rounded-[5px] px-3 py-2 text-[13px] focus:outline-none focus:border-primary disabled:opacity-50" placeholder="VD: FT24050812345" />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-on-surface-secondary mb-1">Ảnh minh chứng (UNC / Bill)</label>
                <input type="hidden" name="proofUrl" value={previewUrl || ''} />
                
                <div 
                  className={`border-2 border-dashed rounded-[8px] p-4 text-center cursor-pointer transition-colors relative overflow-hidden ${
                    isDragging ? 'border-primary bg-primary-container/30' : 'border-border hover:bg-secondary/50'
                  } ${previewUrl ? 'p-1 border-primary/30' : ''}`}
                  onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={(e) => handleFileChange(e, true)}
                >
                  <input 
                    type="file" 
                    accept="image/*" 
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
                    onChange={(e) => handleFileChange(e, false)} 
                    disabled={isPending}
                  />
                  {previewUrl ? (
                    <div className="relative w-full h-32 bg-secondary rounded-[6px] overflow-hidden">
                      <img src={previewUrl} alt="Preview" className="w-full h-full object-contain" />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                        <span className="text-white text-[12px] font-semibold">Bấm hoặc kéo thả để đổi ảnh</span>
                      </div>
                    </div>
                  ) : (
                    <div className="py-4">
                      <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center mx-auto mb-2 text-on-surface-secondary">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                      </div>
                      <p className="text-[12px] font-semibold text-on-surface">Kéo thả ảnh vào đây</p>
                      <p className="text-[11px] text-on-surface-secondary mt-1">hoặc bấm để tải lên (PNG, JPG)</p>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          <div>
            <label className="block text-[11px] font-semibold text-on-surface-secondary mb-1">Ghi chú</label>
            <textarea name="note" rows={2} disabled={isPending} className="w-full bg-surface border border-border rounded-[5px] px-3 py-2 text-[13px] focus:outline-none focus:border-primary disabled:opacity-50 resize-none" placeholder="Ghi chú thêm về thanh toán..." />
          </div>
        </div>
        <div className="p-4 border-t border-border flex justify-end gap-2">
          <button type="button" onClick={onClose} disabled={isPending} className="px-3 py-2 border border-border rounded-[5px] text-[12px] font-semibold hover:bg-secondary disabled:opacity-50">Đóng</button>
          <button type="submit" disabled={isPending} className="px-3 py-2 bg-primary text-white rounded-[5px] text-[12px] font-semibold hover:bg-primary-light disabled:opacity-50 flex items-center gap-1">
            {isPending ? <><Loader2 className="w-3 h-3 animate-spin" /> Đang xử lý...</> : 'Xác nhận đã thu tiền'}
          </button>
        </div>
      </form>
    </div>
  );
}

function ConfirmModal({ depositId, onClose }: { depositId: string; onClose: () => void }) {
  const [isPending, startTransition] = useTransition();
  const handleConfirm = () => {
    startTransition(async () => {
      await confirmDeposit(depositId);
      onClose();
    });
  };
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 font-['Segoe_UI']">
      <div className="bg-surface rounded-[8px] border border-border w-full max-w-sm">
        <div className="p-4 border-b border-border bg-secondary rounded-t-[8px]">
          <h3 className="font-semibold text-[13px] uppercase tracking-wide">Quản lý xác nhận cọc</h3>
        </div>
        <div className="p-4">
          <p className="text-[13px] text-on-surface-secondary">Xác nhận đã nhận được khoản tiền cọc hợp lệ? Giường sẽ được giữ chỗ chính thức cho khách hàng.</p>
        </div>
        <div className="p-4 border-t border-border flex justify-end gap-2">
          <button onClick={onClose} disabled={isPending} className="px-3 py-2 border border-border rounded-[5px] text-[12px] font-semibold hover:bg-secondary disabled:opacity-50">Đóng</button>
          <button onClick={handleConfirm} disabled={isPending} className="px-3 py-2 bg-success text-white rounded-[5px] text-[12px] font-semibold hover:opacity-90 disabled:opacity-50 flex items-center gap-1">
            {isPending ? <><Loader2 className="w-3 h-3 animate-spin" /> Đang xử lý...</> : '✓ Xác nhận cọc hợp lệ'}
          </button>
        </div>
      </div>
    </div>
  );
}

function CancelModal({ depositId, onClose }: { depositId: string; onClose: () => void }) {
  const [isPending, startTransition] = useTransition();
  const handleSubmit = (formData: FormData) => {
    startTransition(async () => {
      await cancelDeposit(depositId, formData);
      onClose();
    });
  };
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 font-['Segoe_UI']">
      <form action={handleSubmit} className="bg-surface rounded-[8px] border border-border w-full max-w-sm">
        <div className="p-4 border-b border-border bg-secondary rounded-t-[8px]">
          <h3 className="font-semibold text-[13px] uppercase tracking-wide text-error">Hủy phiếu đặt cọc</h3>
        </div>
        <div className="p-4">
          <label className="block text-[11px] font-semibold text-on-surface-secondary mb-1">Lý do hủy</label>
          <textarea name="reason" required rows={3} disabled={isPending} className="w-full bg-surface border border-border rounded-[5px] px-3 py-2 text-[13px] focus:outline-none focus:border-primary resize-none disabled:opacity-50" placeholder="Nhập lý do hủy phiếu cọc..." />
        </div>
        <div className="p-4 border-t border-border flex justify-end gap-2">
          <button type="button" onClick={onClose} disabled={isPending} className="px-3 py-2 border border-border rounded-[5px] text-[12px] font-semibold hover:bg-secondary disabled:opacity-50">Đóng</button>
          <button type="submit" disabled={isPending} className="px-3 py-2 bg-error text-white rounded-[5px] text-[12px] font-semibold hover:opacity-90 disabled:opacity-50 flex items-center gap-1">
            {isPending ? <><Loader2 className="w-3 h-3 animate-spin" /> Đang xử lý...</> : 'Xác nhận hủy'}
          </button>
        </div>
      </form>
    </div>
  );
}

// ===== MAIN LIST VIEW =====

export const DepositListView: React.FC<Props> = ({ initialDeposits }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [payModalId, setPayModalId] = useState<string | null>(null);
  const [confirmModalId, setConfirmModalId] = useState<string | null>(null);
  const [cancelModalId, setCancelModalId] = useState<string | null>(null);

  const filtered = initialDeposits.filter((dep) => {
    const matchSearch = !searchQuery || 
      dep.registration.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dep.registration.phoneNumber.includes(searchQuery) ||
      dep.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchStatus = !statusFilter || dep.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const ITEMS_PER_PAGE = 5;
  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  return (
    <div className="h-full flex flex-col gap-[10px] p-4 bg-secondary font-['Segoe_UI'] text-on-surface">
      {/* Header */}
      <div className="bg-surface border border-border rounded-[8px] p-4 flex flex-col gap-3 shrink-0">
        <div className="flex justify-between items-center">
          <h2 className="text-[15px] font-semibold">Quản lý phiếu đặt cọc</h2>
          <a href="/dashboard/deposits/new" className="px-3 py-2 bg-primary text-white rounded-[5px] text-[12px] font-semibold hover:bg-primary-light transition-colors">
            + Tạo phiếu cọc mới
          </a>
        </div>
        <div className="grid grid-cols-4 gap-[10px]">
          <input
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
            className="bg-surface border border-border rounded-[5px] px-3 py-2 text-[13px] focus:outline-none focus:border-primary col-span-3"
            placeholder="Tìm theo tên khách, SĐT, hoặc mã phiếu..."
          />
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
            className="bg-surface border border-border rounded-[5px] px-3 py-2 text-[13px] focus:outline-none focus:border-primary"
          >
            <option value="">Tất cả trạng thái</option>
            <option value="PENDING">Chờ thanh toán</option>
            <option value="PAID">Đã thanh toán</option>
            <option value="CONFIRMED">Đã xác nhận</option>
            <option value="CANCELLED">Đã hủy</option>
            <option value="EXPIRED">Hết hạn</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto border border-border rounded-[8px] bg-surface">
        <table className="w-full text-[13px] text-left border-collapse">
          <thead className="bg-secondary border-b border-border sticky top-0">
            <tr>
              <th className="px-3 py-2 font-semibold text-[11px] text-on-surface-secondary">MÃ PHIẾU</th>
              <th className="px-3 py-2 font-semibold text-[11px] text-on-surface-secondary">KHÁCH HÀNG</th>
              <th className="px-3 py-2 font-semibold text-[11px] text-on-surface-secondary">PHÒNG / GIƯỜNG</th>
              <th className="px-3 py-2 font-semibold text-[11px] text-on-surface-secondary">SỐ TIỀN CỌC</th>
              <th className="px-3 py-2 font-semibold text-[11px] text-on-surface-secondary">HẠN THANH TOÁN</th>
              <th className="px-3 py-2 font-semibold text-[11px] text-on-surface-secondary">TRẠNG THÁI</th>
              <th className="px-3 py-2 font-semibold text-[11px] text-on-surface-secondary text-right">THAO TÁC</th>
            </tr>
          </thead>
          <tbody>
            {paginated.map((dep) => {
              const st = statusMap[dep.status] || { label: dep.status, cls: 'bg-secondary text-on-surface-secondary' };
              const roomBeds = dep.details.map(d => `P.${d.bed.room.name} (${d.bed.position})`).join(', ');
              return (
                <tr key={dep.id} className="border-b border-border hover:bg-primary-container transition-colors">
                  <td className="px-3 py-2 font-semibold text-primary">{dep.id.slice(0, 8).toUpperCase()}</td>
                  <td className="px-3 py-2">
                    <div className="font-semibold">{dep.registration.customerName}</div>
                    <div className="text-[11px] text-on-surface-secondary">{dep.registration.phoneNumber}</div>
                  </td>
                  <td className="px-3 py-2 text-[12px]">{roomBeds}</td>
                  <td className="px-3 py-2 font-semibold text-primary">{formatCurrency(dep.depositAmount)}</td>
                  <td className="px-3 py-2">
                    {dep.status === 'PENDING' ? (
                      <Countdown deadline={dep.paymentDeadline} />
                    ) : (
                      <span className="text-[12px] text-on-surface-secondary">{formatDate(dep.paymentDeadline)}</span>
                    )}
                  </td>
                  <td className="px-3 py-2">
                    <span className={`px-2 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider ${st.cls}`}>
                      {st.label}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-right">
                    <div className="flex gap-1 justify-end">
                      {dep.status === 'PENDING' && (
                        <>
                          <button onClick={() => setPayModalId(dep.id)} className="px-2 py-1 bg-[#e0f2fe] text-[#0369a1] rounded text-[11px] font-semibold hover:opacity-80">Thu tiền</button>
                          <button onClick={() => setCancelModalId(dep.id)} className="px-2 py-1 bg-error-container text-error rounded text-[11px] font-semibold hover:opacity-80">Hủy</button>
                        </>
                      )}
                      {dep.status === 'PAID' && (
                        <>
                          <button onClick={() => setConfirmModalId(dep.id)} className="px-2 py-1 bg-success-container text-success rounded text-[11px] font-semibold hover:opacity-80">Xác nhận</button>
                          <button onClick={() => setCancelModalId(dep.id)} className="px-2 py-1 bg-error-container text-error rounded text-[11px] font-semibold hover:opacity-80">Hủy</button>
                        </>
                      )}
                      {(dep.status === 'CONFIRMED' || dep.status === 'CANCELLED' || dep.status === 'EXPIRED') && (
                        <span className="text-[11px] text-on-surface-secondary italic">—</span>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
            {paginated.length === 0 && (
              <tr>
                <td colSpan={7} className="px-3 py-8 text-center text-on-surface-secondary text-[13px]">
                  Không tìm thấy phiếu đặt cọc nào.
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
            Hiển thị <span className="font-semibold text-on-surface">{(currentPage - 1) * ITEMS_PER_PAGE + 1}</span> - <span className="font-semibold text-on-surface">{Math.min(currentPage * ITEMS_PER_PAGE, filtered.length)}</span> trong số <span className="font-semibold text-on-surface">{filtered.length}</span> phiếu
          </div>
          <div className="flex gap-[6px]">
            <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="px-[10px] py-[5px] bg-secondary border border-border rounded-[5px] text-[12px] font-semibold hover:bg-surface disabled:opacity-50 transition-colors">Trang trước</button>
            <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="px-[10px] py-[5px] bg-secondary border border-border rounded-[5px] text-[12px] font-semibold hover:bg-surface disabled:opacity-50 transition-colors">Trang sau</button>
          </div>
        </div>
      )}

      {/* Modals */}
      {payModalId && <PayModal depositId={payModalId} onClose={() => setPayModalId(null)} />}
      {confirmModalId && <ConfirmModal depositId={confirmModalId} onClose={() => setConfirmModalId(null)} />}
      {cancelModalId && <CancelModal depositId={cancelModalId} onClose={() => setCancelModalId(null)} />}
    </div>
  );
};

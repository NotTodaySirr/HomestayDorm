import { X, UploadCloud, FileType2, Receipt } from "lucide-react";
import { cx, formatCurrency } from "./ui";
import type { PaymentSlip, PaymentTransaction } from "@/lib/payment-slips/types";
import { useRecordTransaction } from "./hooks/useRecordTransaction";

type RecordTransactionModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (transaction: PaymentTransaction) => void;
  slip: PaymentSlip;
  finalAmount: number;
};

export function RecordTransactionModal({
  isOpen,
  onClose,
  onSubmit,
  slip,
  finalAmount,
}: RecordTransactionModalProps) {
  const { state, actions } = useRecordTransaction({ slip, finalAmount, onSubmit });
  const {
    isRefund,
    amount,
    paymentMethod,
    transactionDate,
    bankTransactionCode,
    proofFile,
    note,
    errors,
  } = state;
  const {
    setPaymentMethod,
    setTransactionDate,
    setBankTransactionCode,
    setProofFile,
    setNote,
    setErrors,
    handleFileChange,
    handleSubmit,
  } = actions;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm">
      <div className="w-full max-w-[560px] rounded-[var(--radius-xl)] bg-[var(--color-surface)] shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="border-b border-[var(--color-border)] p-4 sm:p-5 flex justify-between items-start bg-[var(--color-primary)] text-white">
          <div>
            <h3 className="text-[18px] font-bold">
              {isRefund ? "Ghi nhận hoàn cọc" : "Ghi nhận thanh toán thêm"}
            </h3>
            <p className="text-[13px] text-white/80 mt-1">
              Phiếu {slip.code} · {slip.contract.tenantName} · {slip.contract.roomCode} | {slip.contract.bedCode}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-white/70 hover:text-white transition-colors p-1"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 flex flex-col gap-6 overflow-y-auto">
          
          {/* Summary Card */}
          <div className="rounded-[var(--radius-md)] bg-[var(--color-secondary)] p-4 border border-[var(--color-border)] flex flex-col gap-2">
            <div className="flex justify-between items-center text-[13px]">
              <span className="text-[var(--color-on-surface-secondary)] font-medium">Loại giao dịch</span>
              <span className="font-semibold">{isRefund ? "Hoàn cọc" : "Thu thêm"}</span>
            </div>
            <div className="flex justify-between items-center text-[13px]">
              <span className="text-[var(--color-on-surface-secondary)] font-medium">Chiều giao dịch</span>
              <span className="font-semibold">{isRefund ? "Chi ra" : "Thu vào"}</span>
            </div>
            <div className="flex justify-between items-center text-[13px] pt-2 border-t border-[var(--color-border)] mt-1">
              <span className="text-[var(--color-on-surface-secondary)] font-medium">Số tiền {isRefund ? "hoàn" : "cần thu"}</span>
              <span className={cx(
                "font-bold text-[18px]",
                isRefund ? "text-[var(--color-error)]" : "text-[var(--color-success)]" // If refund, we lose money (red). If collect, we gain money (green)
              )}>
                {formatCurrency(amount)}
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            {/* Payment Method */}
            <div className="flex flex-col gap-2">
              <label className="text-[13px] font-semibold text-[var(--color-on-surface)]">Hình thức thanh toán <span className="text-[var(--color-error)]">*</span></label>
              <div className="grid grid-cols-2 gap-3">
                <label className={cx(
                  "flex items-center gap-2 p-3 border rounded-[var(--radius-sm)] cursor-pointer transition-colors",
                  paymentMethod === "TIEN_MAT" ? "border-[var(--color-primary)] bg-[var(--color-primary-container)]" : "border-[var(--color-border)] hover:bg-[var(--color-secondary)]"
                )}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="TIEN_MAT"
                    checked={paymentMethod === "TIEN_MAT"}
                    onChange={() => {
                      setPaymentMethod("TIEN_MAT");
                      setErrors((prev) => ({ ...prev, bankTransactionCode: "" }));
                    }}
                    className="w-4 h-4 text-[var(--color-primary)] focus:ring-[var(--color-primary)]"
                  />
                  <span className="text-[13px] font-medium">Tiền mặt</span>
                </label>
                <label className={cx(
                  "flex items-center gap-2 p-3 border rounded-[var(--radius-sm)] cursor-pointer transition-colors",
                  paymentMethod === "CHUYEN_KHOAN" ? "border-[var(--color-primary)] bg-[var(--color-primary-container)]" : "border-[var(--color-border)] hover:bg-[var(--color-secondary)]"
                )}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="CHUYEN_KHOAN"
                    checked={paymentMethod === "CHUYEN_KHOAN"}
                    onChange={() => setPaymentMethod("CHUYEN_KHOAN")}
                    className="w-4 h-4 text-[var(--color-primary)] focus:ring-[var(--color-primary)]"
                  />
                  <span className="text-[13px] font-medium">Chuyển khoản</span>
                </label>
              </div>
            </div>

            {/* Date & Code row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-semibold text-[var(--color-on-surface)]">
                  Ngày giao dịch <span className="text-[var(--color-error)]">*</span>
                </label>
                <input
                  type="date"
                  value={transactionDate}
                  onChange={(e) => {
                    setTransactionDate(e.target.value);
                    if (errors.transactionDate) setErrors((prev) => ({ ...prev, transactionDate: "" }));
                  }}
                  className={cx(
                    "w-full rounded-[var(--radius-sm)] border px-3 py-2 text-[13px] outline-none focus:ring-1 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] transition-shadow",
                    errors.transactionDate ? "border-[var(--color-error)]" : "border-[var(--color-border)]"
                  )}
                />
                {errors.transactionDate && <p className="text-[11px] text-[var(--color-error)] mt-0.5">{errors.transactionDate}</p>}
              </div>

              {paymentMethod === "CHUYEN_KHOAN" && (
                <div className="flex flex-col gap-1.5">
                  <label className="text-[13px] font-semibold text-[var(--color-on-surface)]">
                    Mã giao dịch <span className="text-[var(--color-error)]">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="VD: FT250410123456"
                    value={bankTransactionCode}
                    onChange={(e) => {
                      setBankTransactionCode(e.target.value);
                      if (errors.bankTransactionCode) setErrors((prev) => ({ ...prev, bankTransactionCode: "" }));
                    }}
                    className={cx(
                      "w-full rounded-[var(--radius-sm)] border px-3 py-2 text-[13px] outline-none focus:ring-1 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] transition-shadow",
                      errors.bankTransactionCode ? "border-[var(--color-error)]" : "border-[var(--color-border)]"
                    )}
                  />
                  {errors.bankTransactionCode && <p className="text-[11px] text-[var(--color-error)] mt-0.5">{errors.bankTransactionCode}</p>}
                </div>
              )}
            </div>

            {/* Proof file */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[13px] font-semibold text-[var(--color-on-surface)]">
                Minh chứng (Tùy chọn)
              </label>
              <div className="relative w-full rounded-[var(--radius-sm)] border border-dashed border-[var(--color-border)] hover:border-[var(--color-primary)] transition-colors p-4 flex flex-col items-center justify-center gap-2 bg-[#FAFBFF]">
                <input 
                  type="file" 
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  onChange={handleFileChange}
                />
                {!proofFile ? (
                   <>
                     <div className="w-10 h-10 rounded-full bg-[var(--color-primary-container)] flex items-center justify-center text-[var(--color-primary)]">
                        <UploadCloud className="w-5 h-5" />
                     </div>
                     <div className="text-center">
                        <p className="text-[13px] font-medium text-[var(--color-on-surface)]">Nhấn để tải lên chứng từ</p>
                        <p className="text-[11px] text-[var(--color-on-surface-secondary)] mt-1">PNG, JPG hoặc PDF (Tối đa 5MB)</p>
                     </div>
                   </>
                ) : (
                  <div className="flex items-center gap-3 w-full justify-center">
                    <div className="p-2 bg-blue-100 rounded-md text-blue-600">
                      <FileType2 className="w-5 h-5" />
                    </div>
                    <span className="text-[13px] font-medium truncate max-w-[200px]">{proofFile}</span>
                    <button 
                      type="button"
                      className="p-1 hover:bg-gray-200 rounded-full text-gray-500 z-10"
                      onClick={(e) => {
                        e.preventDefault();
                        setProofFile("");
                      }}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Note */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[13px] font-semibold text-[var(--color-on-surface)]">
                Ghi chú
              </label>
              <textarea
                placeholder={paymentMethod === "CHUYEN_KHOAN" ? "Nhập lý do hoặc mô tả thêm..." : "Ví dụ: Đã chi tiền mặt tại quầy, có phiếu chi kèm theo."}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={2}
                className="w-full rounded-[var(--radius-sm)] border border-[var(--color-border)] px-3 py-2 text-[13px] outline-none focus:ring-1 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] transition-shadow resize-none"
              />
            </div>
            
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-[var(--color-border)] p-4 sm:p-5 flex justify-end gap-3 bg-[#FAFBFF]">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-[13px] font-semibold rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-on-surface)] hover:bg-[var(--color-secondary)] transition-colors"
          >
            Hủy
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className={cx(
              "px-4 py-2 text-[13px] font-semibold rounded-[var(--radius-sm)] flex items-center gap-2 transition-colors text-white shadow-sm",
              isRefund ? "bg-[var(--color-error)] hover:bg-[#d32f2f] border-[var(--color-error)]" : "bg-[var(--color-primary)] hover:bg-[var(--color-primary-light)] border-[var(--color-primary)]"
            )}
          >
            <Receipt className="w-4 h-4" />
            {isRefund ? "Xác nhận đã hoàn cọc" : "Xác nhận đã thu tiền"}
          </button>
        </div>

      </div>
    </div>
  );
}

"use client";

import { ArrowLeft, CheckCircle2, FilePlus2, Save, X } from "lucide-react";
import Link from "next/link";
import { Toast } from "@/components/feedback/Toast";
import {
  getRefundPolicy,
  refundPolicies,
} from "@/components/payment-slips/logic/calculation";
import { usePaymentSlipDetail } from "./hooks/usePaymentSlipDetail";
import type {
  PaymentCalculation,
  PaymentSlip,
  RefundPolicyCode,
} from "@/lib/payment-slips/types";
import { cx, FieldRow, formatCurrency, Section, StatusPill } from "./ui";
import { RecordTransactionModal } from "./RecordTransactionModal";

type PaymentSlipDetailViewProps = {
  slip: PaymentSlip;
};

const moneyFields: Array<{
  key: keyof Pick<
    PaymentCalculation,
    | "unpaidRent"
    | "electricityFee"
    | "waterFee"
    | "serviceFee"
    | "compensationFee"
    | "violationPenalty"
    | "adjustment"
  >;
  label: string;
  inherited?: boolean;
}> = [
  { key: "unpaidRent", label: "Tiền thuê còn nợ" },
  { key: "electricityFee", label: "Tiền điện" },
  { key: "waterFee", label: "Tiền nước" },
  { key: "serviceFee", label: "Phí dịch vụ" },
  { key: "compensationFee", label: "Phí bồi thường", inherited: true },
  { key: "violationPenalty", label: "Phạt vi phạm" },
  { key: "adjustment", label: "Điều chỉnh" },
];

export function PaymentSlipDetailView({ slip }: PaymentSlipDetailViewProps) {
  const { state, actions } = usePaymentSlipDetail(slip);
  const {
    calculation,
    status,
    notice,
    showConfirmModal,
    isTransactionModalOpen,
    transaction,
    totals,
    isEditable,
    isConfirmingCalculation,
    isUpdatingCustomerResponse,
  } = state;
  const {
    setCalculation,
    setStatus,
    setShowConfirmModal,
    setIsTransactionModalOpen,
    updateMoneyField,
    handleConfirmCalculation,
    handleTransactionSubmit,
    confirmNoTransaction,
  } = actions;

  return (
    <div className="flex h-[calc(100dvh-var(--topbar-height)-24px)] sm:h-[calc(100dvh-var(--topbar-height)-32px)] w-full flex-col bg-[var(--color-surface)] overflow-hidden rounded-[var(--radius-md)] border border-[var(--color-border)] shadow-sm">
      <div className="flex flex-col gap-3 border-b border-[var(--color-border)] px-4 py-3 sm:px-6 sm:py-4 bg-[#FAFBFF]">
        <div className="flex items-center justify-between">
          <h1 className="text-[18px] sm:text-[20px] font-bold text-[var(--color-on-surface)]">
            Chi tiết phiếu thanh toán: {slip.code}
            <span className="ml-2 text-[14px] font-normal text-[var(--color-on-surface-secondary)]">
              {slip.contract.tenantName} · {slip.contract.roomCode} | {slip.contract.bedCode}
            </span>
          </h1>
          <StatusPill status={status} />
        </div>
        <div>
          <Link
            href="/dashboard/payment-slips"
            className="inline-flex items-center gap-1 text-[13px] font-medium text-[var(--color-primary)] hover:underline"
          >
            <ArrowLeft className="h-4 w-4" /> Quay lại
          </Link>
        </div>
      </div>

      {notice ? <div className="px-4 sm:px-6 pt-4 shrink-0"><Toast message={notice} variant="success" /></div> : null}

      <div className="flex-1 overflow-hidden p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-[70%_30%] gap-6">
        <div className="flex flex-col gap-6 overflow-y-auto pr-2 pb-12">
          <Section title="1. THÔNG TIN HỢP ĐỒNG & CỌC">
            <dl>
              <FieldRow label="Mã HĐ" value={slip.contract.code} />
              <FieldRow label="Khách" value={slip.contract.tenantName} />
              <FieldRow label="Phòng" value={`${slip.contract.roomCode} | ${slip.contract.bedCode}`} />
              <FieldRow label="Tiền cọc gốc" value={formatCurrency(slip.contract.depositAmount)} />
              <FieldRow label="Thời gian lưu trú" value={slip.contract.stayDescription} />
            </dl>
          </Section>

          <Section title="2. KẾT QUẢ KIỂM TRA TỪ QUẢN LÝ">
            <dl>
              <FieldRow label="Vệ sinh" value={<span className="inline-flex rounded-full bg-[var(--color-primary-container)] px-2 py-0.5 text-[12px] font-medium text-[var(--color-primary)]">{slip.managerInspection.hygieneStatus}</span>} />
              <FieldRow label="Tài sản" value={<span className="inline-flex rounded-full bg-[var(--color-primary-container)] px-2 py-0.5 text-[12px] font-medium text-[var(--color-primary)]">{slip.managerInspection.assetStatus}</span>} />
              <FieldRow label="Bồi thường dự kiến" value={<span className="font-semibold">{formatCurrency(slip.managerInspection.estimatedCompensation)}</span>} />
              <FieldRow label="Ghi chú" value={slip.managerInspection.note} />
            </dl>
          </Section>

          <Section title="3. TÍNH TOÁN NGHĨA VỤ TÀI CHÍNH">
            <div className="flex flex-col gap-6">
              <div>
                <p className="text-[13px] font-semibold text-[var(--color-on-surface)] mb-3">
                  A. Tỷ lệ hoàn cọc cơ bản
                </p>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {refundPolicies.map((policy) => (
                    <label
                      key={policy.code}
                      className={cx(
                        "flex cursor-pointer flex-col items-center justify-center rounded-[var(--radius-md)] border p-3 text-center transition-colors",
                        calculation.refundPolicy === policy.code
                          ? "border-[var(--color-primary)] bg-[var(--color-primary-container)] text-[var(--color-primary)]"
                          : "border-[var(--color-border)] hover:bg-[var(--color-secondary)]",
                        !isEditable && "opacity-70 cursor-not-allowed"
                      )}
                    >
                      <input
                        type="radio"
                        name="refundPolicy"
                        className="sr-only"
                        checked={calculation.refundPolicy === policy.code}
                        disabled={!isEditable}
                        onChange={() =>
                          setCalculation((current) => ({
                            ...current,
                            refundPolicy: policy.code as RefundPolicyCode,
                          }))
                        }
                      />
                      <span className="text-[12px] font-medium">{policy.label.split(' (')[0]}</span>
                      <span className="text-[14px] font-bold mt-1">{policy.rate}%</span>
                    </label>
                  ))}
                </div>
                <div className="mt-4 rounded-[var(--radius-sm)] bg-[var(--color-primary-container)] p-3 text-[13px] text-[var(--color-on-surface)] flex justify-between items-center">
                  <span>Tiền cọc hoàn cơ bản = {formatCurrency(slip.contract.depositAmount)} × {getRefundPolicy(calculation.refundPolicy).rate}%</span>
                  <span className="font-bold text-[var(--color-primary)] text-[15px]">{formatCurrency(totals.baseRefund)}</span>
                </div>
              </div>

              <div>
                <p className="text-[13px] font-semibold text-[var(--color-on-surface)] mb-3">
                  B. Các khoản khấu trừ
                </p>
                <div className="grid grid-cols-1 gap-x-8 gap-y-6 md:grid-cols-2">
                  <div className="flex flex-col gap-3">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--color-on-surface-secondary)] border-b border-[var(--color-border)] pb-2 mb-1">Công nợ thuê/phí</p>
                    {moneyFields.slice(0, 4).map((field) => (
                      <label key={field.key} className="flex items-center justify-between text-[13px]">
                        <span className="text-[var(--color-on-surface-secondary)]">{field.label}</span>
                        <input
                          type="number"
                          value={calculation[field.key]}
                          disabled={!isEditable}
                          onChange={(event) => updateMoneyField(field.key, event.target.value)}
                          className="w-32 rounded-[var(--radius-sm)] border border-[var(--color-border)] px-3 py-1.5 text-right outline-none focus:border-[var(--color-primary)] focus:ring-1 focus:ring-1 focus:ring-[var(--color-primary)] disabled:bg-[var(--color-secondary)] disabled:text-[var(--color-on-surface-secondary)]"
                        />
                      </label>
                    ))}
                  </div>

                  <div className="flex flex-col gap-3">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--color-on-surface-secondary)] border-b border-[var(--color-border)] pb-2 mb-1">Bồi thường & Vi phạm</p>
                    {moneyFields.slice(4, 6).map((field) => (
                      <label key={field.key} className="flex items-center justify-between text-[13px]">
                        <span className="flex items-center gap-2 text-[var(--color-on-surface-secondary)]">
                          {field.label}
                          {field.inherited && (
                            <span className="rounded-full bg-[var(--color-warning-container)] px-2 py-[2px] text-[10px] font-bold text-[var(--color-warning)]" title="Lấy từ kết quả kiểm tra của quản lý">TỪ QL</span>
                          )}
                        </span>
                        <input
                          type="number"
                          value={calculation[field.key]}
                          disabled={!isEditable}
                          onChange={(event) => updateMoneyField(field.key, event.target.value)}
                          className="w-32 rounded-[var(--radius-sm)] border border-[var(--color-border)] px-3 py-1.5 text-right outline-none focus:border-[var(--color-primary)] focus:ring-1 focus:ring-1 focus:ring-[var(--color-primary)] disabled:bg-[var(--color-secondary)] disabled:text-[var(--color-on-surface-secondary)]"
                        />
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <p className="text-[13px] font-semibold text-[var(--color-on-surface)] mb-3">
                  C. Điều chỉnh kế toán
                </p>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-[200px_1fr]">
                   <label className="flex flex-col gap-1 text-[13px]">
                     <span className="text-[var(--color-on-surface-secondary)] font-medium">Giá trị điều chỉnh</span>
                     <input
                        type="number"
                        value={calculation.adjustment}
                        disabled={!isEditable}
                        onChange={(event) => updateMoneyField("adjustment", event.target.value)}
                        className="rounded-[var(--radius-sm)] border border-[var(--color-border)] px-3 py-2 outline-none focus:border-[var(--color-primary)] focus:ring-1 focus:ring-1 focus:ring-[var(--color-primary)] disabled:bg-[var(--color-secondary)]"
                     />
                   </label>
                   <label className="flex flex-col gap-1 text-[13px]">
                    <span className="text-[var(--color-on-surface-secondary)] font-medium">Lý do điều chỉnh {calculation.adjustment !== 0 && <span className="text-[var(--color-error)] ml-1">*</span>}</span>
                    <input
                      value={calculation.adjustmentReason}
                      disabled={!isEditable}
                      placeholder={calculation.adjustment !== 0 ? "Bắt buộc nhập lý do điều chỉnh..." : "Tùy chọn..."}
                      onChange={(event) =>
                        setCalculation((current) => ({
                          ...current,
                          adjustmentReason: event.target.value,
                        }))
                      }
                      className={cx(
                        "rounded-[var(--radius-sm)] border border-[var(--color-border)] px-3 py-2 outline-none focus:border-[var(--color-primary)] focus:ring-1 focus:ring-1 focus:ring-[var(--color-primary)] disabled:bg-[var(--color-secondary)]",
                        calculation.adjustment !== 0 && !calculation.adjustmentReason.trim() && isEditable && "border-[var(--color-error)] focus:border-[var(--color-error)] focus:ring-[var(--color-error)]"
                      )}
                    />
                  </label>
                </div>
              </div>

            </div>
          </Section>
          
          {status === "needReview" && (
            <Section title="LÝ DO CẦN KIỂM TRA LẠI">
              <div className="rounded-[var(--radius-sm)] bg-[var(--color-error-container)] p-4 text-[13px] text-[var(--color-error)] flex gap-3">
                <X className="h-5 w-5 flex-shrink-0" />
                <div>
                  <p className="font-bold mb-1">Khách không đồng ý với kết quả đối soát</p>
                  <p>{slip.managerInspection.note}</p>
                </div>
              </div>
            </Section>
          )}

        </div>

        <div className="flex flex-col gap-4 overflow-y-auto pb-12 pr-2">
          <div className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] overflow-hidden shadow-sm">
            <div className="border-b border-[var(--color-border)] bg-[#FAFBFF] px-4 py-3">
              <h2 className="text-[14px] font-bold text-[var(--color-primary)] text-center">KẾT QUẢ TÍNH TOÁN</h2>
            </div>
            <div className="p-5 flex flex-col gap-3 text-[14px]">
              <div className="flex justify-between">
                <span className="text-[var(--color-on-surface-secondary)]">Tiền cọc gốc:</span>
                <span className="font-medium">{formatCurrency(slip.contract.depositAmount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--color-on-surface-secondary)]">Tỷ lệ hoàn:</span>
                <span className="font-medium">{getRefundPolicy(calculation.refundPolicy).rate}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--color-on-surface-secondary)]">Hoàn cơ bản:</span>
                <span className="font-medium">{formatCurrency(totals.baseRefund)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--color-on-surface-secondary)]">Tổng khấu trừ:</span>
                <span className="font-medium text-[var(--color-error)]">{formatCurrency(totals.totalDeductions)}</span>
              </div>
              
              <div className="mt-3 border-t border-[var(--color-border)] pt-5 text-center">
                <p className={cx(
                  "text-[28px] font-bold tracking-tight",
                  totals.finalAmount > 0 ? "text-[var(--color-success)]" : totals.finalAmount < 0 ? "text-[var(--color-error)]" : "text-[var(--color-on-surface)]"
                )}>
                  {totals.finalAmount > 0 ? "+" : ""}{formatCurrency(totals.finalAmount)}
                </p>
                <p className="text-[13px] font-semibold uppercase tracking-wide text-[var(--color-on-surface-secondary)] mt-2">{totals.conclusion}</p>
              </div>

              {transaction && (
                <div className="mt-3 border-t border-[var(--color-border)] pt-4 flex flex-col gap-2 text-[13px]">
                   <div className="flex justify-between">
                     <span className="text-[var(--color-on-surface-secondary)]">Trạng thái giao dịch:</span>
                     <span className="font-medium text-[var(--color-success)]">Đã thanh toán</span>
                   </div>
                   <div className="flex justify-between">
                     <span className="text-[var(--color-on-surface-secondary)]">Hình thức:</span>
                     <span className="font-medium">{transaction.paymentMethod === "TIEN_MAT" ? "Tiền mặt" : "Chuyển khoản"}</span>
                   </div>
                   <div className="flex justify-between">
                     <span className="text-[var(--color-on-surface-secondary)]">Ngày giao dịch:</span>
                     <span className="font-medium">{new Date(transaction.transactionDate).toLocaleDateString("vi-VN")}</span>
                   </div>
                   {transaction.bankTransactionCode && (
                     <div className="flex justify-between">
                       <span className="text-[var(--color-on-surface-secondary)]">Mã GD:</span>
                       <span className="font-medium">{transaction.bankTransactionCode}</span>
                     </div>
                   )}
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-3">
            {status === "pendingAccounting" && (
              <>
                <ActionButton
                  icon={Save}
                  onClick={() => setShowConfirmModal(true)}
                  disabled={calculation.adjustment !== 0 && !calculation.adjustmentReason.trim()}
                >
                  Xác nhận kết quả tính toán
                </ActionButton>

              </>
            )}

            {status === "needReview" && (
              <>
                <ActionButton
                  icon={Save}
                  onClick={() => setShowConfirmModal(true)}
                  disabled={calculation.adjustment !== 0 && !calculation.adjustmentReason.trim()}
                >
                  Chỉnh sửa kết quả
                </ActionButton>

              </>
            )}

            {status === "calculated" && (
              <div className="rounded-[var(--radius-sm)] bg-[var(--color-warning-container)] p-3 text-[13px] text-[var(--color-warning)] text-center font-medium leading-relaxed">
                Kết quả đã được xác nhận.<br/>Đang chờ quản lý ghi nhận phản hồi của khách.
              </div>
            )}

            {status === "customerConfirmed" && totals.finalAmount > 0 && (
              <ActionButton 
                icon={CheckCircle2} 
                onClick={() => setIsTransactionModalOpen(true)}
                disabled={isUpdatingCustomerResponse}
              >
                Ghi nhận hoàn cọc
              </ActionButton>
            )}

            {status === "waitingDepositRefund" && (
              <ActionButton 
                icon={CheckCircle2} 
                onClick={() => setIsTransactionModalOpen(true)}
                disabled={isUpdatingCustomerResponse}
              >
                Ghi nhận đã hoàn cọc
              </ActionButton>
            )}

            {status === "customerConfirmed" && totals.finalAmount < 0 && (
              <ActionButton 
                icon={FilePlus2} 
                variant="danger" 
                onClick={() => setIsTransactionModalOpen(true)}
                disabled={isUpdatingCustomerResponse}
              >
                Lập phiếu thanh toán thêm
              </ActionButton>
            )}

            {status === "waitingExtraPayment" && (
              <>
                <ActionButton 
                  icon={CheckCircle2} 
                  variant="primary" 
                  onClick={() => setIsTransactionModalOpen(true)}
                  disabled={isUpdatingCustomerResponse}
                >
                  Ghi nhận đã thu đủ
                </ActionButton>
                <ActionButton 
                  icon={CheckCircle2} 
                  variant="secondary" 
                  onClick={() => setStatus("partiallyPaid")}
                  disabled={isUpdatingCustomerResponse}
                >
                  Thanh toán một phần
                </ActionButton>
              </>
            )}

            {status === "partiallyPaid" && (
               <ActionButton 
                 icon={CheckCircle2} 
                 variant="primary" 
                 onClick={() => setIsTransactionModalOpen(true)}
                 disabled={isUpdatingCustomerResponse}
               >
                  Ghi nhận đã thu đủ
               </ActionButton>
            )}

            {status === "customerConfirmed" && totals.finalAmount === 0 && (
              <ActionButton 
                icon={CheckCircle2} 
                onClick={confirmNoTransaction}
                disabled={isUpdatingCustomerResponse}
              >
                {isUpdatingCustomerResponse ? "Đang xử lý..." : "Xác nhận không phát sinh giao dịch"}
              </ActionButton>
            )}

            {(status === "completedRefund" || status === "completedExtraPayment" || status === "noTransaction") && (
              <>
                <div className="rounded-[var(--radius-sm)] bg-[var(--color-success-container)] p-3 text-[13px] text-[var(--color-success)] text-center font-medium">
                  Phiếu thanh toán đã hoàn tất xử lý.
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-[var(--radius-xl)] bg-[var(--color-surface)] shadow-xl overflow-hidden">
            <div className="border-b border-[var(--color-border)] p-5 flex justify-between items-center bg-[#FAFBFF]">
               <h3 className="text-[16px] font-bold text-[var(--color-primary)]">Xác nhận kết quả tính toán?</h3>
               <button onClick={() => setShowConfirmModal(false)} className="text-[var(--color-on-surface-secondary)] hover:text-[var(--color-on-surface)] transition-colors">
                  <X className="h-5 w-5" />
               </button>
            </div>
            <div className="p-6 flex flex-col gap-4 text-[14px]">
               <div className="flex justify-between items-center">
                  <span className="text-[var(--color-on-surface-secondary)]">Tiền cọc hoàn cơ bản:</span>
                  <span className="font-medium text-[15px]">{formatCurrency(totals.baseRefund)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[var(--color-on-surface-secondary)]">Tổng khấu trừ:</span>
                  <span className="font-medium text-[15px] text-[var(--color-error)]">{formatCurrency(totals.totalDeductions)}</span>
                </div>
                <div className="flex justify-between items-center border-t border-[var(--color-border)] pt-4 mt-2">
                  <span className="font-bold text-[15px]">{totals.finalAmount > 0 ? "Khách được hoàn:" : totals.finalAmount < 0 ? "Khách cần thanh toán:" : "Số tiền cuối cùng:"}</span>
                  <span className={cx(
                    "font-bold text-[20px]",
                    totals.finalAmount > 0 ? "text-[var(--color-success)]" : totals.finalAmount < 0 ? "text-[var(--color-error)]" : ""
                  )}>{formatCurrency(Math.abs(totals.finalAmount))}</span>
                </div>
                
                <div className="mt-2 rounded-[var(--radius-sm)] bg-[var(--color-warning-container)] p-3 text-[13px] text-[var(--color-warning)] leading-relaxed">
                  Sau khi xác nhận, phiếu sẽ chuyển sang trạng thái <b>Chờ khách xác nhận đối soát</b>.
                </div>
            </div>
            <div className="border-t border-[var(--color-border)] p-5 flex justify-end gap-3 bg-[#FAFBFF]">
               <ActionButton variant="secondary" onClick={() => setShowConfirmModal(false)}>Kiểm tra lại</ActionButton>
               <ActionButton
                 variant="primary"
                 icon={CheckCircle2}
                 onClick={handleConfirmCalculation}
                 disabled={isConfirmingCalculation}
               >
                 {isConfirmingCalculation ? "Đang lưu..." : "Xác nhận"}
               </ActionButton>
            </div>
          </div>
        </div>
      )}

      <RecordTransactionModal
        isOpen={isTransactionModalOpen}
        onClose={() => setIsTransactionModalOpen(false)}
        onSubmit={handleTransactionSubmit}
        slip={slip}
        finalAmount={totals.finalAmount}
      />
    </div>
  );
}

function ActionButton({
  children,
  icon: Icon,
  disabled,
  onClick,
  variant = "primary",
}: {
  children: React.ReactNode;
  icon?: typeof Save;
  disabled?: boolean;
  onClick?: () => void;
  variant?: "primary" | "secondary" | "danger";
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={cx(
        "inline-flex min-h-[42px] w-full items-center justify-center gap-2 rounded-[var(--radius-md)] border px-4 py-2 text-[14px] font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50",
        variant === "primary" &&
          "border-[var(--color-primary)] bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-light)] shadow-sm",
        variant === "secondary" &&
          "border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-on-surface)] hover:bg-[var(--color-secondary)] hover:border-[var(--color-on-surface-secondary)]",
        variant === "danger" &&
          "border-[var(--color-error)] bg-[var(--color-error)] text-white hover:bg-[#d32f2f] shadow-sm",
      )}
    >
      {Icon && <Icon aria-hidden="true" className="h-4 w-4" />}
      <span>{children}</span>
    </button>
  );
}

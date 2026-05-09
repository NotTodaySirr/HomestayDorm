"use client";

import { useMemo, useState } from "react";
import { CalendarDays, FilePlus2, X } from "lucide-react";
import type { CheckInContractRecord } from "@/lib/check-in-contracts/types";
import { cx, formatCurrency, formatDate } from "./ui";
import { formatContractedBeds } from "./logic/contractScope";

type CreateReturnRoomTicketModalProps = {
  isOpen: boolean;
  record: CheckInContractRecord;
  isSubmitting?: boolean;
  error?: string | null;
  onClose: () => void;
  onSubmit: (input: { expectedReturnDate: string; saleNote: string }) => void;
};

export function CreateReturnRoomTicketModal({
  isOpen,
  record,
  isSubmitting,
  error,
  onClose,
  onSubmit,
}: CreateReturnRoomTicketModalProps) {
  const [expectedReturnDate, setExpectedReturnDate] = useState("");
  const [saleNote, setSaleNote] = useState("");
  const [dateError, setDateError] = useState("");

  const warning = useMemo(() => {
    if (!expectedReturnDate || !record.contract?.startDate) return "";
    const expected = new Date(expectedReturnDate);
    const start = new Date(record.contract.startDate);
    if (expected.getTime() < start.getTime()) {
      return "Ngày dự kiến trả phòng đang trước ngày bắt đầu hợp đồng.";
    }
    return "";
  }, [expectedReturnDate, record.contract?.startDate]);

  if (!isOpen || !record.contract) return null;

  function handleSubmit() {
    if (!expectedReturnDate) {
      setDateError("Vui lòng chọn ngày dự kiến trả phòng.");
      return;
    }
    setDateError("");
    onSubmit({ expectedReturnDate, saleNote });
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm">
      <div className="flex max-h-[90vh] w-full max-w-[560px] flex-col overflow-hidden rounded-[var(--radius-xl)] bg-[var(--color-surface)] shadow-xl">
        <div className="flex items-start justify-between border-b border-[var(--color-border)] bg-[var(--color-primary)] p-4 text-white sm:p-5">
          <div className="min-w-0">
            <h3 className="text-[18px] font-bold">Tạo phiếu trả phòng</h3>
            <p className="mt-1 truncate text-[13px] text-white/80">
              Hợp đồng {record.contract.code} · {record.customer.name} · {record.room.roomCode} | {formatContractedBeds(record)}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-white/70 transition-colors hover:text-white"
            aria-label="Đóng modal tạo phiếu trả phòng"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex flex-col gap-5 overflow-y-auto p-5 sm:p-6">
          <div className="flex flex-col gap-2 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-secondary)] p-4">
            <SummaryRow label="Mã hợp đồng" value={record.contract.code} />
            <SummaryRow label="Khách thuê" value={`${record.customer.name} · ${record.customer.phone}`} />
            <SummaryRow label="Phòng/Giường" value={`${record.room.roomCode} | ${formatContractedBeds(record)}`} />
            <SummaryRow label="Tiền cọc" value={formatCurrency(record.depositAmount)} />
            <SummaryRow
              label="Thời gian hợp đồng"
              value={`${formatDate(record.contract.startDate)} → ${record.contract.endDate ? formatDate(record.contract.endDate) : "Chưa xác định"}`}
            />
          </div>

          <div className="grid gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[13px] font-semibold text-[var(--color-on-surface)]" htmlFor="return-ticket-expected-date">
                Ngày dự kiến trả phòng <span className="text-[var(--color-error)]">*</span>
              </label>
              <input
                id="return-ticket-expected-date"
                type="date"
                value={expectedReturnDate}
                onChange={(event) => {
                  setExpectedReturnDate(event.target.value);
                  if (dateError) setDateError("");
                }}
                className={cx(
                  "w-full rounded-[var(--radius-sm)] border px-3 py-2 text-[13px] outline-none transition-shadow focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)]",
                  dateError ? "border-[var(--color-error)]" : "border-[var(--color-border)]",
                )}
              />
              {dateError ? <p className="text-[11px] text-[var(--color-error)]">{dateError}</p> : null}
              {warning ? <p className="text-[11px] text-[var(--color-warning)]">{warning}</p> : null}
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[13px] font-semibold text-[var(--color-on-surface)]" htmlFor="return-ticket-sale-note">
                Ghi chú sale
              </label>
              <textarea
                id="return-ticket-sale-note"
                value={saleNote}
                onChange={(event) => setSaleNote(event.target.value)}
                rows={3}
                placeholder="Ví dụ: khách báo trả sớm, khách hẹn trả chìa khóa buổi sáng..."
                className="w-full resize-none rounded-[var(--radius-sm)] border border-[var(--color-border)] px-3 py-2 text-[13px] outline-none transition-shadow focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)]"
              />
            </div>

            {error ? (
              <div className="rounded-[var(--radius-sm)] border border-[var(--color-error)] bg-[var(--color-error-container)] px-3 py-2 text-[12px] font-medium text-[var(--color-error)]">
                {error}
              </div>
            ) : null}
          </div>
        </div>

        <div className="flex justify-end gap-3 border-t border-[var(--color-border)] bg-[#FAFBFF] p-4 sm:p-5">
          <button
            type="button"
            onClick={onClose}
            className="rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2 text-[13px] font-semibold text-[var(--color-on-surface)] transition-colors hover:bg-[var(--color-secondary)]"
          >
            Hủy
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex items-center gap-2 rounded-[var(--radius-sm)] border border-[var(--color-primary)] bg-[var(--color-primary)] px-4 py-2 text-[13px] font-semibold text-white shadow-sm transition-colors hover:bg-[var(--color-primary-light)] disabled:cursor-not-allowed disabled:opacity-60"
          >
            <FilePlus2 className="h-4 w-4" />
            {isSubmitting ? "Đang tạo..." : "Tạo phiếu trả phòng"}
          </button>
        </div>
      </div>
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 text-[13px]">
      <span className="font-medium text-[var(--color-on-surface-secondary)]">{label}</span>
      <span className="min-w-0 text-right font-semibold text-[var(--color-on-surface)]">{value}</span>
    </div>
  );
}

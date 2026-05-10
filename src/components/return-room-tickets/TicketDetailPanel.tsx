import { Check, ClipboardCheck, DoorOpen, RotateCcw, X } from "lucide-react";
import type { ReactNode } from "react";
import type { ReturnRoomTicket } from "@/lib/return-room-tickets/types";
import { statusMeta } from "@/lib/return-room-tickets/status";
import { canUpdateRoomBeds } from "./logic/roomBedFinalization";
import {
  ActionButton,
  cx,
  DetailSection,
  FieldRow,
  formatCurrency,
  formatDate,
  StatusPill,
} from "./ui";

type TicketDetailPanelProps = {
  ticket: ReturnRoomTicket | null;
  onStartReconciliation: () => void;
  onStartRoomUpdate: () => void;
  onCustomerAgreed: () => void;
  onCustomerDisagreed: () => void;
};

export function TicketDetailPanel({
  ticket,
  onStartReconciliation,
  onStartRoomUpdate,
  onCustomerAgreed,
  onCustomerDisagreed,
}: TicketDetailPanelProps) {
  if (!ticket) {
    return (
      <section className="flex h-[500px] min-h-0 flex-col overflow-hidden rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] xl:h-full">
        <DetailHeader description="Chọn một phiếu trong danh sách" />
        <div className="flex min-h-0 flex-1 items-center justify-center px-4 text-center text-[12px] text-[var(--color-on-surface-secondary)]">
          Chọn một phiếu trong danh sách để xem thông tin xử lý.
        </div>
      </section>
    );
  }

  const meta = statusMeta[ticket.status];
  const shouldCreateReconciliation = ticket.status === "pendingManagerReview";
  const shouldConfirmCustomer =
    ticket.status === "accountingResultReady" ||
    ticket.status === "waitingCustomerConfirmation";
  const shouldUpdateRoom =
    ticket.status === "customerConfirmed" ||
    ticket.status === "waitingDepositRefund" ||
    ticket.status === "waitingExtraPayment" ||
    (ticket.status === "completed" && ticket.roomFinalization.status === "notStarted");
  const shouldRecheck = ticket.status === "needsRecheck";
  const canOpenRoomBedModal = canUpdateRoomBeds(ticket);
  const shouldShowPaymentSlipResult =
    ticket.status === "waitingCustomerConfirmation" && ticket.accountingResult;

  const primaryActions = (
    <>
      {shouldCreateReconciliation ? (
        <ActionButton
          icon={ClipboardCheck}
          variant="primary"
          onClick={onStartReconciliation}
        >
          Lập phiếu thanh toán
        </ActionButton>
      ) : null}

      {shouldConfirmCustomer ? (
        <>
          <ActionButton icon={Check} variant="primary" onClick={onCustomerAgreed}>
            Khách đồng ý
          </ActionButton>
          <ActionButton icon={X} variant="danger" onClick={onCustomerDisagreed}>
            Khách không đồng ý
          </ActionButton>
        </>
      ) : null}

      {shouldUpdateRoom ? (
        <ActionButton
          icon={DoorOpen}
          variant="primary"
          onClick={onStartRoomUpdate}
          disabled={!canOpenRoomBedModal}
        >
          Cập nhật phòng/giường
        </ActionButton>
      ) : null}

      {shouldRecheck ? (
        <ActionButton
          icon={RotateCcw}
          variant="primary"
          onClick={onStartReconciliation}
        >
          Kiểm tra lại
        </ActionButton>
      ) : null}
    </>
  );

  return (
    <section className="flex h-[500px] min-h-0 flex-col overflow-hidden rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] xl:h-full">
      <DetailHeader
        description={`${ticket.code} · ${ticket.tenant.name} · ${ticket.room.roomCode} / ${ticket.room.bedCode}`}
        action={<StatusPill status={ticket.status} />}
      />

      <div className="min-h-0 flex-1 overflow-auto">
        <DetailSection title="Thông tin chính">
          <dl>
            <FieldRow label="Khách thuê" value={ticket.tenant.name} />
            <FieldRow label="Số điện thoại" value={ticket.tenant.phone} />
            <FieldRow label="CCCD/CMND" value={ticket.tenant.identityNumber} />
            <FieldRow label="Mã hợp đồng" value={ticket.contract.code} />
            <FieldRow
              label="Tiền cọc"
              value={formatCurrency(ticket.contract.depositAmount)}
            />
            <FieldRow
              label="Ngày dự kiến trả"
              value={formatDate(ticket.room.expectedReturnDate)}
            />
            <FieldRow label="Ghi chú sale" value={ticket.saleNote} />
          </dl>
        </DetailSection>

        <DetailSection title="Trạng thái xử lý">
          <dl>
            <FieldRow label="Phiếu trả phòng" value={meta.label} />
            <FieldRow label="Bước xử lý tiếp theo" value={meta.nextStep} />
            <FieldRow
              label="Phiếu thanh toán"
              value={ticket.reconciliation?.status ?? "Chưa lập"}
            />
            <FieldRow
              label="Kế toán"
              value={ticket.accountingResult ? "Đã có kết quả" : "Chưa xử lý"}
            />
            <FieldRow
              label="Khách xác nhận"
              value={getCustomerConfirmationLabel(ticket)}
            />
            <FieldRow
              label="Phòng/Giường"
              value={getRoomFinalizationLabel(ticket)}
            />
          </dl>
        </DetailSection>

        {shouldShowPaymentSlipResult ? (
          <PaymentSlipResultSection ticket={ticket} />
        ) : null}

        <DetailSection title="Thông tin hợp đồng" defaultOpen={false}>
          <dl>
            <FieldRow
              label="Ngày bắt đầu"
              value={formatDate(ticket.contract.startDate)}
            />
            <FieldRow
              label="Ngày kết thúc"
              value={formatDate(ticket.contract.endDate)}
            />
            <FieldRow label="Trạng thái HĐ" value={ticket.contract.status} />
            <FieldRow label="Tình trạng lưu trú" value={ticket.contract.stayStatus} />
          </dl>
        </DetailSection>

        <DetailSection title="Phòng/Giường" defaultOpen={false}>
          <dl>
            <FieldRow label="Mã phòng" value={ticket.room.roomCode} />
            <FieldRow label="Mã giường" value={ticket.room.bedCode} />
            <FieldRow label="Trạng thái hiện tại" value={ticket.room.currentStatus} />
            <FieldRow
              label="Ngày trả thực tế"
              value={
                ticket.room.actualReturnDate
                  ? formatDate(ticket.room.actualReturnDate)
                  : "Chưa cập nhật"
              }
            />
            <FieldRow
              label="Trạng thái phòng sau cập nhật"
              value={ticket.roomFinalization.roomStatusAfterCheckout ?? "Chưa cập nhật"}
            />
          </dl>
          {ticket.roomFinalization.updatedBeds && ticket.roomFinalization.updatedBeds.length > 0 ? (
            <div className="mt-3 overflow-hidden rounded-[var(--radius-sm)] border border-[var(--color-border)]">
              <div className="grid grid-cols-[1fr_160px] bg-[var(--color-secondary)] px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.06em] text-[var(--color-on-secondary)]">
                <span>Giường đã cập nhật</span>
                <span className="text-right">Trạng thái</span>
              </div>
              {ticket.roomFinalization.updatedBeds.map((bed) => (
                <div
                  key={bed.bedCode}
                  className="grid grid-cols-[1fr_160px] border-t border-[var(--color-border)] px-3 py-2 text-[12px]"
                >
                  <span>{bed.bedCode}</span>
                  <span className="text-right">{bed.statusAfterCheckout}</span>
                </div>
              ))}
            </div>
          ) : null}
        </DetailSection>
      </div>

      <div className="flex shrink-0 flex-col gap-2 border-t border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-3 sm:flex-row sm:items-center sm:justify-end">
        <div className="flex flex-wrap justify-end gap-2">{primaryActions}</div>
      </div>
    </section>
  );
}

type DetailHeaderProps = {
  description: string;
  action?: ReactNode;
};

function DetailHeader({ description, action }: DetailHeaderProps) {
  return (
    <div className="flex shrink-0 flex-col gap-3 border-b border-[var(--color-border)] bg-slate-50 px-3 py-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 items-start gap-3">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase leading-none tracking-[0.06em] text-[var(--color-primary)]">
            Chi tiết phiếu trả phòng
          </p>
          <p className="mt-1 text-[12px] text-[var(--color-on-surface-secondary)]">
            {description}
          </p>
        </div>
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

function PaymentSlipResultSection({ ticket }: { ticket: ReturnRoomTicket }) {
  const result = ticket.accountingResult;

  if (!result) {
    return null;
  }

  const finalAmountLabel =
    result.finalAmount > 0
      ? "Số tiền hoàn cho khách"
      : result.finalAmount < 0
        ? "Số tiền khách cần thanh toán thêm"
        : "Không phát sinh thanh toán";
  const finalAmountTone =
    result.finalAmount > 0
      ? "border-[var(--color-success)] bg-[var(--color-success-container)] text-[var(--color-success)]"
      : result.finalAmount < 0
        ? "border-[var(--color-error)] bg-[var(--color-error-container)] text-[var(--color-error)]"
        : "border-[var(--color-primary)] bg-[var(--color-primary-container)] text-[var(--color-primary)]";

  return (
    <DetailSection title="Phiếu thanh toán">
      <div className="grid gap-3">
        <div className={cx("rounded-[var(--radius-md)] border px-4 py-3", finalAmountTone)}>
          <p className="text-[11px] font-semibold uppercase tracking-[0.06em]">
            {finalAmountLabel}
          </p>
          <p className="mt-1 text-[28px] font-bold leading-none">
            {formatCurrency(Math.abs(result.finalAmount))}
          </p>
          {result.conclusion ? (
            <p className="mt-2 text-[12px] font-semibold">{result.conclusion}</p>
          ) : null}
        </div>

        <dl className="grid gap-x-4 sm:grid-cols-2">
          <MoneyField label="Mã phiếu thanh toán" value={ticket.reconciliation?.code ?? "Chưa lập"} />
          <MoneyField label="Trạng thái" value={ticket.reconciliation?.status ?? "Chưa cập nhật"} />
          <MoneyField label="Tiền cọc gốc" value={formatCurrency(result.depositAmount)} />
          <MoneyField label="Tỷ lệ hoàn" value={`${result.refundRate}%`} />
          <MoneyField label="Tiền hoàn cơ bản" value={formatCurrency(result.baseRefund)} tone="success" />
          <MoneyField label="Tổng khấu trừ" value={formatCurrency(result.totalDeductions)} tone="error" />
        </dl>

        {result.deductions.length > 0 ? (
          <div className="overflow-hidden rounded-[var(--radius-sm)] border border-[var(--color-border)]">
            <div className="grid grid-cols-[1fr_140px] bg-[var(--color-secondary)] px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.06em] text-[var(--color-on-secondary)]">
              <span>Khoản khấu trừ kế toán</span>
              <span className="text-right">Số tiền</span>
            </div>
            {result.deductions.map((deduction) => (
              <div
                key={deduction.id}
                className="grid grid-cols-[1fr_140px] border-t border-[var(--color-border)] px-3 py-2 text-[12px]"
              >
                <span>{deduction.description}</span>
                <span className="text-right font-semibold text-[var(--color-error)]">
                  {formatCurrency(deduction.amount)}
                </span>
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </DetailSection>
  );
}

function MoneyField({
  label,
  value,
  tone,
}: {
  label: string;
  value: ReactNode;
  tone?: "success" | "error";
}) {
  return (
    <div className="grid grid-cols-[128px_1fr] gap-3 border-b border-[var(--color-border)] py-2 text-[12px] last:border-b-0 sm:last:border-b sm:[&:nth-last-child(-n+2)]:border-b-0">
      <dt className="text-[var(--color-on-surface-secondary)]">{label}</dt>
      <dd
        className={cx(
          "min-w-0 text-right font-bold text-[var(--color-on-surface)]",
          tone === "success" && "text-[var(--color-success)]",
          tone === "error" && "text-[var(--color-error)]",
        )}
      >
        {value}
      </dd>
    </div>
  );
}

function getCustomerConfirmationLabel(ticket: ReturnRoomTicket) {
  if (ticket.customerConfirmation.status === "agreed") {
    return "Khách đồng ý";
  }

  if (ticket.customerConfirmation.status === "disagreed") {
    return ticket.customerConfirmation.disagreementReason
      ? `Không đồng ý · ${ticket.customerConfirmation.disagreementReason}`
      : "Không đồng ý";
  }

  return "Chưa";
}

function getRoomFinalizationLabel(ticket: ReturnRoomTicket) {
  if (ticket.roomFinalization.status === "available") {
    return "Trống";
  }

  if (ticket.roomFinalization.status === "maintenance") {
    return "Cần bảo trì";
  }

  return "Chưa cập nhật";
}

import {
  Check,
  ClipboardCheck,
  DoorOpen,
  RotateCcw,
  X,
} from "lucide-react";
import type { ReactNode } from "react";
import type { ReturnRoomTicket } from "@/lib/return-room-tickets/types";
import { getPrimaryAction, statusMeta } from "@/lib/return-room-tickets/status";
import {
  ActionButton,
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
        <DetailHeader
          title="Chưa chọn phiếu"
          description="Chọn một phiếu trong danh sách"
        />
        <div className="flex min-h-0 flex-1 items-center justify-center px-4 text-center text-[12px] text-[var(--color-on-surface-secondary)]">
          Chọn một phiếu trong danh sách để xem thông tin xử lý.
        </div>
      </section>
    );
  }

  const meta = statusMeta[ticket.status];
  const primaryAction = getPrimaryAction(ticket);
  const shouldCreateReconciliation = ticket.status === "pendingManagerReview";
  const shouldConfirmCustomer =
    ticket.status === "accountingResultReady" ||
    ticket.status === "waitingCustomerConfirmation";
  const shouldUpdateRoom =
    ticket.status === "customerConfirmed" ||
    ticket.status === "waitingDepositRefund" ||
    ticket.status === "waitingExtraPayment";
  const shouldRecheck = ticket.status === "needsRecheck";
  const primaryActions = (
    <>
      {shouldCreateReconciliation ? (
        <ActionButton
          icon={ClipboardCheck}
          variant="primary"
          onClick={onStartReconciliation}
        >
          Lập phiếu đối soát
        </ActionButton>
      ) : null}

      {shouldConfirmCustomer ? (
        <>
          <ActionButton icon={Check} variant="primary" onClick={onCustomerAgreed}>
            Khách đồng ý
          </ActionButton>
          <ActionButton icon={X} variant="danger" onClick={onCustomerDisagreed}>
            Không đồng ý
          </ActionButton>
        </>
      ) : null}

      {shouldUpdateRoom ? (
        <ActionButton icon={DoorOpen} variant="primary" onClick={onStartRoomUpdate}>
          Cập nhật phòng
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
        title="Chi tiết phiếu"
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
            <FieldRow
              label="Phiếu đối soát"
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
            <FieldRow
              label="Tình trạng lưu trú"
              value={ticket.contract.stayStatus}
            />
          </dl>
        </DetailSection>

        <DetailSection title="Phòng/Giường" defaultOpen={false}>
          <dl>
            <FieldRow label="Mã phòng" value={ticket.room.roomCode} />
            <FieldRow label="Mã giường" value={ticket.room.bedCode} />
            <FieldRow
              label="Trạng thái hiện tại"
              value={ticket.room.currentStatus}
            />
            <FieldRow
              label="Ngày trả thực tế"
              value={
                ticket.room.actualReturnDate
                  ? formatDate(ticket.room.actualReturnDate)
                  : "Chưa cập nhật"
              }
            />
          </dl>
        </DetailSection>

        {ticket.accountingResult ? (
          <DetailSection title="Kết quả đối soát">
            <dl>
              <FieldRow
                label="Tiền cọc gốc"
                value={formatCurrency(ticket.accountingResult.depositAmount)}
              />
              <FieldRow
                label="Tỷ lệ hoàn cọc"
                value={`${ticket.accountingResult.refundRate}%`}
              />
              <FieldRow
                label="Cọc hoàn cơ bản"
                value={formatCurrency(ticket.accountingResult.baseRefund)}
              />
              <FieldRow
                label="Tổng khấu trừ"
                value={formatCurrency(ticket.accountingResult.totalDeductions)}
              />
              <FieldRow
                label="Số tiền cuối cùng"
                value={formatCurrency(ticket.accountingResult.finalAmount)}
              />
              <FieldRow
                label="Kết luận"
                value={ticket.accountingResult.conclusion}
              />
            </dl>

            <div className="mt-3 overflow-hidden rounded-[var(--radius-sm)] border border-[var(--color-border)]">
              <div className="grid grid-cols-[1fr_120px] bg-[var(--color-secondary)] px-3 py-2 text-[11px] font-semibold uppercase leading-none tracking-[0.06em] text-[var(--color-on-secondary)]">
                <span>Khoản khấu trừ</span>
                <span className="text-right">Số tiền</span>
              </div>
              {ticket.accountingResult.deductions.length > 0 ? (
                ticket.accountingResult.deductions.map((deduction) => (
                  <div
                    key={deduction.id}
                    className="grid grid-cols-[1fr_120px] border-t border-[var(--color-border)] px-3 py-2 text-[12px]"
                  >
                    <span>{deduction.description}</span>
                    <span className="text-right font-medium">
                      {formatCurrency(deduction.amount)}
                    </span>
                  </div>
                ))
              ) : (
                <div className="border-t border-[var(--color-border)] px-3 py-2 text-[12px] text-[var(--color-on-surface-secondary)]">
                  Không có khoản khấu trừ.
                </div>
              )}
            </div>
          </DetailSection>
        ) : null}
      </div>

      <div className="flex shrink-0 flex-col gap-2 border-t border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-3 sm:flex-row sm:items-center sm:justify-end">

        <div className="flex flex-wrap justify-end gap-2">{primaryActions}</div>
      </div>
    </section>
  );
}

type DetailHeaderProps = {
  title: string;
  description: string;
  action?: ReactNode;
};

function DetailHeader({ title, description, action }: DetailHeaderProps) {
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

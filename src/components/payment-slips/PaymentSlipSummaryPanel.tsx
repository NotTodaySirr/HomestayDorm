import { Calculator, ExternalLink, FilePlus2 } from "lucide-react";
import Link from "next/link";
import {
  calculateBaseRefund,
  calculateTotalDeductions,
  getPaymentConclusion,
  getRefundPolicy,
} from "@/components/payment-slips/logic/calculation";
import { getSlipFinalAmount } from "@/components/payment-slips/logic/filters";
import type { PaymentSlip } from "@/lib/payment-slips/types";
import {
  ActionButton,
  cx,
  FieldRow,
  formatCurrency,
  StatusPill,
} from "./ui";

type PaymentSlipSummaryPanelProps = {
  slip: PaymentSlip | null;
};

export function PaymentSlipSummaryPanel({ slip }: PaymentSlipSummaryPanelProps) {
  if (!slip) {
    return (
      <section className="flex h-[500px] min-h-0 flex-col overflow-hidden rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] xl:h-full">
        <PanelHeader title="Chưa chọn phiếu" description="Chọn một phiếu trong danh sách" />
        <div className="flex min-h-0 flex-1 items-center justify-center px-4 text-center text-[12px] text-[var(--color-on-surface-secondary)]">
          Chọn một phiếu để xem nhanh kết quả tài chính và hành động kế toán.
        </div>
      </section>
    );
  }

  const baseRefund = calculateBaseRefund(
    slip.contract.depositAmount,
    slip.calculation.refundPolicy,
  );
  const totalDeductions = calculateTotalDeductions(slip.calculation);
  const finalAmount = getSlipFinalAmount(slip);
  const policy = getRefundPolicy(slip.calculation.refundPolicy);

  return (
    <section className="flex h-[500px] min-h-0 flex-col overflow-hidden rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] xl:h-full">
      <PanelHeader
        title="Tóm tắt tài chính"
        description={`${slip.code} · ${slip.contract.tenantName} · ${slip.contract.roomCode} / ${slip.contract.bedCode}`}
        action={<StatusPill status={slip.status} />}
      />

      <div className="min-h-0 flex-1 overflow-auto">
        <DetailBlock title="Thông tin hợp đồng">
          <dl>
            <FieldRow label="Mã hợp đồng" value={slip.contract.code} />
            <FieldRow label="Tiền cọc" value={formatCurrency(slip.contract.depositAmount)} />
            <FieldRow label="Lưu trú" value={slip.contract.stayDescription} />
            <FieldRow label="Khách xác nhận" value={slip.customerConfirmed ? "Đã xác nhận" : "Chưa xác nhận"} />
          </dl>
        </DetailBlock>

        <DetailBlock title="Kết quả quản lý">
          <dl>
            <FieldRow label="Vệ sinh" value={slip.managerInspection.hygieneStatus} />
            <FieldRow label="Tài sản" value={slip.managerInspection.assetStatus} />
            <FieldRow label="Bồi thường" value={formatCurrency(slip.managerInspection.estimatedCompensation)} />
            <FieldRow label="Ghi chú" value={slip.managerInspection.note} />
          </dl>
        </DetailBlock>

        <DetailBlock title="Tổng kết kế toán">
          <dl>
            <FieldRow label="Tỷ lệ hoàn" value={`${policy.rate}% · ${policy.label}`} />
            <FieldRow label="Cọc hoàn cơ bản" value={formatCurrency(baseRefund)} />
            <FieldRow label="Tổng khấu trừ" value={formatCurrency(totalDeductions)} />
            <FieldRow
              label="Số tiền cuối"
              value={
                <span
                  className={cx(
                    "font-semibold",
                    finalAmount < 0 && "text-[var(--color-error)]",
                    finalAmount > 0 && "text-[var(--color-success)]",
                  )}
                >
                  {finalAmount > 0 ? "+" : ""}
                  {formatCurrency(finalAmount)}
                </span>
              }
            />
            <FieldRow label="Kết luận" value={getPaymentConclusion(finalAmount)} />
          </dl>
          {finalAmount < 0 ? (
            <div className="mt-3 rounded-[var(--radius-sm)] border border-[var(--color-error)] bg-[var(--color-error-container)] px-3 py-2 text-[12px] font-medium text-[var(--color-error)]">
              Cần lập phiếu thanh toán thêm trước khi xác nhận đã nhận tiền.
            </div>
          ) : null}
        </DetailBlock>
      </div>

      <div className="flex shrink-0 flex-col gap-2 border-t border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-3 sm:flex-row sm:items-center sm:justify-end">
        {finalAmount < 0 ? (
          <ActionButton icon={FilePlus2} variant="danger" disabled={!slip.customerConfirmed}>
            Lập phiếu thu
          </ActionButton>
        ) : null}
        <Link
          href={`/dashboard/payment-slips/${slip.id}`}
          className="inline-flex min-h-8 items-center justify-center gap-2 rounded-[var(--radius-sm)] border border-[var(--color-primary)] bg-[var(--color-primary)] px-3 py-[7px] text-[12px] font-medium leading-none text-white transition-colors hover:bg-[var(--color-primary-light)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
        >
          <Calculator aria-hidden="true" className="h-4 w-4" />
          Xử lý chi tiết
          <ExternalLink aria-hidden="true" className="h-3.5 w-3.5" />
        </Link>
      </div>
    </section>
  );
}

function PanelHeader({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex shrink-0 flex-col gap-3 border-b border-[var(--color-border)] bg-slate-50 px-3 py-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <p className="text-[11px] font-semibold uppercase leading-none tracking-[0.06em] text-[var(--color-primary)]">
          {title}
        </p>
        <p className="mt-1 truncate text-[12px] text-[var(--color-on-surface-secondary)]">
          {description}
        </p>
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

function DetailBlock({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="border-b border-[var(--color-border)] px-3 py-3 last:border-b-0">
      <p className="mb-2 text-[11px] font-semibold uppercase leading-none tracking-[0.06em] text-[var(--color-on-secondary)]">
        {title}
      </p>
      {children}
    </div>
  );
}

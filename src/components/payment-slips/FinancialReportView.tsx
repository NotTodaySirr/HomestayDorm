import {
  calculateBaseRefund,
  calculateTotalDeductions,
} from "@/components/payment-slips/logic/calculation";
import { countPaymentSlips, getSlipFinalAmount } from "@/components/payment-slips/logic/filters";
import type { PaymentSlip } from "@/lib/payment-slips/types";
import { formatCurrency, StatCard, StatusPill } from "./ui";

type FinancialReportViewProps = {
  slips: PaymentSlip[];
};

export function FinancialReportView({ slips }: FinancialReportViewProps) {
  const stats = countPaymentSlips(slips);
  const totals = slips.reduce(
    (result, slip) => {
      const finalAmount = getSlipFinalAmount(slip);

      result.baseRefund += calculateBaseRefund(
        slip.contract.depositAmount,
        slip.calculation.refundPolicy,
      );
      result.deductions += calculateTotalDeductions(slip.calculation);

      if (finalAmount > 0) {
        result.refundPayable += finalAmount;
      }

      if (finalAmount < 0) {
        result.extraReceivable += Math.abs(finalAmount);
      }

      return result;
    },
    {
      baseRefund: 0,
      deductions: 0,
      refundPayable: 0,
      extraReceivable: 0,
    },
  );

  return (
    <div className="flex w-full flex-col gap-3 sm:gap-4 xl:h-full">
      <header className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-[20px] font-bold tracking-tight text-[var(--color-on-surface)]">
            Báo cáo tài chính
          </h1>
          <p className="mt-1 text-[12px] text-[var(--color-on-surface-secondary)]">
            Tổng hợp nhanh từ phiếu thanh toán trả phòng và hoàn cọc.
          </p>
        </div>
        <p className="text-[12px] font-medium text-[var(--color-on-surface-secondary)]">
          Trần Thị B | Kế toán
        </p>
      </header>

      <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Chờ xử lý" value={stats.pending} tone="warning" />
        <StatCard label="Chờ hoàn" value={stats.refund} tone="primary" />
        <StatCard label="Chờ thu nợ" value={stats.debt} tone="error" />
        <StatCard label="Hoàn tất" value={stats.completed} tone="success" />
      </section>

      <section className="grid grid-cols-1 gap-3 lg:grid-cols-4">
        <MoneyCard label="Cọc hoàn cơ bản" value={totals.baseRefund} />
        <MoneyCard label="Tổng khấu trừ" value={totals.deductions} />
        <MoneyCard label="Cần chi hoàn cọc" value={totals.refundPayable} tone="success" />
        <MoneyCard label="Cần thu thêm" value={totals.extraReceivable} tone="error" />
      </section>

      <section className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)]">
        <div className="shrink-0 border-b border-[var(--color-border)] bg-slate-50 px-3 py-3">
          <p className="text-[11px] font-semibold uppercase leading-none tracking-[0.06em] text-[var(--color-primary)]">
            Theo dõi dòng tiền theo phiếu
          </p>
        </div>
        <div className="min-h-0 flex-1 overflow-auto">
          <table className="w-full min-w-[820px] border-collapse text-left text-[12px]">
            <thead className="sticky top-0 z-[1] bg-[var(--color-secondary)] text-[11px] font-semibold uppercase leading-none tracking-[0.06em] text-[var(--color-on-secondary)]">
              <tr>
                <th className="w-[108px] px-3 py-2">Mã PTT</th>
                <th className="px-3 py-2">Khách hàng</th>
                <th className="w-[128px] px-3 py-2">Phòng</th>
                <th className="w-[150px] px-3 py-2 text-right">Số tiền cuối</th>
                <th className="w-[164px] px-3 py-2">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border)]">
              {slips.map((slip) => {
                const finalAmount = getSlipFinalAmount(slip);

                return (
                  <tr key={slip.id} className="hover:bg-[var(--color-secondary)]">
                    <td className="px-3 py-3 align-top font-mono text-[11px] font-semibold">
                      {slip.code}
                    </td>
                    <td className="px-3 py-3 align-top">
                      <p className="font-medium">{slip.contract.tenantName}</p>
                      <p className="mt-0.5 font-mono text-[11px] text-[var(--color-on-surface-secondary)]">
                        {slip.contract.code}
                      </p>
                    </td>
                    <td className="px-3 py-3 align-top">
                      {slip.contract.roomCode} / {slip.contract.bedCode}
                    </td>
                    <td
                      className={`px-3 py-3 text-right align-top font-semibold ${
                        finalAmount < 0
                          ? "text-[var(--color-error)]"
                          : "text-[var(--color-success)]"
                      }`}
                    >
                      {finalAmount > 0 ? "+" : ""}
                      {formatCurrency(finalAmount)}
                    </td>
                    <td className="px-3 py-3 align-top">
                      <StatusPill status={slip.status} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function MoneyCard({
  label,
  value,
  tone = "primary",
}: {
  label: string;
  value: number;
  tone?: "primary" | "success" | "error";
}) {
  const color =
    tone === "success"
      ? "text-[var(--color-success)]"
      : tone === "error"
        ? "text-[var(--color-error)]"
        : "text-[var(--color-primary)]";

  return (
    <article className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] p-3">
      <p className="text-[11px] font-semibold uppercase leading-none tracking-[0.06em] text-[var(--color-on-secondary)]">
        {label}
      </p>
      <p className={`mt-3 text-[18px] font-semibold leading-none ${color}`}>
        {formatCurrency(value)}
      </p>
    </article>
  );
}

import { Eye } from "lucide-react";
import Link from "next/link";
import {
  getSlipFinalAmount,
} from "@/components/payment-slips/logic/filters";
import type { PaymentQueue, PaymentSlip } from "@/lib/payment-slips/types";
import { cx, formatCurrency, StatusPill } from "./ui";
import { PaymentQueueTabs } from "./PaymentQueueTabs";

type PaymentSlipListPanelProps = {
  slips: PaymentSlip[];
  activeQueue: PaymentQueue;
  queueCounts: Record<PaymentQueue, number>;
  onQueueChange: (queue: PaymentQueue) => void;
};

export function PaymentSlipListPanel({
  slips,
  activeQueue,
  queueCounts,
  onQueueChange,
}: PaymentSlipListPanelProps) {
  return (
    <section className="flex h-[500px] min-h-0 flex-col overflow-hidden rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] xl:h-full">
      <div className="shrink-0 border-b border-[var(--color-border)] bg-slate-50 px-3 py-3">
        <div className="flex items-center justify-between">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase leading-none tracking-[0.06em] text-[var(--color-primary)]">
              Danh sách phiếu thanh toán
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2 rounded-full bg-[var(--color-surface)] px-3 py-1.5 text-[12px] font-semibold text-[var(--color-primary)]">
            <span className="text-[15px] leading-none">{slips.length}</span>
            <span>phiếu</span>
          </div>
        </div>
        <div className="mt-3">
          <PaymentQueueTabs
            activeQueue={activeQueue}
            counts={queueCounts}
            onQueueChange={onQueueChange}
          />
        </div>
      </div>

      {slips.length === 0 ? (
        <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-2 px-4 text-center">
          <p className="text-[13px] font-semibold text-[var(--color-on-surface)]">
            Không có phiếu phù hợp
          </p>
          <p className="max-w-[360px] text-[12px] text-[var(--color-on-surface-secondary)]">
            Thử đổi hàng đợi, từ khóa tìm kiếm hoặc trạng thái đang lọc.
          </p>
        </div>
      ) : (
        <div className="min-h-0 flex-1 overflow-auto">
          <table className="w-full min-w-[860px] border-collapse text-left text-[12px]">
            <thead className="sticky top-0 z-[1] bg-[var(--color-secondary)] text-[11px] font-semibold uppercase leading-none tracking-[0.06em] text-[var(--color-on-secondary)]">
              <tr>
                <th className="w-[108px] px-3 py-2">Mã PTT</th>
                <th className="px-3 py-2">Khách hàng</th>
                <th className="w-[120px] px-3 py-2">Phòng</th>
                <th className="w-[126px] px-3 py-2 text-right">Tiền cọc</th>
                <th className="w-[140px] px-3 py-2 text-right">Số tiền cuối</th>
                <th className="w-[156px] px-3 py-2">Trạng thái</th>
                <th className="w-[96px] px-3 py-2 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border)]">
              {slips.map((slip) => {
                const finalAmount = getSlipFinalAmount(slip);

                return (
                  <tr
                    key={slip.id}
                    className="transition-colors hover:bg-[var(--color-secondary)]"
                  >
                    <td className="px-3 py-3 align-top">
                      <p className="font-mono text-[11px] font-semibold text-[var(--color-on-surface)]">
                        {slip.code}
                      </p>
                      <p className="mt-0.5 font-mono text-[11px] text-[var(--color-on-surface-secondary)]">
                        {slip.returnTicketCode}
                      </p>
                    </td>
                    <td className="px-3 py-3 align-top">
                      <p className="font-medium text-[var(--color-on-surface)]">
                        {slip.contract.tenantName}
                      </p>
                      <p className="mt-0.5 font-mono text-[11px] text-[var(--color-on-surface-secondary)]">
                        {slip.contract.code}
                      </p>
                    </td>
                    <td className="px-3 py-3 align-top">
                      <p className="font-medium">{slip.contract.roomCode}</p>
                      <p className="mt-0.5 text-[var(--color-on-surface-secondary)]">
                        {slip.contract.bedCode}
                      </p>
                    </td>
                    <td className="px-3 py-3 text-right align-top font-medium">
                      {formatCurrency(slip.contract.depositAmount)}
                    </td>
                    <td
                      className={cx(
                        "px-3 py-3 text-right align-top font-semibold",
                        finalAmount < 0 && "text-[var(--color-error)]",
                        finalAmount > 0 && "text-[var(--color-success)]",
                      )}
                    >
                      {finalAmount > 0 ? "+" : ""}
                      {formatCurrency(finalAmount)}
                    </td>
                    <td className="px-3 py-3 align-top">
                      <StatusPill status={slip.status} />
                    </td>
                    <td className="px-3 py-3 text-right align-top">
                      <Link
                        href={`/dashboard/payment-slips/${slip.id}`}
                        className="inline-flex min-h-8 items-center justify-center gap-2 rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-[7px] text-[12px] font-medium leading-none text-[var(--color-on-surface)] transition-colors hover:bg-[var(--color-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                      >
                        <Eye aria-hidden="true" className="h-4 w-4" strokeWidth={2} />
                        Xem
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

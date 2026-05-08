"use client";

import type {
  PaymentQueue,
  PaymentSlip,
} from "@/lib/payment-slips/types";
import { PaymentSlipListPanel } from "./PaymentSlipListPanel";
import { PaymentSlipToolbar } from "./PaymentSlipToolbar";
import { usePaymentSlipsWorkspace } from "./hooks/usePaymentSlipsWorkspace";

type PaymentSlipsWorkspaceProps = {
  initialSlips: PaymentSlip[];
  initialQueue: PaymentQueue;
};

export function PaymentSlipsWorkspace({
  initialSlips,
  initialQueue,
}: PaymentSlipsWorkspaceProps) {
  const { state, actions } = usePaymentSlipsWorkspace(initialSlips, initialQueue);
  const { search, status, queue, queueCounts, visibleSlips } = state;
  const { setSearch, setStatus, setQueue } = actions;

  return (
    <div className="flex w-full flex-col gap-3 sm:gap-4 xl:h-full">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 flex-col gap-1">
          <h1 className="text-[20px] font-bold tracking-tight text-[var(--color-on-surface)]">
            Quản lý phiếu thanh toán
          </h1>
          <p className="text-[12px] text-[var(--color-on-surface-secondary)]">
            Trần Thị B | Kế toán
          </p>
        </div>

        <PaymentSlipToolbar
          search={search}
          status={status}
          onSearchChange={setSearch}
          onStatusChange={setStatus}
        />
      </header>

      <section className="flex flex-1 flex-col xl:min-h-0">
        <PaymentSlipListPanel
          slips={visibleSlips}
          activeQueue={queue}
          queueCounts={queueCounts}
          onQueueChange={setQueue}
        />
      </section>
    </div>
  );
}

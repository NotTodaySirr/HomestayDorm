import type { QueueKey } from "@/lib/return-room-tickets/types";
import { queueLabels } from "@/lib/return-room-tickets/status";
import { cx } from "./ui";

const queueOrder: QueueKey[] = [
  "pendingReview",
  "reconciling",
  "waitingCustomer",
  "needsRecheck",
  "completed",
  "all",
];

type QueueTabsProps = {
  activeQueue: QueueKey;
  counts: Record<QueueKey, number>;
  onQueueChange: (queue: QueueKey) => void;
};

export function QueueTabs({
  activeQueue,
  counts,
  onQueueChange,
}: QueueTabsProps) {
  return (
    <div
      className="flex flex-wrap gap-2"
      role="tablist"
      aria-label="Hàng đợi phiếu trả phòng"
    >
      {queueOrder.map((queue) => {
        const isActive = activeQueue === queue;

        return (
          <button
            key={queue}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onQueueChange(queue)}
            className={cx(
              "inline-flex min-h-8 items-center gap-2 rounded-[var(--radius-sm)] border px-3 py-[7px] text-[12px] leading-none transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]",
              isActive
                ? "border-[var(--color-primary)] bg-[var(--color-primary-container)] font-semibold text-[var(--color-primary)]"
                : "border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-on-surface-secondary)] hover:bg-[var(--color-secondary)] hover:text-[var(--color-primary)]",
            )}
          >
            <span>{queueLabels[queue]}</span>
            <span
              className={cx(
                "rounded-full px-1.5 py-[2px] text-[10px] font-semibold leading-none",
                isActive
                  ? "bg-[var(--color-primary)] text-white"
                  : "bg-[var(--color-secondary)] text-[var(--color-on-surface-secondary)]",
              )}
            >
              {counts[queue]}
            </span>
          </button>
        );
      })}
    </div>
  );
}

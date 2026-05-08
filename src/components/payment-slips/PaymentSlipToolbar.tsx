"use client";

import { Filter, Search } from "lucide-react";
import {
  paymentStatusLabels,
  paymentStatusOptions,
} from "@/components/payment-slips/logic/filters";
import type { PaymentSlipStatus } from "@/lib/payment-slips/types";
import { cx } from "./ui";

type PaymentSlipToolbarProps = {
  search: string;
  status: PaymentSlipStatus | "all";
  onSearchChange: (value: string) => void;
  onStatusChange: (status: PaymentSlipStatus | "all") => void;
};

export function PaymentSlipToolbar({
  search,
  status,
  onSearchChange,
  onStatusChange,
}: PaymentSlipToolbarProps) {
  const hasStatusFilter = status !== "all";

  return (
    <div className="relative flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-end">
      <label className="relative min-w-0 lg:w-[300px]">
        <span className="sr-only">Tìm nhanh</span>
        <Search
          aria-hidden="true"
          className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-on-secondary)]"
          strokeWidth={2}
        />
        <input
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Tìm mã phiếu, khách, hợp đồng..."
          className="h-8 w-full rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-surface)] py-[7px] pl-8 pr-3 text-[12px] outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary-container)]"
        />
      </label>

      <label className="sr-only" htmlFor="payment-slip-status">
        Trạng thái
      </label>
      <div
        className={cx(
          "inline-flex h-8 items-center gap-2 rounded-[var(--radius-sm)] border px-2.5",
          hasStatusFilter
            ? "border-[var(--color-primary)] bg-[var(--color-primary-container)]"
            : "border-[var(--color-border)] bg-[var(--color-surface)]",
        )}
      >
        <Filter
          aria-hidden="true"
          className={cx(
            "h-4 w-4",
            hasStatusFilter
              ? "text-[var(--color-primary)]"
              : "text-[var(--color-on-secondary)]",
          )}
        />
        <select
          id="payment-slip-status"
          value={status}
          onChange={(event) =>
            onStatusChange(event.target.value as PaymentSlipStatus | "all")
          }
          className="h-full bg-transparent text-[12px] outline-none"
        >
          {paymentStatusOptions.map((option) => (
            <option key={option} value={option}>
              {option === "all"
                ? "Tất cả trạng thái"
                : paymentStatusLabels[option]}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

"use client";

import { Search } from "lucide-react";
import type { SortKey } from "@/lib/return-room-tickets/types";

type TicketToolbarProps = {
  search: string;
  onSearchChange: (value: string) => void;
  // These are kept to avoid breaking the parent component's interface immediately, 
  // but they are no longer used in the UI as per user request.
  sort?: SortKey;
  onSortChange?: (value: SortKey) => void;
};

export function TicketToolbar({
  search,
  onSearchChange,
}: TicketToolbarProps) {
  return (
    <div className="relative flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-end">
      <label className="relative min-w-0 lg:w-[280px]">
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
    </div>
  );
}

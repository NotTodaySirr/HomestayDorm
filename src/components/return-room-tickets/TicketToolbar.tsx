"use client";

import { Filter, RotateCcw, Search } from "lucide-react";
import { useState } from "react";
import {
  emptyAdvancedFilters,
  hasAdvancedFilters,
} from "@/lib/return-room-tickets/filters";
import { statusMeta } from "@/lib/return-room-tickets/status";
import type {
  AdvancedFilterState,
  QueueKey,
  ReturnTicketStatus,
  SortKey,
} from "@/lib/return-room-tickets/types";
import { ActionButton, cx } from "./ui";

const sortOptions: Array<{ value: SortKey; label: string }> = [
  { value: "newest", label: "Mới nhất" },
  { value: "oldest", label: "Cũ nhất" },
  { value: "nearestReturn", label: "Ngày trả gần nhất" },
  { value: "urgentFirst", label: "Ưu tiên gấp" },
];

const statusOptions = Object.entries(statusMeta) as Array<
  [ReturnTicketStatus, (typeof statusMeta)[ReturnTicketStatus]]
>;

type TicketToolbarProps = {
  queue: QueueKey;
  search: string;
  sort: SortKey;
  advancedFilters: AdvancedFilterState;
  onSearchChange: (value: string) => void;
  onSortChange: (value: SortKey) => void;
  onAdvancedFiltersChange: (filters: AdvancedFilterState) => void;
};

export function TicketToolbar({
  queue,
  search,
  sort,
  advancedFilters,
  onSearchChange,
  onSortChange,
  onAdvancedFiltersChange,
}: TicketToolbarProps) {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [draftFilters, setDraftFilters] =
    useState<AdvancedFilterState>(advancedFilters);
  const hasFilters = hasAdvancedFilters(advancedFilters);

  function updateDraft<Key extends keyof AdvancedFilterState>(
    field: Key,
    value: AdvancedFilterState[Key],
  ) {
    setDraftFilters((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function toggleFilter() {
    if (!isFilterOpen) {
      setDraftFilters(advancedFilters);
    }

    setIsFilterOpen((current) => !current);
  }

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

      <div className="flex flex-wrap items-center gap-2">
        <ActionButton
          icon={Filter}
          onClick={toggleFilter}
          variant={hasFilters ? "primary" : "secondary"}
        >
          Bộ lọc
        </ActionButton>

        <label className="sr-only" htmlFor="return-ticket-sort">
          Sắp xếp
        </label>
        <select
          id="return-ticket-sort"
          value={sort}
          onChange={(event) => onSortChange(event.target.value as SortKey)}
          className="h-8 rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-surface)] px-2.5 text-[12px] outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary-container)]"
        >
          {sortOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {isFilterOpen ? (
        <div className="z-10 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] p-3 lg:absolute lg:right-0 lg:top-10 lg:w-[520px]">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <FilterInput
              label="Mã phiếu"
              value={draftFilters.ticketCode}
              onChange={(value) => updateDraft("ticketCode", value)}
            />
            <FilterInput
              label="Khách thuê"
              value={draftFilters.tenantName}
              onChange={(value) => updateDraft("tenantName", value)}
            />
            <FilterInput
              label="Mã hợp đồng"
              value={draftFilters.contractCode}
              onChange={(value) => updateDraft("contractCode", value)}
            />
            <FilterInput
              label="Phòng/Giường"
              value={draftFilters.roomOrBed}
              onChange={(value) => updateDraft("roomOrBed", value)}
            />
            <FilterInput
              label="Từ ngày"
              type="date"
              value={draftFilters.fromDate}
              onChange={(value) => updateDraft("fromDate", value)}
            />
            <FilterInput
              label="Đến ngày"
              type="date"
              value={draftFilters.toDate}
              onChange={(value) => updateDraft("toDate", value)}
            />

            {queue === "all" ? (
              <label className="flex flex-col gap-1.5 text-[12px]">
                <span className="font-semibold text-[var(--color-on-surface-secondary)]">
                  Trạng thái
                </span>
                <select
                  value={draftFilters.status}
                  onChange={(event) =>
                    updateDraft(
                      "status",
                      event.target.value as AdvancedFilterState["status"],
                    )
                  }
                  className="h-8 rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-surface)] px-2.5 outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary-container)]"
                >
                  <option value="all">Tất cả</option>
                  {statusOptions.map(([status, meta]) => (
                    <option key={status} value={status}>
                      {meta.label}
                    </option>
                  ))}
                </select>
              </label>
            ) : null}
          </div>

          <div className="mt-3 flex flex-wrap justify-end gap-2 border-t border-[var(--color-border)] pt-3">
            {hasAdvancedFilters(draftFilters) ? (
              <ActionButton
                icon={RotateCcw}
                onClick={() => setDraftFilters(emptyAdvancedFilters)}
              >
                Đặt lại
              </ActionButton>
            ) : null}
            <ActionButton
              variant="primary"
              onClick={() => {
                onAdvancedFiltersChange(draftFilters);
                setIsFilterOpen(false);
              }}
            >
              Áp dụng
            </ActionButton>
          </div>
        </div>
      ) : null}
    </div>
  );
}

type FilterInputProps = {
  label: string;
  value: string;
  type?: "text" | "date";
  onChange: (value: string) => void;
};

function FilterInput({
  label,
  value,
  type = "text",
  onChange,
}: FilterInputProps) {
  return (
    <label className="flex flex-col gap-1.5 text-[12px]">
      <span className="font-semibold text-[var(--color-on-surface-secondary)]">
        {label}
      </span>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={cx(
          "h-8 rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-surface)] px-2.5 outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary-container)]",
          type === "date" && "font-mono text-[11px]",
        )}
      />
    </label>
  );
}

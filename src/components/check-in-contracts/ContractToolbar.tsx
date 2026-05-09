import { Search } from "lucide-react";
import { statusFilterOptions } from "@/lib/check-in-contracts/status";
import type { CheckInContractFilterState } from "@/lib/check-in-contracts/types";

type ContractToolbarProps = {
  search: string;
  status: CheckInContractFilterState["status"];
  onSearchChange: (search: string) => void;
  onStatusChange: (status: CheckInContractFilterState["status"]) => void;
};

export function ContractToolbar({
  search,
  status,
  onSearchChange,
  onStatusChange,
}: ContractToolbarProps) {
  return (
    <div className="grid w-full gap-2 sm:max-w-[620px] sm:grid-cols-[1fr_190px]">
      <label className="relative min-w-0">
        <span className="sr-only">Tìm kiếm hồ sơ</span>
        <Search
          aria-hidden="true"
          className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-on-secondary)]"
          strokeWidth={2}
        />
        <input
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Tìm mã phiếu, tên khách, SĐT, phòng..."
          className="h-8 w-full rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-surface)] py-[7px] pl-8 pr-2.5 text-[12px] outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary-container)]"
        />
      </label>

      <select
        value={status}
        onChange={(event) =>
          onStatusChange(event.target.value as CheckInContractFilterState["status"])
        }
        className="h-8 rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-surface)] px-2.5 text-[12px] outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary-container)]"
      >
        {statusFilterOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

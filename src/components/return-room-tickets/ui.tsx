import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { statusMeta, type StatusTone } from "@/lib/return-room-tickets/status";
import type { ReturnTicketStatus } from "@/lib/return-room-tickets/types";

export function cx(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(" ");
}

const toneClasses: Record<StatusTone, string> = {
  success: "bg-[var(--color-success-container)] text-[var(--color-success)]",
  error: "bg-[var(--color-error-container)] text-[var(--color-error)]",
  warning: "bg-[var(--color-warning-container)] text-[var(--color-warning)]",
  primary: "bg-[var(--color-primary-container)] text-[var(--color-primary)]",
  muted: "bg-[var(--color-secondary)] text-[var(--color-on-surface-secondary)]",
};

export function formatDate(value?: string | null) {
  if (!value) {
    return "Chưa xác định";
  }

  const normalizedValue = value.includes("T") ? value : `${value}T00:00:00`;
  const date = new Date(normalizedValue);

  if (Number.isNaN(date.getTime())) {
    return "Chưa xác định";
  }

  return new Intl.DateTimeFormat("vi-VN").format(date);
}

export function formatCurrency(value: number) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value);
}

type StatusPillProps = {
  status: ReturnTicketStatus;
  compact?: boolean;
};

export function StatusPill({ status, compact = false }: StatusPillProps) {
  const meta = statusMeta[status];

  return (
    <span
      className={cx(
        "inline-flex max-w-full items-center rounded-full px-[9px] py-[3px] text-[12px] leading-none",
        toneClasses[meta.tone],
        compact && "text-[11px]",
      )}
      title={meta.label}
    >
      <span className="truncate">{compact ? meta.shortLabel : meta.label}</span>
    </span>
  );
}

type PriorityFlagProps = {
  priority: "normal" | "urgent" | "overdue";
};

export function PriorityFlag({ priority }: PriorityFlagProps) {
  if (priority === "normal") {
    return null;
  }

  const label = priority === "overdue" ? "Quá hạn" : "Gấp";

  return (
    <span className="inline-flex rounded-full bg-[var(--color-error-container)] px-[7px] py-[2px] text-[10px] font-semibold leading-none text-[var(--color-error)]">
      {label}
    </span>
  );
}

export function HotkeyHint({ children }: { children: ReactNode }) {
  return (
    <span className="rounded-[var(--radius-xs)] bg-[var(--color-secondary)] px-1.5 py-[2px] font-mono text-[11px] leading-none text-[var(--color-on-surface-secondary)]">
      {children}
    </span>
  );
}

type ActionButtonProps = {
  children: ReactNode;
  icon?: LucideIcon;
  variant?: "primary" | "secondary" | "danger";
  type?: "button" | "submit";
  disabled?: boolean;
  onClick?: () => void;
};

export function ActionButton({
  children,
  icon: Icon,
  variant = "secondary",
  type = "button",
  disabled,
  onClick,
}: ActionButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={cx(
        "inline-flex min-h-8 items-center justify-center gap-2 rounded-[var(--radius-sm)] border px-3 py-[7px] text-[12px] font-medium leading-none transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] disabled:cursor-not-allowed disabled:opacity-55",
        variant === "primary" &&
          "border-[var(--color-primary)] bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-light)]",
        variant === "secondary" &&
          "border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-on-surface)] hover:bg-[var(--color-secondary)]",
        variant === "danger" &&
          "border-[var(--color-error)] bg-[var(--color-error-container)] text-[var(--color-error)] hover:border-[var(--color-error)]",
      )}
    >
      {Icon ? <Icon aria-hidden="true" className="h-4 w-4" strokeWidth={2} /> : null}
      <span className="truncate">{children}</span>
    </button>
  );
}

type PanelHeaderProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
};

export function PanelHeader({
  eyebrow,
  title,
  description,
  action,
}: PanelHeaderProps) {
  return (
    <div className="flex min-h-[54px] flex-col gap-2 border-b border-[var(--color-border)] px-3 py-2 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        {eyebrow ? (
          <p className="text-[11px] font-semibold uppercase leading-none tracking-[0.06em] text-[var(--color-on-secondary)]">
            {eyebrow}
          </p>
        ) : null}
        <h2 className="mt-1 truncate text-[13px] font-semibold leading-[1.4] text-[var(--color-on-surface)]">
          {title}
        </h2>
        {description ? (
          <p className="mt-0.5 truncate text-[12px] text-[var(--color-on-surface-secondary)]">
            {description}
          </p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

type FieldRowProps = {
  label: string;
  value: ReactNode;
};

export function FieldRow({ label, value }: FieldRowProps) {
  return (
    <div className="grid grid-cols-[128px_1fr] gap-3 py-1.5 text-[12px]">
      <dt className="text-[var(--color-on-surface-secondary)]">{label}</dt>
      <dd className="min-w-0 font-medium text-[var(--color-on-surface)]">
        {value}
      </dd>
    </div>
  );
}

type DetailSectionProps = {
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
};

export function DetailSection({
  title,
  children,
  defaultOpen = true,
}: DetailSectionProps) {
  return (
    <details
      className="group border-b border-[var(--color-border)] last:border-b-0"
      open={defaultOpen}
    >
      <summary className="cursor-pointer list-none border-l-[3px] border-[var(--color-primary)] bg-[#FAFBFF] px-3 pb-2 pt-2.5 text-[12px] font-semibold uppercase leading-[1.2] tracking-[0.05em] text-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[var(--color-primary)]">
        <span>{title}</span>
      </summary>
      <div className="px-3 pb-3">{children}</div>
    </details>
  );
}

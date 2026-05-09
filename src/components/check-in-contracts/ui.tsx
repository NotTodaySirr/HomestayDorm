import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import {
  statusMeta,
  type StatusTone,
} from "@/lib/check-in-contracts/status";
import type { CheckInContractStatus } from "@/lib/check-in-contracts/types";

export function cx(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(" ");
}

const toneClasses: Record<StatusTone, string> = {
  success: "bg-[var(--color-success-container)] text-[var(--color-success)]",
  error: "bg-[var(--color-error-container)] text-[var(--color-error)]",
  warning: "bg-[var(--color-warning-container)] text-[var(--color-warning)]",
  muted: "bg-[var(--color-secondary)] text-[var(--color-on-surface-secondary)]",
};

export function formatDate(value: string) {
  const date = new Date(value);
  if (isNaN(date.getTime())) {
    return "N/A";
  }
  return new Intl.DateTimeFormat("vi-VN").format(date);
}

export function formatCurrency(value: number | string) {
  const numericValue = typeof value === "string" ? Number(value) : value;

  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(Number.isFinite(numericValue) ? numericValue : 0);
}

export function StatusPill({ status }: { status: CheckInContractStatus }) {
  const meta = statusMeta[status];

  return (
    <span
      className={cx(
        "inline-flex max-w-full items-center rounded-full px-[9px] py-[3px] text-[11px] font-medium leading-none",
        toneClasses[meta.tone],
      )}
      title={meta.label}
    >
      <span className="truncate">{meta.label}</span>
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

export function DetailSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="border-b border-[var(--color-border)] last:border-b-0">
      <h3 className="border-l-[3px] border-[var(--color-primary)] bg-[#FAFBFF] px-3 pb-2 pt-2.5 text-[12px] font-semibold uppercase leading-[1.2] tracking-[0.05em] text-[var(--color-primary)]">
        {title}
      </h3>
      <div className="px-3 pb-3 pt-2">{children}</div>
    </section>
  );
}

export function FieldRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="grid grid-cols-[116px_1fr] gap-3 py-1.5 text-[12px]">
      <dt className="text-[var(--color-on-surface-secondary)]">{label}</dt>
      <dd className="min-w-0 font-medium text-[var(--color-on-surface)]">
        {value}
      </dd>
    </div>
  );
}

export function FormField({
  label,
  children,
  required,
}: {
  label: string;
  children: ReactNode;
  required?: boolean;
}) {
  return (
    <label className="flex min-w-0 flex-col gap-1.5 text-[12px]">
      <span className="font-semibold text-[var(--color-on-surface-secondary)]">
        {label}
        {required ? <span className="text-[var(--color-error)]"> *</span> : null}
      </span>
      {children}
    </label>
  );
}

export const inputClasses =
  "h-8 w-full rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-surface)] px-2.5 text-[12px] outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary-container)]";

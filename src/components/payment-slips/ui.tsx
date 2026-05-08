import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import type { PaymentSlipStatus } from "@/lib/payment-slips/types";
import { paymentStatusLabels } from "@/components/payment-slips/logic/filters";

export function cx(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(" ");
}

export function formatCurrency(value: number) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value);
}

export function StatCard({
  label,
  value,
  tone = "primary",
}: {
  label: string;
  value: number;
  tone?: "primary" | "warning" | "success" | "error";
}) {
  const toneClass = {
    primary: "bg-[var(--color-primary-container)] text-[var(--color-primary)]",
    warning: "bg-[var(--color-warning-container)] text-[var(--color-warning)]",
    success: "bg-[var(--color-success-container)] text-[var(--color-success)]",
    error: "bg-[var(--color-error-container)] text-[var(--color-error)]",
  }[tone];

  return (
    <article className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] p-3">
      <p className="text-[11px] font-semibold uppercase leading-none tracking-[0.06em] text-[var(--color-on-secondary)]">
        {label}
      </p>
      <p className={cx("mt-3 inline-flex rounded-full px-3 py-1 text-[20px] font-semibold leading-none", toneClass)}>
        {value}
      </p>
    </article>
  );
}

export function StatusPill({ status }: { status: PaymentSlipStatus }) {
  const tone =
    status === "completedRefund" || status === "completedExtraPayment" || status === "noTransaction"
      ? "bg-[var(--color-success-container)] text-[var(--color-success)]"
      : status === "waitingExtraPayment" || status === "needReview" || status === "partiallyPaid"
        ? "bg-[var(--color-error-container)] text-[var(--color-error)]"
        : status === "waitingDepositRefund" || status === "pendingAccounting"
          ? "bg-[var(--color-warning-container)] text-[var(--color-warning)]"
          : "bg-[var(--color-primary-container)] text-[var(--color-primary)]";

  return (
    <span className={cx("inline-flex max-w-full rounded-full px-[9px] py-[3px] text-[12px] leading-none", tone)}>
      <span className="truncate">{paymentStatusLabels[status]}</span>
    </span>
  );
}

export function Section({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)]">
      <div className="border-b border-[var(--color-border)] bg-[#FAFBFF] px-3 py-2">
        <h2 className="text-[12px] font-semibold uppercase leading-[1.2] tracking-[0.05em] text-[var(--color-primary)]">
          {title}
        </h2>
      </div>
      <div className="p-3">{children}</div>
    </section>
  );
}

export function FieldRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="grid grid-cols-[150px_1fr] gap-3 py-1.5 text-[12px]">
      <dt className="text-[var(--color-on-surface-secondary)]">{label}</dt>
      <dd className="min-w-0 font-medium text-[var(--color-on-surface)]">{value}</dd>
    </div>
  );
}

export function ActionButton({
  children,
  icon: Icon,
  variant = "secondary",
  type = "button",
  disabled,
  onClick,
}: {
  children: ReactNode;
  icon?: LucideIcon;
  variant?: "primary" | "secondary" | "danger";
  type?: "button" | "submit";
  disabled?: boolean;
  onClick?: () => void;
}) {
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

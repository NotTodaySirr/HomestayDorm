import { LoaderCircle } from "lucide-react";
import type { InputHTMLAttributes, ReactNode } from "react";

type AuthPanelProps = {
  title: string;
  titleId: string;
  description: string;
  children: ReactNode;
  footer: ReactNode;
};

export function AuthPanel({
  title,
  titleId,
  description,
  children,
  footer,
}: AuthPanelProps) {
  return (
    <section
      aria-labelledby={titleId}
      className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] p-4 sm:p-5"
    >
      <div className="mx-auto mb-5 w-full max-w-[360px] rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-primary-container)] px-4 py-3 text-center sm:max-w-[390px]">
        <h1
          id={titleId}
          className="text-[24px] font-semibold leading-[1.25] text-[var(--color-primary)] sm:text-[26px]"
        >
          {title}
        </h1>
        <p className="mt-1 text-[12px] leading-[1.5] text-[var(--color-on-surface-secondary)]">
          {description}
        </p>
      </div>

      {children}

      <div className="mt-5 border-t border-[var(--color-border)] pt-4 text-center text-[12px] leading-[1.5] text-[var(--color-on-surface-secondary)]">
        {footer}
      </div>
    </section>
  );
}

type AuthFieldProps = Omit<InputHTMLAttributes<HTMLInputElement>, "className"> & {
  label: string;
  errors?: string[];
};

export function AuthField({ id, label, errors, ...inputProps }: AuthFieldProps) {
  const errorId = id ? `${id}-error` : undefined;
  const fieldErrors = errors ?? [];
  const hasError = fieldErrors.length > 0;

  return (
    <div className="space-y-1.5">
      <label
        htmlFor={id}
        className="block text-[11px] font-semibold uppercase leading-none tracking-[0.06em] text-[var(--color-on-surface-secondary)]"
      >
        {label}
      </label>
      <input
        id={id}
        aria-invalid={hasError || undefined}
        aria-describedby={hasError ? errorId : undefined}
        className={`w-full rounded-[var(--radius-sm)] border bg-[var(--color-surface)] px-2.5 py-[7px] text-[13px] leading-[1.5] text-[var(--color-on-surface)] outline-none transition-colors placeholder:text-[var(--color-on-secondary)] focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary-container)] ${
          hasError
            ? "border-[var(--color-error)]"
            : "border-[var(--color-border)] hover:border-[var(--color-secondary-darker)]"
        }`}
        {...inputProps}
      />
      {hasError ? (
        <div
          id={errorId}
          className="rounded-[var(--radius-sm)] border border-[var(--color-error)] bg-[var(--color-error-container)] px-2.5 py-1.5 text-[12px] leading-[1.5] text-[var(--color-error)]"
        >
          {fieldErrors.length === 1 ? (
            fieldErrors[0]
          ) : (
            <ul className="list-disc space-y-1 pl-4">
              {fieldErrors.map((error) => (
                <li key={error}>{error}</li>
              ))}
            </ul>
          )}
        </div>
      ) : null}
    </div>
  );
}

export function AuthFormAlert({ message }: { message?: string | null }) {
  if (!message) {
    return null;
  }

  return (
    <div
      role="alert"
      className="rounded-[var(--radius-sm)] border border-[var(--color-error)] bg-[var(--color-error-container)] px-3 py-2 text-[12px] leading-[1.5] text-[var(--color-error)]"
    >
      {message}
    </div>
  );
}

type AuthSubmitButtonProps = {
  isPending: boolean;
  label: string;
  pendingLabel: string;
};

export function AuthSubmitButton({
  isPending,
  label,
  pendingLabel,
}: AuthSubmitButtonProps) {
  return (
    <button
      disabled={isPending}
      type="submit"
      className="inline-flex min-h-[34px] w-full items-center justify-center gap-2 rounded-[var(--radius-sm)] bg-[var(--color-primary)] px-3.5 py-[7px] text-[12px] font-semibold leading-[1.5] text-white transition-colors hover:bg-[var(--color-primary-light)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70"
    >
      {isPending ? (
        <>
          <LoaderCircle
            aria-hidden="true"
            className="h-4 w-4 animate-spin"
            strokeWidth={2}
          />
          {pendingLabel}
        </>
      ) : (
        label
      )}
    </button>
  );
}

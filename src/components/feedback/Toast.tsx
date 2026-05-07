type ToastVariant = "success" | "error" | "warning" | "info";

type ToastProps = {
  message: string;
  variant?: ToastVariant;
};

const variantClasses: Record<ToastVariant, string> = {
  success: "bg-[var(--color-primary)] text-white",
  error: "bg-[var(--color-error)] text-white",
  warning: "bg-[var(--color-warning)] text-white",
  info: "bg-[var(--color-primary-container)] text-[var(--color-primary)]",
};

export function Toast({ message, variant = "success" }: ToastProps) {
  return (
    <div
      role="status"
      className={`rounded-[var(--radius-md)] px-3 py-2 text-[12px] leading-[1.5] ${variantClasses[variant]}`}
    >
      {message}
    </div>
  );
}

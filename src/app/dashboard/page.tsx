import { cookies } from "next/headers";
import { decrypt } from "@/lib/session";

const stats = [
  { label: "Phòng trống", value: "18", status: "Khả dụng" },
  { label: "Đang ở", value: "42", status: "Ổn định" },
  { label: "Chờ nhận phòng", value: "7", status: "Hôm nay" },
  { label: "Cần xử lý", value: "3", status: "Ưu tiên" },
];

const tasks = [
  "Xác nhận đặt phòng lúc 14:00",
  "Kiểm tra thanh toán còn trễ",
  "Cập nhật tình trạng phòng P09",
];

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("session")?.value;
  const session = await decrypt(sessionCookie);

  return (
    <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-3 sm:gap-4">
      <section className="flex flex-col gap-2 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] p-3 sm:flex-row sm:items-center sm:justify-between sm:p-4">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase leading-none tracking-[0.06em] text-[var(--color-on-secondary)]">
            Bảng điều khiển
          </p>
          <h1 className="mt-2 text-[15px] font-semibold leading-[1.3] text-[var(--color-on-surface)]">
            Tổng quan vận hành HomestayDorm
          </h1>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-[12px] text-[var(--color-on-surface-secondary)]">
          <span className="rounded-full bg-[var(--color-success-container)] px-[9px] py-[3px] text-[var(--color-success)]">
            Hệ thống sẵn sàng
          </span>
          <span className="font-mono text-[11px]">
            ID: {session?.userId ?? "Không xác định"}
          </span>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <article
            key={stat.label}
            className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] p-3"
          >
            <p className="text-[11px] font-semibold uppercase leading-none tracking-[0.06em] text-[var(--color-on-secondary)]">
              {stat.label}
            </p>
            <div className="mt-3 flex items-end justify-between gap-2">
              <p className="text-[24px] font-semibold leading-none text-[var(--color-on-surface)]">
                {stat.value}
              </p>
              <span className="rounded-full bg-[var(--color-success-container)] px-[9px] py-[3px] text-[12px] text-[var(--color-success)]">
                {stat.status}
              </span>
            </div>
          </article>
        ))}
      </section>

      <section className="grid grid-cols-1 gap-3 lg:grid-cols-[1.3fr_1fr]">
        <article className="min-h-[320px] rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)]">
          <div className="border-b border-[var(--color-border)] px-3 py-2">
            <h2 className="text-[13px] font-semibold leading-[1.4]">
              Lịch phòng hôm nay
            </h2>
          </div>
          <div className="grid grid-cols-7 gap-2 p-3 text-center text-[12px]">
            {Array.from({ length: 21 }, (_, index) => {
              const isBlocked = index === 5 || index === 13;
              const isSelected = index === 8;

              return (
                <div
                  key={index}
                  className={`flex aspect-[1.35] items-center justify-center rounded-[var(--radius-md)] border text-[12px] font-semibold ${
                    isBlocked
                      ? "border-transparent bg-[var(--color-error-container)] text-[var(--color-error)]"
                      : "border-transparent bg-[var(--color-success-container)] text-[var(--color-success)]"
                  } ${
                    isSelected
                      ? "border-[2.5px] border-[var(--color-primary)]"
                      : ""
                  }`}
                >
                  P{String(index + 1).padStart(2, "0")}
                </div>
              );
            })}
          </div>
        </article>

        <article className="min-h-[320px] rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)]">
          <div className="border-b border-[var(--color-border)] px-3 py-2">
            <h2 className="text-[13px] font-semibold leading-[1.4]">
              Việc cần xử lý
            </h2>
          </div>
          <div className="divide-y divide-[var(--color-border)]">
            {tasks.map((task, index) => (
              <div
                key={task}
                className="flex items-center justify-between gap-3 px-3 py-3 text-[13px]"
              >
                <span className="min-w-0 truncate text-[var(--color-on-surface)]">
                  {task}
                </span>
                <span
                  className={`shrink-0 rounded-full px-[9px] py-[3px] text-[12px] ${
                    index === 1
                      ? "bg-[var(--color-warning-container)] text-[var(--color-warning)]"
                      : "bg-[var(--color-primary-container)] text-[var(--color-primary)]"
                  }`}
                >
                  F{index + 2}
                </span>
              </div>
            ))}
          </div>
        </article>
      </section>
    </div>
  );
}

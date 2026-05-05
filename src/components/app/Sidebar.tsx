"use client";

import {
  ChartNoAxesColumnIncreasing,
  Clock3,
  FileText,
  Grid2X2,
  Monitor,
  ShieldCheck,
  UserPlus,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

type NavigationItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  badge?: number;
  activePaths?: string[];
};

type NavigationSection = {
  title: string;
  items: NavigationItem[];
};

const navigationSections: NavigationSection[] = [
  {
    title: "PHÒNG",
    items: [
      {
        label: "Lưới phòng",
        href: "/dashboard/rooms",
        icon: Grid2X2,
        activePaths: ["/dashboard"],
      },
      {
        label: "Đối soát",
        href: "/dashboard/reconciliation",
        icon: ShieldCheck,
        badge: 2,
      },
    ],
  },
  {
    title: "ĐĂNG KÝ",
    items: [
      {
        label: "Tiếp nhận mới",
        href: "/dashboard/checkins/new",
        icon: UserPlus,
      },
      {
        label: "Đăng ký chi tiết",
        href: "/dashboard/registrations",
        icon: FileText,
      },
      {
        label: "Thu cọc / In biên nhận",
        href: "/dashboard/deposits",
        icon: Monitor,
      },
    ],
  },
  {
    title: "BÁO CÁO",
    items: [
      {
        label: "Doanh thu",
        href: "/dashboard/reports/revenue",
        icon: ChartNoAxesColumnIncreasing,
      },
      {
        label: "Lịch sử giao dịch",
        href: "/dashboard/reports/transactions",
        icon: Clock3,
      },
    ],
  },
];

function isActivePath(pathname: string, item: NavigationItem) {
  if (item.activePaths?.includes(pathname)) {
    return true;
  }

  return pathname === item.href || pathname.startsWith(`${item.href}/`);
}

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-[var(--sidebar-width)] shrink-0 border-r border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-on-surface-secondary)]">
      <nav className="py-2" aria-label="Điều hướng chính">
        {navigationSections.map((section) => (
          <div key={section.title} className="pb-2">
            <div className="px-3 pb-1 pt-2.5 text-[10px] font-semibold uppercase leading-none tracking-[0.08em] text-[var(--color-on-secondary)]">
              {section.title}
            </div>

            <div>
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = isActivePath(pathname, item);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    aria-current={isActive ? "page" : undefined}
                    className={`flex min-h-9 items-center gap-[9px] border-l-[3px] px-3.5 py-2 text-[12px] transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[var(--color-primary)] ${
                      isActive
                        ? "border-[var(--color-primary)] bg-[var(--color-primary-container)] font-medium text-[var(--color-primary)]"
                        : "border-transparent text-[var(--color-on-surface-secondary)] hover:bg-[var(--color-primary-container)] hover:text-[var(--color-primary)]"
                    }`}
                    title={item.label}
                  >
                    <Icon
                      aria-hidden="true"
                      className={`h-[18px] w-[18px] shrink-0 ${
                        isActive ? "opacity-100" : "opacity-70"
                      }`}
                      strokeWidth={2}
                    />
                    <span className="min-w-0 flex-1 truncate">
                      {item.label}
                    </span>
                    {item.badge ? (
                      <span className="ml-auto rounded-[8px] bg-[var(--color-error-container)] px-1.5 py-px text-[10px] font-semibold leading-[1.4] text-[var(--color-error)]">
                        {item.badge}
                      </span>
                    ) : null}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>
    </aside>
  );
}

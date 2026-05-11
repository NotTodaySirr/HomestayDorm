"use client";

import {
  ChartNoAxesColumnIncreasing,
  Clock3,
  FileSignature,
  FileText,
  LogOut,
  Monitor,
  ReceiptText,
  UserPlus,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { logout } from "@/actions/auth";

type NavigationItem = {
  label: string;
  href?: string;
  icon: LucideIcon;
  badge?: number;
  activePaths?: string[];
  disabled?: boolean;
  excludePaths?: string[];
  query?: Record<string, string>;
  action?: "logout";
  roles?: string[];
};

type NavigationSection = {
  title: string;
  items: NavigationItem[];
  roles?: string[];
};

const navigationSections: NavigationSection[] = [
  {
    title: "TỔNG QUAN",
    items: [
    ],
  },
  {
    title: "ĐĂNG KÝ & HỢP ĐỒNG",
    roles: ["USER", "ACCOUNTANT", "ADMIN"], // Tất cả các quyền đều xem được đăng ký
    items: [
      {
        label: "Tiếp nhận mới",
        href: "/dashboard/registrations/new",
        icon: UserPlus,
        roles: ["USER"], // Chỉ Sale mới cần tạo mới nhanh
      },
      {
        label: "Phiếu đăng ký",
        href: "/dashboard/registrations",
        icon: FileText,
        excludePaths: ["/dashboard/registrations/new"],
      },
      {
        label: "Lịch xem phòng",
        href: "/dashboard/appointments",
        icon: Clock3,
        roles: ["USER", "ADMIN"],
      },
      {
        label: "Tạo phiếu cọc",
        href: "/dashboard/deposits/new",
        icon: UserPlus,
        roles: ["USER"], // Sale tạo cọc
      },
      {
        label: "Quản lý hợp đồng",
        href: "/dashboard/check-in-contracts",
        icon: FileSignature,
      },
    ],
  },
  {
    title: "KẾ TOÁN & THANH TOÁN",
    roles: ["ACCOUNTANT", "ADMIN"], // Kế toán & Quản lý
    items: [
      {
        label: "Quản lý phiếu cọc",
        href: "/dashboard/deposits",
        icon: FileText,
        excludePaths: ["/dashboard/deposits/new"],
      },
      {
        label: "Quản lý phiếu thanh toán",
        href: "/dashboard/payment-slips",
        icon: ReceiptText,
      },
      {
        label: "Thu tiền thuê phòng",
        icon: ReceiptText,
        disabled: true,
      },
    ],
  },
  {
    title: "QUẢN LÝ TRẢ PHÒNG & BÀN GIAO",
    roles: ["ADMIN"], // Quản lý
    items: [
      {
        label: "Quản lý phiếu trả phòng",
        href: "/dashboard/return-room-tickets",
        icon: FileText,
      },
      {
        label: "Biên bản bàn giao",
        icon: FileText,
        disabled: true,
      },
      {
        label: "Cập nhật phòng/giường",
        icon: Monitor,
        disabled: true,
      },
    ],
  },
];

function buildHref(item: NavigationItem) {
  if (!item.href) {
    return undefined;
  }

  if (!item.query) {
    return item.href;
  }

  const params = new URLSearchParams(item.query);
  return `${item.href}?${params.toString()}`;
}

function isActivePath(
  pathname: string,
  currentQueue: string | null,
  item: NavigationItem,
) {
  if (!item.href) {
    return false;
  }

  if (item.excludePaths?.some((path) => pathname === path || pathname.startsWith(`${path}/`))) {
    return false;
  }

  if (item.activePaths?.includes(pathname)) {
    return true;
  }

  const matchesPath = pathname === item.href || pathname.startsWith(`${item.href}/`);

  if (!matchesPath) {
    return false;
  }

  if (item.query?.queue) {
    return currentQueue === item.query.queue;
  }

  return item.href !== "/dashboard/payment-slips" || !currentQueue;
}

const roleLabels: Record<string, string> = {
  ADMIN: "Quan ly",
  ACCOUNTANT: "Ke toan",
  USER: "Sale",
};

export function Sidebar({
  userName = "Nguoi dung",
  userRole = "USER",
}: {
  userName?: string;
  userRole?: string;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentQueue = searchParams.get("queue");

  const filteredSections = navigationSections
    .filter((section) => !section.roles || section.roles.includes(userRole))
    .map((section) => ({
      ...section,
      items: section.items.filter((item) => !item.roles || item.roles.includes(userRole)),
    }))
    .filter((section) => section.items.length > 0);

  return (
    <aside className="flex h-[calc(100dvh-var(--topbar-height))] w-[var(--sidebar-width)] shrink-0 flex-col border-r border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-on-surface-secondary)]">
      <div className="shrink-0 border-b border-[var(--color-border)] px-3.5 py-3">
        <p className="truncate text-[13px] font-semibold leading-5 text-[var(--color-on-surface)]">
          {userName}
        </p>
        <p className="truncate text-[11px] font-medium uppercase leading-4 tracking-[0.05em] text-[var(--color-on-secondary)]">
          {roleLabels[userRole] ?? userRole} / {userRole}
        </p>
      </div>
      <nav className="min-h-0 flex-1 overflow-y-auto py-2" aria-label="Điều hướng chính">
        {filteredSections.map((section) => (
          <div key={section.title} className="pb-2">
            <div className="px-3 pb-1 pt-2.5 text-[10px] font-semibold uppercase leading-none tracking-[0.08em] text-[var(--color-on-secondary)]">
              {section.title}
            </div>

            <div>
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = isActivePath(pathname, currentQueue, item);
                const itemClasses = `flex min-h-9 w-full items-center gap-[9px] border-l-[3px] px-3.5 py-2 text-left text-[12px] transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[var(--color-primary)] ${isActive
                  ? "border-[var(--color-primary)] bg-[var(--color-primary-container)] font-medium text-[var(--color-primary)]"
                  : "border-transparent text-[var(--color-on-surface-secondary)] hover:bg-[var(--color-primary-container)] hover:text-[var(--color-primary)]"
                  } ${item.disabled
                    ? "cursor-not-allowed opacity-55 hover:bg-transparent hover:text-[var(--color-on-surface-secondary)]"
                    : ""
                  }`;
                const content = (
                  <>
                    <Icon
                      aria-hidden="true"
                      className={`h-[18px] w-[18px] shrink-0 ${isActive ? "opacity-100" : "opacity-70"}`}
                      strokeWidth={2}
                    />
                    <span className="min-w-0 flex-1 truncate">{item.label}</span>
                    {item.badge ? (
                      <span className="ml-auto rounded-[8px] bg-[var(--color-error-container)] px-1.5 py-px text-[10px] font-semibold leading-[1.4] text-[var(--color-error)]">
                        {item.badge}
                      </span>
                    ) : null}
                  </>
                );

                if (item.action === "logout") {
                  return (
                    <form key={item.label} action={logout}>
                      <button type="submit" className={itemClasses} title={item.label}>
                        {content}
                      </button>
                    </form>
                  );
                }

                const href = buildHref(item);

                if (!href || item.disabled) {
                  return (
                    <span
                      key={item.label}
                      aria-disabled="true"
                      className={itemClasses}
                      title={item.label}
                    >
                      {content}
                    </span>
                  );
                }

                return (
                  <Link
                    key={`${href}-${item.label}`}
                    href={href}
                    aria-current={isActive ? "page" : undefined}
                    className={itemClasses}
                    title={item.label}
                  >
                    {content}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="shrink-0 border-t border-[var(--color-border)] py-2">
        <form action={logout}>
          <button
            type="submit"
            className="flex min-h-9 w-full items-center gap-[9px] border-l-[3px] border-transparent px-3.5 py-2 text-left text-[12px] text-[var(--color-on-surface-secondary)] transition-colors duration-150 hover:bg-[var(--color-primary-container)] hover:text-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[var(--color-primary)]"
            title="Đăng xuất"
          >
            <LogOut
              aria-hidden="true"
              className="h-[18px] w-[18px] shrink-0 opacity-70"
              strokeWidth={2}
            />
            <span className="min-w-0 flex-1 truncate">Đăng xuất</span>
          </button>
        </form>
      </div>
    </aside>
  );
}


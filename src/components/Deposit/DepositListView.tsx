"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  BedDouble,
  CheckCircle2,
  Clock3,
  ImageIcon,
  Loader2,
  Plus,
  ReceiptText,
  Search,
  UploadCloud,
  UserRound,
  WalletCards,
  XCircle,
} from "lucide-react";
import { cancelDeposit, confirmDeposit, markDepositPaid } from "@/actions/deposit";

type Payment = {
  id: string;
  paymentType: string;
  amount: number;
  paymentMethod: string | null;
  paymentTime: string | null;
  status: string;
  transactionId: string | null;
  note: string | null;
  proofUrl: string | null;
  createdAt: string;
};

type DepositWithRelations = {
  id: string;
  depositAmount: number;
  paymentDeadline: string;
  depositedAt: string | null;
  confirmedAt: string | null;
  status: string;
  cancelReason: string | null;
  createdAt: string;
  registration: {
    customerName: string;
    phoneNumber: string;
    email: string | null;
    cccd: string | null;
    gender: string | null;
    rentalType: string | null;
    headcount: number | null;
    preferredArea: string | null;
  };
  details: {
    id: string;
    bed: {
      position: string;
      price: number;
      room: {
        name: string;
        roomType?: string | null;
        gender?: string | null;
      };
    };
  }[];
  payments: Payment[];
};

type Props = {
  initialDeposits: DepositWithRelations[];
  initialSelectedDepositId?: string;
};

const statusMap: Record<string, { label: string; cls: string }> = {
  PENDING: { label: "Chờ thanh toán", cls: "bg-warning-container text-warning" },
  PAID: { label: "Chờ xác nhận", cls: "bg-[#e0f2fe] text-[#0369a1]" },
  CONFIRMED: { label: "Đã xác nhận", cls: "bg-success-container text-success" },
  CANCELLED: { label: "Đã hủy", cls: "bg-error-container text-error" },
  EXPIRED: { label: "Đã hết hạn", cls: "bg-secondary text-on-surface-secondary" },
};

const genderLabels: Record<string, string> = {
  m: "Nam",
  f: "Nữ",
  all: "Tất cả",
};

const rentalTypeLabels: Record<string, string> = {
  nguyen_can: "Nguyên căn",
  o_ghep: "Ở ghép",
};

const paymentMethodLabels: Record<string, string> = {
  CASH: "Tiền mặt",
  TRANSFER: "Chuyển khoản",
};

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function getDepositCode(deposit: Pick<DepositWithRelations, "id">) {
  return deposit.id.slice(0, 8).toUpperCase();
}

function formatCurrency(value: number) {
  return `${value.toLocaleString("vi-VN")}đ`;
}

function formatDate(value: string | null) {
  if (!value) return "Chưa cập nhật";
  return new Date(value).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getLatestDepositPayment(deposit: DepositWithRelations) {
  return [...deposit.payments]
    .filter((payment) => payment.paymentType === "DEPOSIT")
    .sort((a, b) => {
      const aTime = new Date(a.paymentTime ?? a.createdAt).getTime();
      const bTime = new Date(b.paymentTime ?? b.createdAt).getTime();
      return bTime - aTime;
    })[0];
}

function getBedLabel(detail: DepositWithRelations["details"][number]) {
  return `P.${detail.bed.room.name} - ${detail.bed.position}`;
}

function getRoomSummary(deposit: DepositWithRelations) {
  const labels = deposit.details.map(getBedLabel);
  if (labels.length === 0) return "Chưa có vị trí";
  if (labels.length <= 2) return labels.join(", ");
  return `${labels.slice(0, 2).join(", ")} +${labels.length - 2}`;
}

function StatusBadge({ status }: { status: string }) {
  const meta = statusMap[status] ?? { label: status, cls: "bg-secondary text-on-surface-secondary" };

  return (
    <span className={cx("inline-flex rounded-full px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.06em]", meta.cls)}>
      {meta.label}
    </span>
  );
}

function Countdown({ deadline }: { deadline: string }) {
  const [now, setNow] = React.useState<number | null>(null);

  React.useEffect(() => {
    setNow(Date.now());
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  if (now === null) return <span className="font-semibold text-warning">Đang tính...</span>;

  const diff = new Date(deadline).getTime() - now;
  if (diff <= 0) return <span className="font-semibold text-error">Đã hết hạn</span>;

  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);
  return <span className="font-mono font-semibold text-warning">{h}h {m}m {s}s</span>;
}

function PayModal({ depositId, onClose }: { depositId: string; onClose: () => void }) {
  const [isPending, startTransition] = useTransition();
  const [payMethod, setPayMethod] = useState("");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (
    event: React.ChangeEvent<HTMLInputElement> | React.DragEvent<HTMLDivElement>,
    isDrop = false,
  ) => {
    let file: File | undefined;

    if (isDrop) {
      event.preventDefault();
      setIsDragging(false);
      file = (event as React.DragEvent<HTMLDivElement>).dataTransfer.files?.[0];
    } else {
      file = (event as React.ChangeEvent<HTMLInputElement>).target.files?.[0];
    }

    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onloadend = () => setPreviewUrl(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (formData: FormData) => {
    if (payMethod === "TRANSFER" && !previewUrl) {
      alert("Vui lòng tải lên ảnh minh chứng chuyển khoản.");
      return;
    }

    startTransition(async () => {
      await markDepositPaid(depositId, formData);
      onClose();
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 font-['Segoe_UI']">
      <form action={handleSubmit} className="w-full max-w-sm rounded-[8px] border border-border bg-surface">
        <div className="rounded-t-[8px] border-b border-border bg-secondary p-4">
          <h3 className="text-[13px] font-semibold uppercase tracking-wide">Xác nhận thanh toán cọc</h3>
        </div>

        <div className="space-y-3 p-4">
          <label className="block">
            <span className="mb-1 block text-[11px] font-semibold text-on-surface-secondary">Phương thức thanh toán</span>
            <select
              name="paymentMethod"
              required
              disabled={isPending}
              value={payMethod}
              onChange={(event) => setPayMethod(event.target.value)}
              className="w-full rounded-[5px] border border-border bg-surface px-3 py-2 text-[13px] focus:border-primary focus:outline-none disabled:opacity-50"
            >
              <option value="">Chọn...</option>
              <option value="CASH">Tiền mặt</option>
              <option value="TRANSFER">Chuyển khoản</option>
            </select>
          </label>

          {payMethod === "TRANSFER" ? (
            <>
              <label className="block">
                <span className="mb-1 block text-[11px] font-semibold text-on-surface-secondary">Mã giao dịch</span>
                <input
                  name="transactionId"
                  required
                  disabled={isPending}
                  className="w-full rounded-[5px] border border-border bg-surface px-3 py-2 text-[13px] focus:border-primary focus:outline-none disabled:opacity-50"
                  placeholder="VD: FT24050812345"
                />
              </label>

              <div>
                <span className="mb-1 block text-[11px] font-semibold text-on-surface-secondary">Ảnh minh chứng</span>
                <input type="hidden" name="proofUrl" value={previewUrl || ""} />
                <div
                  className={cx(
                    "relative cursor-pointer overflow-hidden rounded-[8px] border-2 border-dashed p-4 text-center transition-colors",
                    isDragging ? "border-primary bg-primary-container/30" : "border-border hover:bg-secondary/50",
                    previewUrl ? "border-primary/30 p-1" : "",
                  )}
                  onDragOver={(event) => {
                    event.preventDefault();
                    setIsDragging(true);
                  }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={(event) => handleFileChange(event, true)}
                >
                  <input
                    type="file"
                    accept="image/*"
                    className="absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0"
                    onChange={(event) => handleFileChange(event)}
                    disabled={isPending}
                  />
                  {previewUrl ? (
                    <div className="relative h-32 w-full overflow-hidden rounded-[6px] bg-secondary">
                      <img src={previewUrl} alt="Minh chứng thanh toán" className="h-full w-full object-contain" />
                    </div>
                  ) : (
                    <div className="py-4">
                      <UploadCloud className="mx-auto mb-2 h-9 w-9 text-on-surface-secondary" strokeWidth={1.8} />
                      <p className="text-[12px] font-semibold text-on-surface">Kéo thả ảnh vào đây</p>
                      <p className="mt-1 text-[11px] text-on-surface-secondary">hoặc bấm để tải lên PNG/JPG</p>
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : null}

          <label className="block">
            <span className="mb-1 block text-[11px] font-semibold text-on-surface-secondary">Ghi chú</span>
            <textarea
              name="note"
              rows={2}
              disabled={isPending}
              className="w-full resize-none rounded-[5px] border border-border bg-surface px-3 py-2 text-[13px] focus:border-primary focus:outline-none disabled:opacity-50"
              placeholder="Ghi chú thêm về thanh toán..."
            />
          </label>
        </div>

        <div className="flex justify-end gap-2 border-t border-border p-4">
          <button type="button" onClick={onClose} disabled={isPending} className="rounded-[5px] border border-border px-3 py-2 text-[12px] font-semibold hover:bg-secondary disabled:opacity-50">
            Đóng
          </button>
          <button type="submit" disabled={isPending} className="inline-flex items-center gap-1 rounded-[5px] bg-primary px-3 py-2 text-[12px] font-semibold text-white hover:bg-primary-light disabled:opacity-50">
            {isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <ReceiptText className="h-3.5 w-3.5" />}
            {isPending ? "Đang xử lý..." : "Xác nhận đã thu tiền"}
          </button>
        </div>
      </form>
    </div>
  );
}

function ConfirmModal({ depositId, onClose }: { depositId: string; onClose: () => void }) {
  const [isPending, startTransition] = useTransition();

  const handleConfirm = () => {
    startTransition(async () => {
      await confirmDeposit(depositId);
      onClose();
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 font-['Segoe_UI']">
      <div className="w-full max-w-sm rounded-[8px] border border-border bg-surface">
        <div className="rounded-t-[8px] border-b border-border bg-secondary p-4">
          <h3 className="text-[13px] font-semibold uppercase tracking-wide">Quản lý xác nhận cọc</h3>
        </div>
        <div className="p-4">
          <p className="text-[13px] text-on-surface-secondary">
            Xác nhận khoản tiền cọc hợp lệ và giữ chỗ chính thức cho khách hàng.
          </p>
        </div>
        <div className="flex justify-end gap-2 border-t border-border p-4">
          <button onClick={onClose} disabled={isPending} className="rounded-[5px] border border-border px-3 py-2 text-[12px] font-semibold hover:bg-secondary disabled:opacity-50">
            Đóng
          </button>
          <button onClick={handleConfirm} disabled={isPending} className="inline-flex items-center gap-1 rounded-[5px] bg-success px-3 py-2 text-[12px] font-semibold text-white hover:opacity-90 disabled:opacity-50">
            {isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
            {isPending ? "Đang xử lý..." : "Xác nhận cọc"}
          </button>
        </div>
      </div>
    </div>
  );
}

function CancelModal({ depositId, onClose }: { depositId: string; onClose: () => void }) {
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (formData: FormData) => {
    startTransition(async () => {
      await cancelDeposit(depositId, formData);
      onClose();
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 font-['Segoe_UI']">
      <form action={handleSubmit} className="w-full max-w-sm rounded-[8px] border border-border bg-surface">
        <div className="rounded-t-[8px] border-b border-border bg-secondary p-4">
          <h3 className="text-[13px] font-semibold uppercase tracking-wide text-error">Hủy phiếu đặt cọc</h3>
        </div>
        <div className="p-4">
          <label className="block">
            <span className="mb-1 block text-[11px] font-semibold text-on-surface-secondary">Lý do hủy</span>
            <textarea
              name="reason"
              required
              rows={3}
              disabled={isPending}
              className="w-full resize-none rounded-[5px] border border-border bg-surface px-3 py-2 text-[13px] focus:border-primary focus:outline-none disabled:opacity-50"
              placeholder="Nhập lý do hủy phiếu cọc..."
            />
          </label>
        </div>
        <div className="flex justify-end gap-2 border-t border-border p-4">
          <button type="button" onClick={onClose} disabled={isPending} className="rounded-[5px] border border-border px-3 py-2 text-[12px] font-semibold hover:bg-secondary disabled:opacity-50">
            Đóng
          </button>
          <button type="submit" disabled={isPending} className="inline-flex items-center gap-1 rounded-[5px] bg-error px-3 py-2 text-[12px] font-semibold text-white hover:opacity-90 disabled:opacity-50">
            {isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <XCircle className="h-3.5 w-3.5" />}
            {isPending ? "Đang xử lý..." : "Xác nhận hủy"}
          </button>
        </div>
      </form>
    </div>
  );
}

export const DepositListView: React.FC<Props> = ({ initialDeposits, initialSelectedDepositId }) => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [selectedDepositId, setSelectedDepositId] = useState(
    initialSelectedDepositId ?? initialDeposits[0]?.id ?? "",
  );
  const [payModalId, setPayModalId] = useState<string | null>(null);
  const [confirmModalId, setConfirmModalId] = useState<string | null>(null);
  const [cancelModalId, setCancelModalId] = useState<string | null>(null);

  React.useEffect(() => {
    if (initialSelectedDepositId) {
      setSelectedDepositId(initialSelectedDepositId);
      return;
    }

    const firstDepositId = initialDeposits[0]?.id;
    if (firstDepositId) {
      setSelectedDepositId(firstDepositId);
      router.replace(`/dashboard/deposits/${firstDepositId}`, { scroll: false });
    }
  }, [initialDeposits, initialSelectedDepositId, router]);

  const normalizedQuery = searchQuery.trim().toLowerCase();
  const filteredDeposits = initialDeposits.filter((deposit) => {
    const code = getDepositCode(deposit).toLowerCase();
    const searchable = [
      code,
      deposit.id.toLowerCase(),
      deposit.registration.customerName.toLowerCase(),
      deposit.registration.phoneNumber,
      getRoomSummary(deposit).toLowerCase(),
    ].join(" ");
    const matchesSearch = !normalizedQuery || searchable.includes(normalizedQuery);
    const matchesStatus = !statusFilter || deposit.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const selectedDeposit =
    filteredDeposits.find((deposit) => deposit.id === selectedDepositId) ?? filteredDeposits[0] ?? null;

  React.useEffect(() => {
    if (filteredDeposits.length === 0 || !selectedDepositId) return;
    if (filteredDeposits.some((deposit) => deposit.id === selectedDepositId)) return;

    const nextDepositId = filteredDeposits[0].id;
    setSelectedDepositId(nextDepositId);
    router.replace(`/dashboard/deposits/${nextDepositId}`, { scroll: false });
  }, [filteredDeposits, router, selectedDepositId]);

  const handleSelectDeposit = (depositId: string) => {
    if (depositId === selectedDepositId) return;

    setSelectedDepositId(depositId);
    router.push(`/dashboard/deposits/${depositId}`, { scroll: false });
  };

  return (
    <div className="flex h-[calc(100dvh-var(--topbar-height)-24px)] min-h-0 flex-col gap-3 overflow-hidden bg-secondary p-4 font-['Segoe_UI'] text-on-surface sm:h-[calc(100dvh-var(--topbar-height)-32px)]">
      <header className="flex shrink-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-[20px] font-bold tracking-tight">Phiếu đặt cọc</h1>
          <p className="text-[12px] text-on-surface-secondary">
            Theo dõi thanh toán, minh chứng và trạng thái xác nhận cọc.
          </p>
        </div>
        <Link
          href="/dashboard/deposits/new"
          className="inline-flex min-h-9 items-center justify-center gap-2 rounded-[5px] bg-primary px-3 py-2 text-[12px] font-semibold text-white transition-colors hover:bg-primary-light"
        >
          <Plus className="h-4 w-4" />
          Lập phiếu cọc mới
        </Link>
      </header>

      <div className="grid min-h-0 flex-1 grid-cols-1 grid-rows-[minmax(220px,40%)_minmax(0,1fr)] gap-3 overflow-hidden xl:grid-cols-[360px_minmax(0,1fr)] xl:grid-rows-1">
        <aside className="flex min-h-0 flex-col overflow-hidden rounded-[8px] border border-border bg-surface">
          <div className="shrink-0 border-b border-border bg-secondary px-3 py-3">
            <div className="flex items-center justify-between gap-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-primary">Danh sách phiếu</p>
              <span className="rounded-full bg-surface px-3 py-1 text-[12px] font-semibold text-primary">
                {filteredDeposits.length} phiếu
              </span>
            </div>

            <div className="mt-3 space-y-2">
              <label className="relative block">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-on-surface-secondary" />
                <input
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  className="w-full rounded-[5px] border border-border bg-surface py-2 pl-9 pr-3 text-[13px] focus:border-primary focus:outline-none"
                  placeholder="Tìm tên, SĐT, mã phiếu..."
                />
              </label>
              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
                className="w-full rounded-[5px] border border-border bg-surface px-3 py-2 text-[13px] focus:border-primary focus:outline-none"
              >
                <option value="">Tất cả trạng thái</option>
                <option value="PENDING">Chờ thanh toán</option>
                <option value="PAID">Chờ xác nhận</option>
                <option value="CONFIRMED">Đã xác nhận</option>
                <option value="CANCELLED">Đã hủy</option>
                <option value="EXPIRED">Đã hết hạn</option>
              </select>
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-auto p-2">
            {filteredDeposits.length === 0 ? (
              <div className="flex h-full min-h-48 flex-col items-center justify-center px-4 text-center">
                <p className="text-[13px] font-semibold">Không tìm thấy phiếu đặt cọc phù hợp</p>
                <p className="mt-1 text-[12px] text-on-surface-secondary">Thử đổi từ khóa hoặc trạng thái đang lọc.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredDeposits.map((deposit) => {
                  const isSelected = selectedDeposit?.id === deposit.id;
                  const latestPayment = getLatestDepositPayment(deposit);

                  return (
                    <button
                      key={deposit.id}
                      type="button"
                      onClick={() => handleSelectDeposit(deposit.id)}
                      className={cx(
                        "w-full rounded-[8px] border p-3 text-left transition-colors",
                        isSelected
                          ? "border-primary bg-primary-container"
                          : "border-border bg-surface hover:border-primary hover:bg-secondary",
                      )}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="truncate text-[13px] font-semibold">{deposit.registration.customerName}</p>
                          <p className="mt-0.5 text-[11px] text-on-surface-secondary">SĐT: {deposit.registration.phoneNumber}</p>
                        </div>
                        <StatusBadge status={deposit.status} />
                      </div>
                      <div className="mt-3 grid grid-cols-2 gap-2 text-[11px]">
                        <div>
                          <p className="text-on-surface-secondary">Mã phiếu</p>
                          <p className="font-mono font-semibold text-primary">{getDepositCode(deposit)}</p>
                        </div>
                        <div>
                          <p className="text-on-surface-secondary">Tiền cọc</p>
                          <p className="font-semibold">{formatCurrency(deposit.depositAmount)}</p>
                        </div>
                      </div>
                      <p className="mt-2 truncate text-[11px] text-on-surface-secondary">{getRoomSummary(deposit)}</p>
                      {latestPayment?.proofUrl ? (
                        <p className="mt-2 inline-flex items-center gap-1 text-[11px] font-medium text-success">
                          <ImageIcon className="h-3.5 w-3.5" />
                          Có minh chứng
                        </p>
                      ) : null}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </aside>

        <DepositDetailPanel
          deposit={selectedDeposit}
          onPay={(id) => setPayModalId(id)}
          onConfirm={(id) => setConfirmModalId(id)}
          onCancel={(id) => setCancelModalId(id)}
        />
      </div>

      {payModalId ? <PayModal depositId={payModalId} onClose={() => setPayModalId(null)} /> : null}
      {confirmModalId ? <ConfirmModal depositId={confirmModalId} onClose={() => setConfirmModalId(null)} /> : null}
      {cancelModalId ? <CancelModal depositId={cancelModalId} onClose={() => setCancelModalId(null)} /> : null}
    </div>
  );
};

function DepositDetailPanel({
  deposit,
  onPay,
  onConfirm,
  onCancel,
}: {
  deposit: DepositWithRelations | null;
  onPay: (id: string) => void;
  onConfirm: (id: string) => void;
  onCancel: (id: string) => void;
}) {
  if (!deposit) {
    return (
      <section className="flex min-h-0 flex-col items-center justify-center overflow-hidden rounded-[8px] border border-border bg-surface px-6 text-center">
        <ReceiptText className="mb-3 h-10 w-10 text-on-surface-secondary" strokeWidth={1.6} />
        <p className="text-[14px] font-semibold">Chọn một phiếu đặt cọc để xem chi tiết</p>
        <p className="mt-1 max-w-[360px] text-[12px] text-on-surface-secondary">
          Thông tin khách thuê, giường đã chọn, thanh toán và hành động xử lý sẽ hiển thị tại đây.
        </p>
      </section>
    );
  }

  const latestPayment = getLatestDepositPayment(deposit);

  return (
    <section className="flex min-h-0 min-w-0 flex-col overflow-hidden rounded-[8px] border border-border bg-surface">
      <div className="flex shrink-0 flex-col gap-3 border-b border-border bg-[#FAFBFF] px-4 py-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-[18px] font-bold">Phiếu {getDepositCode(deposit)}</h2>
            <StatusBadge status={deposit.status} />
          </div>
          <p className="mt-1 text-[12px] text-on-surface-secondary">
            {deposit.registration.customerName} · {deposit.registration.phoneNumber}
          </p>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-auto p-4">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="space-y-4">
            <Section title="Thông tin khách thuê" icon={UserRound}>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Field label="Họ và tên" value={deposit.registration.customerName} />
                <Field label="Số điện thoại" value={deposit.registration.phoneNumber} />
                <Field label="CCCD / Hộ chiếu" value={deposit.registration.cccd || "Chưa cập nhật"} />
                <Field label="Email" value={deposit.registration.email || "Chưa cập nhật"} />
                <Field label="Giới tính" value={deposit.registration.gender ? genderLabels[deposit.registration.gender] ?? deposit.registration.gender : "Chưa cập nhật"} />
                <Field label="Hình thức thuê" value={deposit.registration.rentalType ? rentalTypeLabels[deposit.registration.rentalType] ?? deposit.registration.rentalType : "Chưa cập nhật"} />
              </div>
            </Section>

            <Section title="Danh sách vị trí" icon={BedDouble}>
              <div className="overflow-x-auto rounded-[8px] border border-border">
                <table className="w-full min-w-[640px] border-collapse text-left text-[12px]">
                  <thead className="bg-secondary text-[11px] font-semibold uppercase tracking-[0.06em] text-on-surface-secondary">
                    <tr>
                      <th className="px-3 py-2">Vị trí</th>
                      <th className="px-3 py-2">Phòng</th>
                      <th className="px-3 py-2 text-right">Giá/tháng</th>
                      <th className="px-3 py-2 text-right">Cọc 2 tháng</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {deposit.details.map((detail) => (
                      <tr key={detail.id}>
                        <td className="px-3 py-2 font-semibold">{detail.bed.position}</td>
                        <td className="px-3 py-2">P.{detail.bed.room.name}</td>
                        <td className="px-3 py-2 text-right">{formatCurrency(detail.bed.price)}</td>
                        <td className="px-3 py-2 text-right font-semibold text-primary">{formatCurrency(detail.bed.price * 2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Section>

            <PaymentProofPanel deposit={deposit} payment={latestPayment} />
          </div>

          <div className="space-y-4">
            <Section title="Thành tiền" icon={WalletCards}>
              <div className="space-y-3 text-[13px]">
                <SummaryRow label="Số vị trí" value={`${deposit.details.length} giường`} />
                <SummaryRow label="Tổng tiền cọc" value={formatCurrency(deposit.depositAmount)} strong />
                <SummaryRow label="Tạo lúc" value={formatDate(deposit.createdAt)} />
                <SummaryRow
                  label="Hạn thanh toán"
                  value={deposit.status === "PENDING" ? <Countdown deadline={deposit.paymentDeadline} /> : formatDate(deposit.paymentDeadline)}
                />
                <SummaryRow label="Đã thanh toán" value={formatDate(deposit.depositedAt)} />
                <SummaryRow label="Đã xác nhận" value={formatDate(deposit.confirmedAt)} />
              </div>
            </Section>

            <Section title="Trạng thái xử lý" icon={Clock3}>
              <div className="space-y-3">
                <StatusBadge status={deposit.status} />
                {deposit.cancelReason ? (
                  <div className="rounded-[8px] bg-error-container p-3 text-[12px] text-error">
                    <p className="font-semibold">Lý do hủy</p>
                    <p className="mt-1">{deposit.cancelReason}</p>
                  </div>
                ) : null}
                <ActionButtons deposit={deposit} onPay={onPay} onConfirm={onConfirm} onCancel={onCancel} stacked />
              </div>
            </Section>
          </div>
        </div>
      </div>
    </section>
  );
}

function PaymentProofPanel({
  deposit,
  payment,
}: {
  deposit: DepositWithRelations;
  payment: Payment | undefined;
}) {
  const canUpload = deposit.status === "PENDING";
  const isFinal = deposit.status === "CANCELLED" || deposit.status === "EXPIRED";

  return (
    <Section title="Chứng từ thanh toán" icon={ImageIcon}>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[260px_minmax(0,1fr)]">
        <div className="flex min-h-40 items-center justify-center overflow-hidden rounded-[8px] border border-dashed border-border bg-secondary">
          {payment?.proofUrl ? (
            <img src={payment.proofUrl} alt="Minh chứng thanh toán" className="h-full max-h-64 w-full object-contain" />
          ) : (
            <div className="px-4 text-center">
              <ImageIcon className="mx-auto mb-2 h-8 w-8 text-on-surface-secondary" strokeWidth={1.6} />
              <p className="text-[12px] font-semibold text-on-surface">Chưa có minh chứng</p>
              <p className="mt-1 text-[11px] text-on-surface-secondary">
                {canUpload ? "Tải lên khi ghi nhận thanh toán." : "Không có ảnh chứng từ cho phiếu này."}
              </p>
            </div>
          )}
        </div>

        <div className="space-y-3">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field label="Phương thức" value={payment?.paymentMethod ? paymentMethodLabels[payment.paymentMethod] ?? payment.paymentMethod : "Chưa thanh toán"} />
            <Field label="Mã giao dịch" value={payment?.transactionId || "Không có"} />
            <Field label="Thời điểm thanh toán" value={formatDate(payment?.paymentTime ?? null)} />
            <Field label="Số tiền" value={payment ? formatCurrency(payment.amount) : "Chưa ghi nhận"} />
          </div>

          {payment?.note ? (
            <div className="rounded-[8px] bg-secondary p-3 text-[12px]">
              <p className="font-semibold text-on-surface-secondary">Ghi chú</p>
              <p className="mt-1">{payment.note}</p>
            </div>
          ) : null}

          {isFinal ? (
            <p className="text-[12px] text-on-surface-secondary">Phiếu đã kết thúc, không thể tải thêm minh chứng.</p>
          ) : null}
        </div>
      </div>
    </Section>
  );
}

function ActionButtons({
  deposit,
  onPay,
  onConfirm,
  onCancel,
  stacked = false,
}: {
  deposit: DepositWithRelations;
  onPay: (id: string) => void;
  onConfirm: (id: string) => void;
  onCancel: (id: string) => void;
  stacked?: boolean;
}) {
  const className = cx("flex gap-2", stacked ? "flex-col" : "flex-wrap justify-end");

  return (
    <div className={className}>
      {deposit.status === "PENDING" ? (
        <>
          <button type="button" onClick={() => onPay(deposit.id)} className="inline-flex min-h-8 items-center justify-center gap-1 rounded-[5px] bg-[#e0f2fe] px-3 py-2 text-[12px] font-semibold text-[#0369a1] hover:opacity-85">
            <UploadCloud className="h-3.5 w-3.5" />
            Thu tiền
          </button>
          <button type="button" onClick={() => onCancel(deposit.id)} className="inline-flex min-h-8 items-center justify-center gap-1 rounded-[5px] bg-error-container px-3 py-2 text-[12px] font-semibold text-error hover:opacity-85">
            <XCircle className="h-3.5 w-3.5" />
            Hủy
          </button>
        </>
      ) : null}

      {deposit.status === "PAID" ? (
        <>
          <button type="button" onClick={() => onConfirm(deposit.id)} className="inline-flex min-h-8 items-center justify-center gap-1 rounded-[5px] bg-success-container px-3 py-2 text-[12px] font-semibold text-success hover:opacity-85">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Xác nhận
          </button>
          <button type="button" onClick={() => onCancel(deposit.id)} className="inline-flex min-h-8 items-center justify-center gap-1 rounded-[5px] bg-error-container px-3 py-2 text-[12px] font-semibold text-error hover:opacity-85">
            <XCircle className="h-3.5 w-3.5" />
            Hủy
          </button>
        </>
      ) : null}

      {deposit.status !== "PENDING" && deposit.status !== "PAID" ? (
        <span className="rounded-[5px] bg-secondary px-3 py-2 text-center text-[12px] font-medium text-on-surface-secondary">
          Không còn thao tác
        </span>
      ) : null}
    </div>
  );
}

function Section({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: typeof UserRound;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-[8px] border border-border bg-surface">
      <div className="flex items-center gap-2 border-b border-border bg-[#FAFBFF] px-4 py-3">
        <Icon className="h-4 w-4 text-primary" strokeWidth={2} />
        <h3 className="text-[13px] font-bold uppercase tracking-[0.04em] text-primary">{title}</h3>
      </div>
      <div className="p-4">{children}</div>
    </section>
  );
}

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="min-w-0 rounded-[6px] bg-secondary px-3 py-2">
      <p className="text-[11px] font-semibold uppercase tracking-[0.04em] text-on-surface-secondary">{label}</p>
      <div className="mt-1 break-words text-[13px] font-medium text-on-surface">{value}</div>
    </div>
  );
}

function SummaryRow({
  label,
  value,
  strong = false,
}: {
  label: string;
  value: React.ReactNode;
  strong?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-border pb-2 last:border-b-0 last:pb-0">
      <span className="text-on-surface-secondary">{label}</span>
      <span className={cx("text-right", strong ? "text-[16px] font-bold text-primary" : "font-medium")}>{value}</span>
    </div>
  );
}

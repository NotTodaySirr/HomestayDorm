import type { QueueKey, ReturnRoomTicket, ReturnTicketStatus } from "./types";

export type StatusTone = "success" | "error" | "warning" | "primary" | "muted";

export type StatusMeta = {
  label: string;
  shortLabel: string;
  tone: StatusTone;
  currentStep: string;
  nextStep: string;
};

export const statusMeta: Record<ReturnTicketStatus, StatusMeta> = {
  pendingManagerReview: {
    label: "Chờ quản lý kiểm tra",
    shortLabel: "Chờ kiểm tra",
    tone: "warning",
    currentStep: "Kiểm tra phòng",
    nextStep: "Lập phiếu đối soát và chuyển kế toán",
  },
  reconciling: {
    label: "Đang đối soát",
    shortLabel: "Đang đối soát",
    tone: "primary",
    currentStep: "Lập phiếu đối soát",
    nextStep: "Hoàn tất kiểm tra và chuyển kế toán",
  },
  waitingAccounting: {
    label: "Chờ kế toán xử lý",
    shortLabel: "Chờ kế toán",
    tone: "warning",
    currentStep: "Kế toán xử lý",
    nextStep: "Nhận kết quả đối soát",
  },
  accountingResultReady: {
    label: "Đã có kết quả đối soát",
    shortLabel: "Có kết quả",
    tone: "primary",
    currentStep: "Đối chiếu với khách",
    nextStep: "Ghi nhận xác nhận của khách",
  },
  waitingCustomerConfirmation: {
    label: "Chờ khách xác nhận",
    shortLabel: "Chờ khách",
    tone: "warning",
    currentStep: "Thông báo kết quả",
    nextStep: "Ghi nhận khách đồng ý hoặc không đồng ý",
  },
  customerConfirmed: {
    label: "Khách đã xác nhận",
    shortLabel: "Đã xác nhận",
    tone: "success",
    currentStep: "Cập nhật phòng/giường",
    nextStep: "Hoàn tất phiếu trả phòng",
  },
  needsRecheck: {
    label: "Cần kiểm tra lại",
    shortLabel: "Kiểm tra lại",
    tone: "error",
    currentStep: "Rà soát lại đối soát",
    nextStep: "Điều chỉnh hoặc kiểm tra lại với khách",
  },
  waitingDepositRefund: {
    label: "Chờ hoàn cọc",
    shortLabel: "Chờ hoàn cọc",
    tone: "warning",
    currentStep: "Kế toán hoàn cọc",
    nextStep: "Cập nhật phòng/giường sau khi hoàn tất",
  },
  waitingExtraPayment: {
    label: "Chờ thanh toán thêm",
    shortLabel: "Chờ thanh toán",
    tone: "warning",
    currentStep: "Khách thanh toán thêm",
    nextStep: "Cập nhật phòng/giường sau khi hoàn tất",
  },
  completed: {
    label: "Hoàn tất",
    shortLabel: "Hoàn tất",
    tone: "success",
    currentStep: "Hoàn tất",
    nextStep: "Không còn hành động bắt buộc",
  },
};

export const queueLabels: Record<QueueKey, string> = {
  pendingReview: "Chờ kiểm tra",
  reconciling: "Đang đối soát",
  waitingCustomer: "Chờ khách xác nhận",
  needsRecheck: "Cần kiểm tra lại",
  completed: "Hoàn tất",
  all: "Tất cả",
};

export const queueStatusGroups: Record<QueueKey, ReturnTicketStatus[]> = {
  pendingReview: ["pendingManagerReview"],
  reconciling: ["reconciling", "waitingAccounting"],
  waitingCustomer: [
    "accountingResultReady",
    "waitingCustomerConfirmation",
    "customerConfirmed",
    "waitingDepositRefund",
    "waitingExtraPayment",
  ],
  needsRecheck: ["needsRecheck"],
  completed: ["completed"],
  all: [
    "pendingManagerReview",
    "reconciling",
    "waitingAccounting",
    "accountingResultReady",
    "waitingCustomerConfirmation",
    "customerConfirmed",
    "needsRecheck",
    "waitingDepositRefund",
    "waitingExtraPayment",
    "completed",
  ],
};

export function getPrimaryAction(ticket: ReturnRoomTicket) {
  if (ticket.status === "pendingManagerReview") {
    return "Lập phiếu đối soát";
  }

  if (
    ticket.status === "accountingResultReady" ||
    ticket.status === "waitingCustomerConfirmation"
  ) {
    return "Ghi nhận khách xác nhận";
  }

  if (
    ticket.status === "customerConfirmed" ||
    ticket.status === "waitingDepositRefund" ||
    ticket.status === "waitingExtraPayment"
  ) {
    return "Cập nhật phòng/giường";
  }

  if (ticket.status === "needsRecheck") {
    return "Mở lại kiểm tra";
  }

  return "Xem chi tiết";
}

export function isUrgentTicket(ticket: ReturnRoomTicket) {
  return ticket.priority === "urgent" || ticket.priority === "overdue";
}

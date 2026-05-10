import { calculateFinalAmount } from "./calculation";
import type {
  PaymentQueue,
  PaymentSlip,
  PaymentSlipStatus,
  PaymentSlipStatusFilter,
} from "@/lib/payment-slips/types";

export const paymentStatusLabels: Record<PaymentSlipStatus, string> = {
  pendingAccounting: "Chờ kế toán xử lý",
  calculated: "Đã tính toán",
  customerConfirmed: "Khách đã xác nhận",
  waitingDepositRefund: "Chờ hoàn cọc",
  waitingExtraPayment: "Chờ thanh toán thêm",
  partiallyPaid: "Thanh toán một phần",
  noTransaction: "Không phát sinh giao dịch",
  needReview: "Cần kiểm tra lại",
  completedRefund: "Hoàn tất",
  completedExtraPayment: "Hoàn tất",
};

export const paymentStatusOptions: PaymentSlipStatusFilter[] = [
  "all",
  "pendingAccounting",
  "calculated",
  "customerConfirmed",
  "waitingDepositRefund",
  "waitingExtraPayment",
  "partiallyPaid",
  "noTransaction",
  "needReview",
  "completed",
];

export const paymentQueueLabels: Record<PaymentQueue, string> = {
  all: "Tất cả",
  refund: "Danh sách hoàn tiền",
  debt: "Công nợ thu thêm",
  completed: "Hoàn tất",
};

export function countPaymentSlips(slips: PaymentSlip[]) {
  return {
    pending: slips.filter((slip) => slip.status === "pendingAccounting").length,
    refund: slips.filter((slip) => slip.status === "waitingDepositRefund").length,
    debt: slips.filter((slip) => slip.status === "waitingExtraPayment").length,
    completed: slips.filter((slip) => isCompletedStatus(slip.status)).length,
  };
}

export function countPaymentSlipsByQueue(slips: PaymentSlip[]) {
  return {
    all: slips.length,
    refund: slips.filter(
      (slip) => getSlipFinalAmount(slip) > 0 && !isCompletedStatus(slip.status),
    ).length,
    debt: slips.filter(
      (slip) => getSlipFinalAmount(slip) < 0 && !isCompletedStatus(slip.status),
    ).length,
    completed: slips.filter((slip) => isCompletedStatus(slip.status)).length,
  } satisfies Record<PaymentQueue, number>;
}

export function filterPaymentSlips(
  slips: PaymentSlip[],
  filters: {
    search: string;
    status: PaymentSlipStatusFilter;
    queue: PaymentQueue;
  },
) {
  const search = normalize(filters.search);

  return slips.filter((slip) => {
    const finalAmount = getSlipFinalAmount(slip);
    const isCompleted = isCompletedStatus(slip.status);

    if (filters.queue === "refund" && (finalAmount <= 0 || isCompleted)) {
      return false;
    }

    if (filters.queue === "debt" && (finalAmount >= 0 || isCompleted)) {
      return false;
    }

    if (filters.queue === "completed" && !isCompleted) {
      return false;
    }

    if (filters.status === "completed" && !isCompleted) {
      return false;
    }

    if (
      filters.status !== "all" &&
      filters.status !== "completed" &&
      slip.status !== filters.status
    ) {
      return false;
    }

    if (!search) {
      return true;
    }

    return [
      slip.code,
      slip.returnTicketCode,
      slip.contract.code,
      slip.contract.tenantName,
      slip.contract.roomCode,
      slip.contract.bedCode,
    ].some((value) => normalize(value).includes(search));
  });
}

export function getSlipFinalAmount(slip: PaymentSlip) {
  return calculateFinalAmount(slip.contract.depositAmount, slip.calculation);
}

function isCompletedStatus(status: PaymentSlipStatus) {
  return status === "completedRefund" || status === "completedExtraPayment" || status === "noTransaction";
}

function normalize(value: string) {
  return value.trim().toLocaleLowerCase("vi-VN");
}

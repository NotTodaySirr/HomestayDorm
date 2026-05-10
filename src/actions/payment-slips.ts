'use server';

import prisma from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { decrypt } from '@/lib/session';
import {
  calculateBaseRefund,
  calculateFinalAmount,
  calculateTotalDeductions,
  getPaymentConclusion,
} from '@/components/payment-slips/logic/calculation';
import type {
  PaymentCalculation,
  PaymentMethod,
  PaymentSlip,
  PaymentSlipStatus,
  PaymentTransaction,
  RefundPolicyCode,
  TransactionDirection,
  TransactionStatus,
  TransactionType,
} from '@/lib/payment-slips/types';

// Helper function to get current user ID from session
async function getCurrentUserId(): Promise<string | null> {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get('session')?.value;
  if (!sessionToken) return null;
  
  const session = await decrypt(sessionToken);
  return session?.userId || null;
}

async function getBranch() {
  const currentUserId = await getCurrentUserId();
  if (currentUserId) {
    const user = await prisma.user.findUnique({
      where: { id: currentUserId },
      include: { branch: true }
    });
    if (user?.branch) return user.branch;
  }
  
  return prisma.branch.findUnique({
    where: { code: 'CN1' }
  });
}

function toDateString(value: Date | string | null | undefined) {
  if (!value) return '';
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? '' : date.toISOString();
}

function monthDiff(startDate: Date, endDate?: Date | null) {
  const end = endDate ?? new Date();
  const months =
    (end.getFullYear() - startDate.getFullYear()) * 12 +
    (end.getMonth() - startDate.getMonth());
  return Math.max(1, months || 1);
}

function getRefundPolicyFromRate(rate?: number | null): RefundPolicyCode {
  if (rate === 100) return 'expiredContract';
  if (rate === 50) return 'underSixMonths';
  if (rate === 70) return 'overSixMonths';
  return 'overSixMonths';
}

function mapPaymentSlipStatus(ticket: any, payment?: any): PaymentSlipStatus {
  if (payment?.status === 'COMPLETED') {
    return payment.direction === 'OUT' ? 'completedRefund' : 'completedExtraPayment';
  }

  const rrStatus = ticket.returnRoomTicket.status;

  if (ticket.status === 'NO_TRANSACTION_CONFIRMED') {
    return 'noTransaction';
  }

  if (rrStatus === 'COMPLETED') {
    if (ticket.finalAmount == null) return 'pendingAccounting';
    if (ticket.finalAmount === 0) return 'customerConfirmed';
    return ticket.finalAmount > 0 ? 'waitingDepositRefund' : 'waitingExtraPayment';
  }

  if (rrStatus === 'NEEDS_RECHECK') return 'needReview';
  if (rrStatus === 'WAITING_DEPOSIT_REFUND') return 'waitingDepositRefund';
  if (rrStatus === 'WAITING_EXTRA_PAYMENT') return 'waitingExtraPayment';
  
  if (
    ticket.finalAmount === 0 &&
    ticket.returnRoomTicket.customerConfirmationStatus === 'AGREED'
  ) {
    return 'noTransaction';
  }
  
  if (rrStatus === 'CUSTOMER_CONFIRMED') return 'customerConfirmed';
  
  if (rrStatus === 'WAITING_ACCOUNTING' && ticket.finalAmount == null) {
    return 'pendingAccounting';
  }
  
  if (
    ticket.status === 'ACCOUNTING_RESULT_READY' ||
    rrStatus === 'WAITING_CUSTOMER_CONFIRMATION'
  ) {
    return 'calculated';
  }
  
  if (ticket.status !== 'DRAFT' || ticket.finalAmount != null) return 'calculated';
  return 'pendingAccounting';
}

function mapPaymentMethod(value?: string | null): PaymentMethod {
  return value === 'TRANSFER' ? 'CHUYEN_KHOAN' : 'TIEN_MAT';
}

function getRefundRateFromPolicy(code: RefundPolicyCode) {
  if (code === 'unsignedContract') return 80;
  if (code === 'underSixMonths') return 50;
  if (code === 'overSixMonths') return 70;
  return 100;
}

function normalizeSearchText(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

type AccountingDetailLike = {
  description: string;
  amount: number;
  note?: string | null;
};

function findAccountingDetail<T extends AccountingDetailLike>(details: T[], keyword: string) {
  return details.find((detail) =>
    normalizeSearchText(detail.description).includes(keyword),
  );
}

function mapTransactionStatus(value?: string | null): TransactionStatus {
  if (value === 'COMPLETED') return 'DA_THANH_TOAN';
  if (value === 'CANCELLED') return 'HUY';
  return 'CHO_XAC_NHAN';
}

function mapPaymentSlip(ticket: any): PaymentSlip {
  const contract = ticket.returnRoomTicket.contract;
  const representative = contract.occupants?.find((occupant: any) => occupant.isRepresentative);
  const firstBedDetail = contract.bedDetails?.[0];
  const room = firstBedDetail?.bed?.room;
  const bedCode = contract.bedDetails?.map((detail: any) => detail.bed.position).join(', ') || 'N/A';
  const stayDurationMonths = monthDiff(contract.startDate, ticket.returnRoomTicket.actualReturnDate);
  const managerDetails = ticket.details?.filter((detail: any) => detail.source === 'manager') ?? [];
  const accountingDetails = ticket.details?.filter((detail: any) => detail.source === 'accounting') ?? [];
  const managerCompensationFee = managerDetails.reduce((sum: number, detail: any) => sum + detail.amount, 0);
  const compensationDetail = findAccountingDetail(accountingDetails, 'boi thuong');
  const adjustmentDetail = findAccountingDetail(accountingDetails, 'dieu chinh');
  const latestPayment = ticket.payments?.[0];
  const finalAmount = ticket.finalAmount ?? 0;

  return {
    id: ticket.id,
    code: ticket.code,
    returnTicketCode: ticket.returnRoomTicket.code,
    status: mapPaymentSlipStatus(ticket, latestPayment),
    createdAt: toDateString(ticket.createdAt),
    contract: {
      code: contract.code,
      tenantName: representative?.fullName || contract.registration.customerName,
      roomCode: room?.name || 'N/A',
      bedCode,
      depositAmount: ticket.depositAmount ?? contract.depositAmount,
      stayDurationMonths,
      stayDescription: contract.endDate ? 'Hết hạn hợp đồng' : `${stayDurationMonths} tháng`,
    },
    managerInspection: {
      hygieneStatus: ticket.hygieneStatus === 'failed' ? 'Không đạt' : 'Đạt',
      assetStatus: ticket.hasDamageOrLoss
        ? managerDetails.map((detail: any) => detail.description).join(', ') || 'Có ghi nhận hư hỏng/mất mát'
        : 'Đầy đủ',
      estimatedCompensation: managerCompensationFee,
      note: ticket.managerNotes || '',
    },
    calculation: {
      refundPolicy: getRefundPolicyFromRate(ticket.refundRate),
      unpaidRent: findAccountingDetail(accountingDetails, 'thue')?.amount ?? 0,
      electricityFee: findAccountingDetail(accountingDetails, 'dien')?.amount ?? 0,
      waterFee: findAccountingDetail(accountingDetails, 'nuoc')?.amount ?? 0,
      serviceFee: findAccountingDetail(accountingDetails, 'dich vu')?.amount ?? 0,
      compensationFee: compensationDetail?.amount ?? managerCompensationFee,
      violationPenalty: findAccountingDetail(accountingDetails, 'phat')?.amount ?? 0,
      adjustment: adjustmentDetail?.amount ?? 0,
      adjustmentReason: adjustmentDetail?.note || '',
    },
    customerConfirmed: ticket.returnRoomTicket.customerConfirmationStatus === 'AGREED',
    extraPaymentSlip: {
      created: finalAmount < 0,
      code: finalAmount < 0 ? `PTTT-${ticket.code}` : undefined,
      createdAt: finalAmount < 0 ? toDateString(ticket.updatedAt).slice(0, 10) : undefined,
    },
    transaction: latestPayment
      ? {
          id: latestPayment.id,
          code: latestPayment.transactionId || latestPayment.id.slice(0, 8).toUpperCase(),
          paymentSlipCode: ticket.code,
          type: (latestPayment.direction === 'OUT' ? 'HOAN_COC' : 'THU_THEM') as TransactionType,
          direction: (latestPayment.direction === 'OUT' ? 'CHI_RA' : 'THU_VAO') as TransactionDirection,
          amount: latestPayment.amount,
          paymentMethod: mapPaymentMethod(latestPayment.paymentMethod),
          transactionDate: toDateString(latestPayment.paymentTime || latestPayment.createdAt).slice(0, 10),
          bankTransactionCode: latestPayment.transactionId || undefined,
          proofFile: latestPayment.proofUrl || undefined,
          note: latestPayment.note || undefined,
          status: mapTransactionStatus(latestPayment.status),
          createdAt: toDateString(latestPayment.createdAt),
        }
      : undefined,
  };
}

export async function getPaymentSlips(): Promise<PaymentSlip[]> {
  const branch = await getBranch();
  if (!branch) return [];

  const slips = await prisma.reconciliationTicket.findMany({
    where: {
      returnRoomTicket: {
        branchId: branch.id,
      },
    },
    include: {
      details: true,
      payments: {
        orderBy: { createdAt: 'desc' },
        take: 1,
      },
      returnRoomTicket: {
        include: {
          contract: {
            include: {
              registration: true,
              occupants: true,
              bedDetails: {
                include: {
                  bed: {
                    include: { room: true },
                  },
                },
              },
            },
          },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return slips.map(mapPaymentSlip);
}

export async function getPaymentSlipById(id: string): Promise<PaymentSlip | null> {
  const slips = await getPaymentSlips();
  return slips.find((slip) => slip.id === id) ?? null;
}

export type ConfirmPaymentSlipCalculationInput = PaymentCalculation;

export type ConfirmPaymentSlipCustomerResponseInput = {
  agreed: boolean;
  disagreementReason?: string;
};

export async function confirmPaymentSlipCalculation(
  reconciliationTicketId: string,
  calculation: ConfirmPaymentSlipCalculationInput,
): Promise<{ success: boolean; slip?: PaymentSlip; error?: string }> {
  try {
    const ticket = await prisma.reconciliationTicket.findUnique({
      where: { id: reconciliationTicketId },
      include: paymentSlipInclude,
    });

    if (!ticket) {
      return { success: false, error: 'Payment slip not found' };
    }

    if (ticket.returnRoomTicket.status === 'COMPLETED') {
      return { success: false, error: 'This slip has already been completed' };
    }

    const refundRate = getRefundRateFromPolicy(calculation.refundPolicy);
    const baseRefund = calculateBaseRefund(ticket.depositAmount ?? ticket.returnRoomTicket.contract.depositAmount, calculation.refundPolicy);
    const totalDeductions = calculateTotalDeductions(calculation);
    const finalAmount = calculateFinalAmount(ticket.depositAmount ?? ticket.returnRoomTicket.contract.depositAmount, calculation);
    const conclusion = getPaymentConclusion(finalAmount);

    const updatedSlipId = await prisma.$transaction(async (tx) => {
      await tx.reconciliationDetail.deleteMany({
        where: {
          reconciliationTicketId,
          source: 'accounting',
        },
      });

      const accountingDetails = [
        { description: 'Tiền thuê còn nợ', amount: calculation.unpaidRent },
        { description: 'Tiền điện', amount: calculation.electricityFee },
        { description: 'Tiền nước', amount: calculation.waterFee },
        { description: 'Phí dịch vụ', amount: calculation.serviceFee },
        { description: 'Phí bồi thường', amount: calculation.compensationFee },
        { description: 'Phạt vi phạm', amount: calculation.violationPenalty },
        {
          description: 'Điều chỉnh',
          amount: calculation.adjustment,
          note: calculation.adjustmentReason.trim() || null,
        },
      ].filter((detail) => detail.amount !== 0 || detail.note);

      if (accountingDetails.length > 0) {
        await tx.reconciliationDetail.createMany({
          data: accountingDetails.map((detail) => ({
            reconciliationTicketId,
            source: 'accounting',
            description: detail.description,
            quantity: 1,
            amount: detail.amount,
            note: detail.note ?? null,
            status: 'final',
          })),
        });
      }

      const updated = await tx.reconciliationTicket.update({
        where: { id: reconciliationTicketId },
        data: {
          status: 'ACCOUNTING_RESULT_READY',
          refundRate,
          baseRefund,
          totalDeductions,
          finalAmount,
          conclusion,
        },
        select: { id: true },
      });

      await tx.returnRoomTicket.update({
        where: { id: ticket.returnRoomTicketId },
        data: {
          status: 'WAITING_CUSTOMER_CONFIRMATION',
          customerConfirmationStatus: 'NOT_STARTED',
          customerConfirmedAt: null,
          customerDisagreementReason: null,
        },
      });

      return updated.id;
    });

    const refreshed = await prisma.reconciliationTicket.findUnique({
      where: { id: updatedSlipId },
      include: paymentSlipInclude,
    });

    if (!refreshed) {
      return { success: false, error: 'Unable to reload updated payment slip' };
    }

    revalidatePath('/dashboard/payment-slips');
    revalidatePath(`/dashboard/payment-slips/${refreshed.id}`);
    revalidatePath('/dashboard/reports/revenue');

    return { success: true, slip: mapPaymentSlip(refreshed) };
  } catch (error) {
    console.error('Error confirming payment slip calculation:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

export async function confirmPaymentSlipCustomerResponse(
  reconciliationTicketId: string,
  input: ConfirmPaymentSlipCustomerResponseInput,
): Promise<{ success: boolean; slip?: PaymentSlip; error?: string }> {
  try {
    const ticket = await prisma.reconciliationTicket.findUnique({
      where: { id: reconciliationTicketId },
      include: paymentSlipInclude,
    });

    if (!ticket) {
      return { success: false, error: 'Payment slip not found' };
    }

    if (ticket.finalAmount == null) {
      return { success: false, error: 'Accounting result is not ready yet' };
    }

    if (ticket.returnRoomTicket.status === 'COMPLETED') {
      return { success: false, error: 'This slip has already been completed' };
    }

    if (
      ![
        'WAITING_CUSTOMER_CONFIRMATION',
        'ACCOUNTING_RESULT_READY',
        'CUSTOMER_CONFIRMED',
        'NEEDS_RECHECK',
      ].includes(ticket.returnRoomTicket.status)
    ) {
      return { success: false, error: 'This slip is not waiting for customer confirmation' };
    }

    const disagreementReason =
      input.disagreementReason?.trim() ||
      'Customer requested accounting to recheck the payment calculation.';

    const updated = await prisma.returnRoomTicket.update({
      where: { id: ticket.returnRoomTicketId },
      data: input.agreed
        ? {
            status: 'CUSTOMER_CONFIRMED',
            customerConfirmationStatus: 'AGREED',
            customerConfirmedAt: new Date(),
            customerDisagreementReason: null,
          }
        : {
            status: 'NEEDS_RECHECK',
            customerConfirmationStatus: 'DISAGREED',
            customerConfirmedAt: null,
            customerDisagreementReason: disagreementReason,
          },
      select: {
        reconciliation: {
          include: paymentSlipInclude,
        },
      },
    });

    if (!updated.reconciliation) {
      return { success: false, error: 'Unable to reload updated payment slip' };
    }

    revalidatePath('/dashboard/payment-slips');
    revalidatePath(`/dashboard/payment-slips/${updated.reconciliation.id}`);
    revalidatePath('/dashboard/return-room-tickets');
    revalidatePath('/dashboard/reports/revenue');

    return { success: true, slip: mapPaymentSlip(updated.reconciliation) };
  } catch (error) {
    console.error('Error confirming payment slip customer response:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

export async function initiatePaymentWorkflow(
  reconciliationId: string,
): Promise<{ success: boolean; slip?: PaymentSlip; error?: string }> {
  try {
    const ticket = await prisma.reconciliationTicket.findUnique({
      where: { id: reconciliationId },
      include: { returnRoomTicket: true },
    });

    if (!ticket) return { success: false, error: 'Không tìm thấy phiếu đối soát' };

    const nextStatus =
      (ticket.finalAmount ?? 0) > 0 ? 'WAITING_DEPOSIT_REFUND' : 'WAITING_EXTRA_PAYMENT';

    const updated = await prisma.returnRoomTicket.update({
      where: { id: ticket.returnRoomTicketId },
      data: { status: nextStatus },
      include: { reconciliation: { include: paymentSlipInclude } },
    });

    revalidatePath('/dashboard/payment-slips');
    revalidatePath(`/dashboard/payment-slips/${reconciliationId}`);

    return { success: true, slip: mapPaymentSlip(updated.reconciliation!) };
  } catch (error) {
    console.error('Error initiating payment workflow:', error);
    return { success: false, error: 'Không thể khởi tạo quy trình thanh toán' };
  }
}

export async function recordPaymentTransaction(
  reconciliationId: string,
  input: PaymentTransaction,
): Promise<{ success: boolean; slip?: PaymentSlip; error?: string }> {
  try {
    const ticket = await prisma.reconciliationTicket.findUnique({
      where: { id: reconciliationId },
      include: paymentSlipInclude,
    });

    if (!ticket) return { success: false, error: 'Không tìm thấy phiếu đối soát' };
    if (ticket.payments.some((payment: { status?: string | null }) => payment.status === 'COMPLETED')) {
      return { success: false, error: 'Payment transaction has already been recorded.' };
    }
    if (ticket.returnRoomTicket.customerConfirmationStatus !== 'AGREED') {
      return { success: false, error: 'Khách chưa xác nhận kết quả đối soát' };
    }
    if (ticket.finalAmount == null) {
      return { success: false, error: 'Chưa có số tiền cuối cùng để ghi nhận giao dịch' };
    }
    if (ticket.finalAmount === 0) {
      return { success: false, error: 'Phiếu này không phát sinh giao dịch thanh toán' };
    }

    const expectedType: TransactionType = ticket.finalAmount > 0 ? 'HOAN_COC' : 'THU_THEM';
    const expectedDirection: TransactionDirection = ticket.finalAmount > 0 ? 'CHI_RA' : 'THU_VAO';
    const expectedAmount = Math.abs(ticket.finalAmount);

    if (input.type !== expectedType || input.direction !== expectedDirection) {
      return { success: false, error: 'Loại giao dịch không khớp với kết quả đối soát' };
    }

    const paymentTime = new Date(input.transactionDate);
    if (Number.isNaN(paymentTime.getTime())) {
      return { success: false, error: 'Ngày giao dịch không hợp lệ' };
    }
    if (input.paymentMethod === 'CHUYEN_KHOAN' && !input.bankTransactionCode?.trim()) {
      return { success: false, error: 'Vui lòng nhập mã giao dịch khi chuyển khoản' };
    }

    const cookieStore = await cookies();
    const session = await decrypt(cookieStore.get('session')?.value);
    const staff = session?.userId
      ? await prisma.user.findUnique({
          where: { id: session.userId },
          select: { id: true },
        })
      : null;

    await prisma.$transaction(async (tx) => {
      await tx.payment.create({
        data: {
          reconciliationTicketId: reconciliationId,
          paymentType: input.type === 'HOAN_COC' ? 'REFUND' : 'RENT',
          direction: input.direction === 'CHI_RA' ? 'OUT' : 'IN',
          amount: expectedAmount,
          paymentMethod: input.paymentMethod === 'TIEN_MAT' ? 'CASH' : 'TRANSFER',
          paymentTime,
          transactionId: input.bankTransactionCode?.trim() || null,
          note: input.note?.trim() || null,
          proofUrl: input.proofFile?.trim() || null,
          status: 'COMPLETED',
          staffId: staff?.id ?? null,
        },
      });
    });

    const updated = await prisma.reconciliationTicket.findUnique({
      where: { id: reconciliationId },
      include: paymentSlipInclude,
    });

    revalidatePath('/dashboard/payment-slips');
    revalidatePath(`/dashboard/payment-slips/${reconciliationId}`);
    revalidatePath('/dashboard/return-room-tickets');
    revalidatePath('/dashboard/check-in-contracts');
    revalidatePath('/dashboard/reports/revenue');

    if (!updated) {
      return { success: false, error: 'Không thể tải lại phiếu đối soát sau khi ghi nhận giao dịch' };
    }

    return { success: true, slip: mapPaymentSlip(updated) };
  } catch (error) {
    console.error('Error recording payment transaction:', error);
    return { success: false, error: 'Không thể ghi nhận giao dịch' };
  }
}

export async function confirmNoTransaction(
  reconciliationId: string,
): Promise<{ success: boolean; slip?: PaymentSlip; error?: string }> {
  try {
    const ticket = await prisma.reconciliationTicket.findUnique({
      where: { id: reconciliationId },
      include: { returnRoomTicket: true },
    });

    if (!ticket) return { success: false, error: 'Không tìm thấy phiếu đối soát' };
    if (ticket.returnRoomTicket.customerConfirmationStatus !== 'AGREED') {
      return { success: false, error: 'Khách chưa xác nhận kết quả đối soát' };
    }
    if (ticket.finalAmount !== 0) {
      return { success: false, error: 'Phiếu này vẫn còn phát sinh giao dịch thanh toán' };
    }

    await prisma.$transaction(async (tx) => {
      await tx.reconciliationTicket.update({
        where: { id: reconciliationId },
        data: { status: 'NO_TRANSACTION_CONFIRMED' },
      });

      await tx.returnRoomTicket.update({
        where: { id: ticket.returnRoomTicketId },
        data: { status: 'CUSTOMER_CONFIRMED' },
      });
    });

    const updated = await prisma.returnRoomTicket.findUnique({
      where: { id: ticket.returnRoomTicketId },
      include: { reconciliation: { include: paymentSlipInclude } },
    });

    if (!updated?.reconciliation) {
      return { success: false, error: 'Unable to reload payment slip' };
    }

    revalidatePath('/dashboard/payment-slips');
    revalidatePath(`/dashboard/payment-slips/${reconciliationId}`);
    revalidatePath('/dashboard/return-room-tickets');

    return { success: true, slip: mapPaymentSlip(updated.reconciliation) };
  } catch (error) {
    console.error('Error confirming no transaction:', error);
    return { success: false, error: 'Không thể xác nhận không phát sinh giao dịch' };
  }
}

const paymentSlipInclude = {
  details: true,
  payments: {
    orderBy: { createdAt: 'desc' },
    take: 1,
  },
  returnRoomTicket: {
    include: {
      contract: {
        include: {
          registration: true,
          occupants: true,
          bedDetails: {
            include: {
              bed: {
                include: { room: true },
              },
            },
          },
        },
      },
    },
  },
} as const;

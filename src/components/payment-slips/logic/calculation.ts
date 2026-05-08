import type {
  PaymentCalculation,
  PaymentSlipStatus,
  RefundPolicy,
  RefundPolicyCode,
} from "@/lib/payment-slips/types";

export const refundPolicies: RefundPolicy[] = [
  { code: "unsignedContract", label: "Chưa ký HĐ (Hoàn 80%)", rate: 80 },
  { code: "underSixMonths", label: "Dưới 6 tháng (Hoàn 50%)", rate: 50 },
  { code: "overSixMonths", label: "Trên 6 tháng (Hoàn 70%)", rate: 70 },
  { code: "expiredContract", label: "Hết hạn HĐ (Hoàn 100%)", rate: 100 },
];

export function getRefundPolicy(code: RefundPolicyCode) {
  return refundPolicies.find((policy) => policy.code === code) ?? refundPolicies[0];
}

export function calculateBaseRefund(depositAmount: number, policyCode: RefundPolicyCode) {
  return Math.round((depositAmount * getRefundPolicy(policyCode).rate) / 100);
}

export function calculateTotalDeductions(calculation: PaymentCalculation) {
  return (
    calculation.unpaidRent +
    calculation.electricityFee +
    calculation.waterFee +
    calculation.serviceFee +
    calculation.compensationFee +
    calculation.violationPenalty +
    calculation.adjustment
  );
}

export function calculateFinalAmount(
  depositAmount: number,
  calculation: PaymentCalculation,
) {
  return calculateBaseRefund(depositAmount, calculation.refundPolicy) -
    calculateTotalDeductions(calculation);
}

export function getPaymentConclusion(finalAmount: number) {
  if (finalAmount > 0) {
    return "Khách được hoàn cọc";
  }

  if (finalAmount < 0) {
    return "Khách cần thanh toán thêm";
  }

  return "Không phát sinh hoàn hoặc thu thêm";
}

export function getSettlementStatus(finalAmount: number): PaymentSlipStatus {
  if (finalAmount > 0) {
    return "waitingDepositRefund";
  }

  if (finalAmount < 0) {
    return "waitingExtraPayment";
  }

  return "noTransaction";
}

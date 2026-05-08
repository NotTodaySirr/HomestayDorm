import { useMemo, useState } from "react";
import { paymentSlipToastMessages } from "@/components/feedback/toastMessages";
import {
  calculateBaseRefund,
  calculateFinalAmount,
  calculateTotalDeductions,
  getPaymentConclusion,
  getSettlementStatus,
} from "@/components/payment-slips/logic/calculation";
import type {
  PaymentCalculation,
  PaymentSlip,
  PaymentSlipStatus,
  PaymentTransaction,
} from "@/lib/payment-slips/types";

export function usePaymentSlipDetail(slip: PaymentSlip) {
  const [calculation, setCalculation] = useState<PaymentCalculation>(slip.calculation);
  const [status, setStatus] = useState<PaymentSlipStatus>(slip.status);
  const [customerConfirmed, setCustomerConfirmed] = useState(slip.customerConfirmed);
  const [extraPaymentSlip, setExtraPaymentSlip] = useState(slip.extraPaymentSlip);
  const [notice, setNotice] = useState<string | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [transaction, setTransaction] = useState<PaymentTransaction | undefined>(slip.transaction);

  const totals = useMemo(() => {
    const baseRefund = calculateBaseRefund(
      slip.contract.depositAmount,
      calculation.refundPolicy,
    );
    const totalDeductions = calculateTotalDeductions(calculation);
    const finalAmount = calculateFinalAmount(
      slip.contract.depositAmount,
      calculation,
    );

    return {
      baseRefund,
      totalDeductions,
      finalAmount,
      conclusion: getPaymentConclusion(finalAmount),
    };
  }, [calculation, slip.contract.depositAmount]);

  const isEditable = status === "pendingAccounting" || status === "needReview";

  function updateMoneyField(key: keyof PaymentCalculation, value: string) {
    setCalculation((current) => ({
      ...current,
      [key]: Number(value) || 0,
    }));
  }

  function handleConfirmCalculation() {
    setStatus("calculated");
    setShowConfirmModal(false);
    setNotice(paymentSlipToastMessages.calculationConfirmed);
  }

  // Demo bypass functions
  function simulateCustomerConfirm() {
    setCustomerConfirmed(true);
    setStatus(getSettlementStatus(totals.finalAmount));
    setNotice("Mô phỏng: Khách đã đồng ý với kết quả đối soát.");
  }

  function simulateCustomerReject() {
    setStatus("needReview");
    setNotice("Mô phỏng: Khách không đồng ý, cần kiểm tra lại.");
  }

  function createExtraPaymentSlip() {
    setExtraPaymentSlip({
      created: true,
      code: `PTTT-${slip.code}`,
      createdAt: new Date().toISOString().slice(0, 10),
    });
    setStatus("waitingExtraPayment");
    setNotice(paymentSlipToastMessages.extraPaymentCreated);
  }

  function handleTransactionSubmit(newTransaction: PaymentTransaction) {
    setTransaction(newTransaction);
    setIsTransactionModalOpen(false);
    if (newTransaction.type === "HOAN_COC") {
      setStatus("completedRefund");
      setNotice("Đã ghi nhận hoàn cọc thành công.");
    } else {
      setStatus("completedExtraPayment");
      setNotice("Đã ghi nhận thanh toán thêm thành công.");
    }
  }

  function confirmNoTransaction() {
    setStatus("noTransaction");
    setNotice("Đã xác nhận không phát sinh giao dịch.");
  }

  const steps = [
    { label: "Quản lý đối soát", completed: true },
    { label: "Kế toán tính toán", completed: status !== "pendingAccounting" },
    { label: "Khách xác nhận", completed: customerConfirmed && status !== "needReview" },
    { label: "Xử lý tiền", completed: status === "completedRefund" || status === "completedExtraPayment" || status === "noTransaction" || status === "waitingExtraPayment" || status === "partiallyPaid" || status === "waitingDepositRefund" },
    { label: "Hoàn tất", completed: status === "completedRefund" || status === "completedExtraPayment" || status === "noTransaction" },
  ];

  return {
    state: {
      calculation,
      status,
      customerConfirmed,
      extraPaymentSlip,
      notice,
      showConfirmModal,
      isTransactionModalOpen,
      transaction,
      totals,
      isEditable,
      steps,
    },
    actions: {
      setCalculation,
      setStatus,
      setShowConfirmModal,
      setIsTransactionModalOpen,
      updateMoneyField,
      handleConfirmCalculation,
      simulateCustomerConfirm,
      simulateCustomerReject,
      createExtraPaymentSlip,
      handleTransactionSubmit,
      confirmNoTransaction,
    },
  };
}

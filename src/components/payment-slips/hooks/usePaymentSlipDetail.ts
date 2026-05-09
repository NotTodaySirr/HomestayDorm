import { useMemo, useState, useTransition } from "react";
import {
  confirmNoTransaction,
  confirmPaymentSlipCalculation,
} from "@/actions/payment-slips";
import { paymentSlipToastMessages } from "@/components/feedback/toastMessages";
import {
  calculateBaseRefund,
  calculateFinalAmount,
  calculateTotalDeductions,
  getPaymentConclusion,
} from "@/components/payment-slips/logic/calculation";
import type {
  PaymentCalculation,
  PaymentSlip,
  PaymentSlipStatus,
  PaymentTransaction,
} from "@/lib/payment-slips/types";

type PaymentSlipMutationResult = {
  success: boolean;
  slip?: PaymentSlip;
  error?: string;
};

export function usePaymentSlipDetail(slip: PaymentSlip) {
  const [calculation, setCalculation] = useState<PaymentCalculation>(slip.calculation);
  const [status, setStatus] = useState<PaymentSlipStatus>(slip.status);
  const [customerConfirmed, setCustomerConfirmed] = useState(slip.customerConfirmed);
  const [extraPaymentSlip, setExtraPaymentSlip] = useState(slip.extraPaymentSlip);
  const [notice, setNotice] = useState<string | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [transaction, setTransaction] = useState<PaymentTransaction | undefined>(slip.transaction);
  const [isConfirmingCalculation, startConfirmingCalculation] = useTransition();
  const [isUpdatingCustomerResponse, startUpdatingCustomerResponse] = useTransition();

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

  function applyServerSlip(updatedSlip: PaymentSlip) {
    setCalculation(updatedSlip.calculation);
    setStatus(updatedSlip.status);
    setCustomerConfirmed(updatedSlip.customerConfirmed);
    setExtraPaymentSlip(updatedSlip.extraPaymentSlip);
    setTransaction(updatedSlip.transaction);
  }

  function updateMoneyField(key: keyof PaymentCalculation, value: string) {
    setCalculation((current) => ({
      ...current,
      [key]: Number(value) || 0,
    }));
  }

  function handleConfirmCalculation() {
    startConfirmingCalculation(async () => {
      const result = await confirmPaymentSlipCalculation(slip.id, calculation);

      if (!result.success || !result.slip) {
        setNotice(result.error ?? "Không thể xác nhận kết quả tính toán.");
        return;
      }

      applyServerSlip(result.slip);
      setShowConfirmModal(false);
      setNotice(paymentSlipToastMessages.calculationConfirmed);
    });
  }

  function confirmCustomerAgreement() {
    startUpdatingCustomerResponse(async () => {
      const result = await submitCustomerResponse({
        agreed: true,
      });

      if (!result.success || !result.slip) {
        setNotice(result.error ?? "Không thể ghi nhận phản hồi của khách.");
        return;
      }

      applyServerSlip(result.slip);
      setNotice(paymentSlipToastMessages.customerConfirmed);
    });
  }

  function rejectCustomerAgreement() {
    startUpdatingCustomerResponse(async () => {
      const result = await submitCustomerResponse({
        agreed: false,
      });

      if (!result.success || !result.slip) {
        setNotice(result.error ?? "Không thể ghi nhận phản hồi của khách.");
        return;
      }

      applyServerSlip(result.slip);
      setNotice(paymentSlipToastMessages.customerRejected);
    });
  }

  async function submitCustomerResponse(input: {
    agreed: boolean;
    disagreementReason?: string;
  }): Promise<PaymentSlipMutationResult> {
    const response = await fetch(`/api/payment-slips/${slip.id}/customer-response`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(input),
    });

    return response.json() as Promise<PaymentSlipMutationResult>;
  }

  function handleTransactionSubmit(newTransaction: PaymentTransaction) {
    startUpdatingCustomerResponse(async () => {
      const result = await submitPaymentTransaction(newTransaction);

      if (!result.success || !result.slip) {
        setNotice(result.error ?? "Không thể ghi nhận giao dịch.");
        return;
      }

      applyServerSlip(result.slip);
      setIsTransactionModalOpen(false);
      setNotice(
        newTransaction.type === "HOAN_COC"
          ? "Đã ghi nhận hoàn cọc thành công."
          : "Đã ghi nhận thanh toán thêm thành công.",
      );
    });
  }

  async function submitPaymentTransaction(
    transactionInput: PaymentTransaction,
  ): Promise<PaymentSlipMutationResult> {
    const response = await fetch(`/api/payment-slips/${slip.id}/transactions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(transactionInput),
    });

    return response.json() as Promise<PaymentSlipMutationResult>;
  }

  function handleConfirmNoTransaction() {
    startUpdatingCustomerResponse(async () => {
      const result = await confirmNoTransaction(slip.id);

      if (!result.success || !result.slip) {
        setNotice(result.error ?? "Không thể xác nhận không phát sinh giao dịch.");
        return;
      }

      applyServerSlip(result.slip);
      setNotice("Đã xác nhận không phát sinh giao dịch.");
    });
  }

  const steps = [
    { label: "Quản lý đối soát", completed: true },
    { label: "Kế toán tính toán", completed: status !== "pendingAccounting" },
    { label: "Khách xác nhận", completed: customerConfirmed && status !== "needReview" },
    {
      label: "Xử lý tiền",
      completed:
        status === "completedRefund" ||
        status === "completedExtraPayment" ||
        status === "noTransaction" ||
        status === "waitingExtraPayment" ||
        status === "partiallyPaid" ||
        status === "waitingDepositRefund",
    },
    {
      label: "Hoàn tất",
      completed:
        status === "completedRefund" ||
        status === "completedExtraPayment" ||
        status === "noTransaction",
    },
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
      isConfirmingCalculation,
      isUpdatingCustomerResponse,
    },
    actions: {
      setCalculation,
      setStatus,
      setShowConfirmModal,
      setIsTransactionModalOpen,
      updateMoneyField,
      handleConfirmCalculation,
      confirmCustomerAgreement,
      rejectCustomerAgreement,
      handleTransactionSubmit,
      confirmNoTransaction: handleConfirmNoTransaction,
    },
  };
}

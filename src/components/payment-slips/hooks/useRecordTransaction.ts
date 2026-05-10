import { useState } from "react";
import type { PaymentMethod, PaymentSlip, PaymentTransaction, TransactionDirection, TransactionType } from "@/lib/payment-slips/types";

export function useRecordTransaction({
  slip,
  finalAmount,
  onSubmit,
}: {
  slip: PaymentSlip;
  finalAmount: number;
  onSubmit: (transaction: PaymentTransaction) => void;
}) {
  const isRefund = finalAmount > 0;
  const transactionType: TransactionType = isRefund ? "HOAN_COC" : "THU_THEM";
  const transactionDirection: TransactionDirection = isRefund ? "CHI_RA" : "THU_VAO";
  const amount = Math.abs(finalAmount);

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("CHUYEN_KHOAN");
  const [transactionDate, setTransactionDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [bankTransactionCode, setBankTransactionCode] = useState<string>("");
  const [proofFile, setProofFile] = useState<string>("");
  const [note, setNote] = useState<string>("");
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setProofFile(e.target.files[0].name);
      if (errors.proofFile) setErrors((prev) => ({ ...prev, proofFile: "" }));
    }
  };

  const handleSubmit = () => {
    const newErrors: { [key: string]: string } = {};
    if (!transactionDate) newErrors.transactionDate = "Vui lòng chọn ngày giao dịch";
    if (paymentMethod === "CHUYEN_KHOAN" && !bankTransactionCode.trim()) {
      newErrors.bankTransactionCode = "Vui lòng nhập mã giao dịch khi chuyển khoản";
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return false;
    }

    const transaction: PaymentTransaction = {
      paymentSlipCode: slip.code,
      type: transactionType,
      direction: transactionDirection,
      amount,
      paymentMethod,
      transactionDate,
      bankTransactionCode: paymentMethod === "CHUYEN_KHOAN" ? bankTransactionCode : undefined,
      proofFile: proofFile || undefined,
      note: note || undefined,
      status: "DA_THANH_TOAN",
      createdAt: new Date().toISOString(),
    };

    onSubmit(transaction);
    return true;
  };

  return {
    state: {
      isRefund,
      amount,
      paymentMethod,
      transactionDate,
      bankTransactionCode,
      proofFile,
      note,
      errors,
    },
    actions: {
      setPaymentMethod,
      setTransactionDate,
      setBankTransactionCode,
      setProofFile,
      setNote,
      setErrors,
      handleFileChange,
      handleSubmit,
    },
  };
}

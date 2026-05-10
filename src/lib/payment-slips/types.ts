export type PaymentSlipStatus =
  | "pendingAccounting"
  | "calculated"
  | "customerConfirmed"
  | "waitingDepositRefund"
  | "waitingExtraPayment"
  | "partiallyPaid"
  | "noTransaction"
  | "needReview"
  | "completedRefund"
  | "completedExtraPayment";

export type PaymentQueue = "all" | "refund" | "debt" | "completed";

export type PaymentSlipStatusFilter = PaymentSlipStatus | "all" | "completed";

export type RefundPolicyCode =
  | "unsignedContract"
  | "underSixMonths"
  | "overSixMonths"
  | "expiredContract";

export type RefundPolicy = {
  code: RefundPolicyCode;
  label: string;
  rate: number;
};

export type PaymentCalculation = {
  refundPolicy: RefundPolicyCode;
  unpaidRent: number;
  electricityFee: number;
  waterFee: number;
  serviceFee: number;
  compensationFee: number;
  violationPenalty: number;
  adjustment: number;
  adjustmentReason: string;
};

export type ExtraPaymentSlip = {
  created: boolean;
  code?: string;
  createdAt?: string;
};

export type PaymentSlip = {
  id: string;
  code: string;
  returnTicketCode: string;
  status: PaymentSlipStatus;
  createdAt: string;
  contract: {
    code: string;
    tenantName: string;
    roomCode: string;
    bedCode: string;
    depositAmount: number;
    stayDurationMonths: number;
    stayDescription: string;
  };
  managerInspection: {
    hygieneStatus: "Đạt" | "Không đạt";
    assetStatus: string;
    estimatedCompensation: number;
    note: string;
  };
  calculation: PaymentCalculation;
  customerConfirmed: boolean;
  extraPaymentSlip: ExtraPaymentSlip;
  transaction?: PaymentTransaction; // Link the transaction to the slip
};

export type TransactionType = "HOAN_COC" | "THU_THEM";
export type TransactionDirection = "CHI_RA" | "THU_VAO";
export type PaymentMethod = "TIEN_MAT" | "CHUYEN_KHOAN";
export type TransactionStatus = "CHO_XAC_NHAN" | "DA_THANH_TOAN" | "THAT_BAI" | "HUY";

export type PaymentTransaction = {
  id?: string;
  code?: string;
  paymentSlipCode: string;
  type: TransactionType;
  direction: TransactionDirection;
  amount: number;
  paymentMethod: PaymentMethod;
  transactionDate: string;
  bankTransactionCode?: string;
  proofFile?: string;
  note?: string;
  status: TransactionStatus;
  createdAt?: string;
};

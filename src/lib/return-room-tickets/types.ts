export type ReturnTicketStatus =
  | "pendingManagerReview"
  | "reconciling"
  | "waitingAccounting"
  | "accountingResultReady"
  | "waitingCustomerConfirmation"
  | "customerConfirmed"
  | "needsRecheck"
  | "waitingDepositRefund"
  | "waitingExtraPayment"
  | "completed";

export type QueueKey =
  | "pendingReview"
  | "reconciling"
  | "waitingCustomer"
  | "needsRecheck"
  | "completed"
  | "all";

export type SortKey =
  | "newest"
  | "oldest"
  | "nearestReturn"
  | "urgentFirst";

export type TenantInfo = {
  name: string;
  phone: string;
  identityNumber: string;
  representative?: string;
};

export type ContractInfo = {
  code: string;
  startDate: string;
  endDate: string;
  status: string;
  depositAmount: number;
  stayStatus: string;
};

export type RoomInfo = {
  roomCode: string;
  bedCode: string;
  currentStatus: string;
  expectedReturnDate: string;
  actualReturnDate?: string;
};

export type HandoverAsset = {
  id: string;
  name: string;
  initialCondition: string;
  quantity: number;
  handedBy: string;
  handedAt: string;
};

export type Deduction = {
  id: string;
  description: string;
  amount: number;
  source: "manager" | "accounting";
};

export type ReconciliationInfo = {
  code: string;
  status: string;
  hygieneStatus: "passed" | "failed";
  keycardStatus: "complete" | "missing";
  hasDamageOrLoss: boolean;
  managerNotes: string;
  estimatedDeductions: Deduction[];
};

export type AccountingResult = {
  depositAmount: number;
  refundRate: number;
  baseRefund: number;
  totalDeductions: number;
  finalAmount: number;
  conclusion: string;
  deductions: Deduction[];
};

export type CustomerConfirmation = {
  status: "notStarted" | "agreed" | "disagreed";
  confirmedAt?: string;
  disagreementReason?: string;
};

export type RoomFinalization = {
  status: "notStarted" | "available" | "maintenance";
  note?: string;
  completedAt?: string;
};

export type ReturnRoomTicket = {
  id: string;
  code: string;
  createdAt: string;
  status: ReturnTicketStatus;
  priority: "normal" | "urgent" | "overdue";
  nextAction: string;
  saleNote: string;
  tenant: TenantInfo;
  contract: ContractInfo;
  room: RoomInfo;
  handoverAssets: HandoverAsset[];
  reconciliation?: ReconciliationInfo;
  accountingResult?: AccountingResult;
  customerConfirmation: CustomerConfirmation;
  roomFinalization: RoomFinalization;
};

export type AdvancedFilterState = {
  ticketCode: string;
  tenantName: string;
  contractCode: string;
  roomOrBed: string;
  status: ReturnTicketStatus | "all";
  fromDate: string;
  toDate: string;
};

export type ReturnTicketFilterState = AdvancedFilterState & {
  queue: QueueKey;
  search: string;
  sort: SortKey;
};

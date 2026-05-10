export type CheckInContractStatus =
  | "waitingCheckIn"
  | "contractCreated"
  | "ended"
  | "cancelled";

export type PaymentCycle = "monthly" | "quarterly";
export type ContractRentalType = "wholeRoom" | "beds";

export type ContractedBed = {
  id: string;
  bedCode: string;
  monthlyRent: number;
};

export type CheckInContractRecord = {
  id: string;
  depositCode: string;
  registrationCode: string;
  paymentCode: string;
  customer: {
    name: string;
    phone: string;
    identityNumber?: string;
    email?: string;
    dateOfBirth?: string;
    gender?: string;
  };
  room: {
    roomCode: string;
    roomCapacity: number;
    contractedBeds: ContractedBed[];
    roomStatus: "ready" | "cleaning" | "maintenance";
  };
  expectedOccupantCount: number;
  occupants: ContractOccupant[];
  depositAmount: number;
  monthlyRent: number;
  serviceFee: number;
  expectedMoveInDate: string;
  depositedAt: string;
  status: CheckInContractStatus;
  note: string;
  contract?: {
    id: string;
    code: string;
    startDate: string;
    endDate?: string;
    paymentCycle: PaymentCycle;
    rentalType: ContractRentalType;
    status: "active" | "cancelled" | "ended";
    returnTicket?: {
      id: string;
      code: string;
      status: string;
    };
  };
};

export type ContractOccupant = {
  id: string;
  fullName: string;
  identityNumber: string;
  gender: "male" | "female" | "other" | "";
  dateOfBirth: string;
  nationality: string;
  isRepresentative: boolean;
};

export type CheckInContractFilterState = {
  search: string;
  status: CheckInContractStatus | "all";
};

export type ContractDraft = {
  customerName: string;
  phone: string;
  identityNumber: string;
  roomCode: string;
  roomCapacity: number;
  bedCodes: string[];
  rentalType: ContractRentalType;
  startDate: string;
  paymentCycle: PaymentCycle;
  depositAmount: string;
  monthlyRent: string;
  serviceFee: string;
  occupants: ContractOccupant[];
  checkInConfirmed: boolean;
  roomConditionConfirmed: boolean;
  documentConfirmed: boolean;
  note: string;
};

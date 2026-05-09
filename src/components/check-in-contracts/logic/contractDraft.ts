import type {
  CheckInContractRecord,
  ContractDraft,
} from "@/lib/check-in-contracts/types";
import { getContractRentalType } from "./contractScope";

export function createContractDraftFromRecord(
  record: CheckInContractRecord,
): ContractDraft {
  // Always ensure we have at least one occupant (the representative)
  // If record.occupants exists and has data, use it; otherwise create a default representative
  const mapGender = (gender?: string): "male" | "female" | "other" | "" => {
    if (!gender) return "";
    const normalized = gender.toLowerCase();
    if (normalized === "male" || normalized === "nam") return "male";
    if (normalized === "female" || normalized === "nữ" || normalized === "nu") return "female";
    return "other";
  };

  const occupants =
    record.occupants.length > 0
      ? record.occupants
      : [
          {
            id: `${record.id}-representative`,
            fullName: record.customer.name,
            identityNumber: record.customer.identityNumber ?? "",
            gender: mapGender(record.customer.gender),
            dateOfBirth: record.customer.dateOfBirth 
              ? record.customer.dateOfBirth.split('T')[0]  // Convert ISO to YYYY-MM-DD
              : "",
            nationality: "Việt Nam",
            isRepresentative: true,
          },
        ];

  return {
    customerName: record.customer.name,
    phone: record.customer.phone,
    identityNumber: record.customer.identityNumber ?? "",
    roomCode: record.room.roomCode,
    roomCapacity: record.room.roomCapacity,
    bedCodes: record.room.contractedBeds.map((bed) => bed.bedCode),
    rentalType: record.contract?.rentalType ?? getContractRentalType(record),
    startDate: record.contract?.startDate ?? record.expectedMoveInDate,
    paymentCycle: record.contract?.paymentCycle ?? "monthly",
    depositAmount: String(record.depositAmount),
    monthlyRent: String(record.monthlyRent),
    serviceFee: String(record.serviceFee),
    occupants,
    checkInConfirmed: record.status === "contractCreated",
    roomConditionConfirmed:
      record.status === "contractCreated" || record.room.roomStatus === "ready",
    documentConfirmed: record.status === "contractCreated",
    note: record.note,
  };
}

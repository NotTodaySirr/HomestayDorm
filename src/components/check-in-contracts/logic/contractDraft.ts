import type {
  CheckInContractRecord,
  ContractDraft,
} from "@/lib/check-in-contracts/types";
import { getContractRentalType } from "./contractScope";

export function createContractDraftFromRecord(
  record: CheckInContractRecord,
): ContractDraft {
  const mapGender = (gender?: string): "male" | "female" | "other" | "" => {
    if (!gender) return "";

    const normalized = gender.trim().toLowerCase();
    if (["male", "nam", "m"].includes(normalized)) return "male";
    if (["female", "nữ", "nu", "f"].includes(normalized)) return "female";

    return "other";
  };

  const toDateInputValue = (date?: string) => {
    if (!date) return "";
    return date.split("T")[0];
  };

  const occupants =
    record.occupants.length > 0
      ? record.occupants.map((occupant) => ({
          ...occupant,
          gender: mapGender(occupant.gender),
          dateOfBirth: toDateInputValue(occupant.dateOfBirth),
          nationality: occupant.nationality || "Việt Nam",
        }))
      : [
          {
            id: `${record.id}-representative`,
            fullName: record.customer.name,
            identityNumber: record.customer.identityNumber ?? "",
            gender: mapGender(record.customer.gender),
            dateOfBirth: toDateInputValue(record.customer.dateOfBirth),
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
    startDate: toDateInputValue(record.contract?.startDate ?? record.expectedMoveInDate),
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

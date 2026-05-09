import type {
  CheckInContractRecord,
  ContractRentalType,
} from "@/lib/check-in-contracts/types";

export function getContractRentalType(
  record: CheckInContractRecord,
): ContractRentalType {
  return record.room.contractedBeds.length >= record.room.roomCapacity
    ? "wholeRoom"
    : "beds";
}

export function getRentalTypeLabel(rentalType: ContractRentalType) {
  return rentalType === "wholeRoom" ? "Thuê nguyên phòng" : "Thuê theo giường";
}

export function formatContractedBeds(record: CheckInContractRecord) {
  return record.room.contractedBeds.map((bed) => bed.bedCode).join(", ");
}

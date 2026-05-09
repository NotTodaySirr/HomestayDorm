import type {
  CheckInContractFilterState,
  CheckInContractRecord,
} from "@/lib/check-in-contracts/types";

export const defaultFilterState: CheckInContractFilterState = {
  search: "",
  status: "waitingCheckIn",
};

export function filterCheckInContractRecords(
  records: CheckInContractRecord[],
  filters: CheckInContractFilterState,
) {
  const search = filters.search.trim().toLowerCase();

  return records.filter((record) => {
    const matchesStatus =
      filters.status === "all" || record.status === filters.status;

    if (!matchesStatus) {
      return false;
    }

    if (!search) {
      return true;
    }

    return [
      record.depositCode,
      record.customer.name,
      record.customer.phone,
      record.customer.identityNumber,
      record.room.roomCode,
      ...record.room.contractedBeds.map((bed) => bed.bedCode),
      record.registrationCode,
      record.paymentCode,
      record.contract?.code,
    ]
      .filter(Boolean)
      .some((value) => value!.toLowerCase().includes(search));
  });
}

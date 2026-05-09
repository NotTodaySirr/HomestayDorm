import type { CheckInContractRecord } from "@/lib/check-in-contracts/types";

export function getEffectiveSelectedRecordId(
  visibleRecords: CheckInContractRecord[],
  selectedRecordId: string | null,
) {
  if (visibleRecords.length === 0) {
    return null;
  }

  if (selectedRecordId && visibleRecords.some((record) => record.id === selectedRecordId)) {
    return selectedRecordId;
  }

  return visibleRecords[0].id;
}

export function getSelectedRecord(
  records: CheckInContractRecord[],
  selectedRecordId: string | null,
) {
  if (!selectedRecordId) {
    return null;
  }

  return records.find((record) => record.id === selectedRecordId) ?? null;
}

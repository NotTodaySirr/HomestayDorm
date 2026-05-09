"use client";

import { useMemo, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type {
  CheckInContractFilterState,
  CheckInContractRecord,
  ContractDraft,
} from "@/lib/check-in-contracts/types";
import type { ScreenMode } from "../types";
import { createContractDraftFromRecord } from "../logic/contractDraft";
import {
  defaultFilterState,
  filterCheckInContractRecords,
} from "../logic/filters";
import {
  getEffectiveSelectedRecordId,
  getSelectedRecord,
} from "../logic/selection";

export function useCheckInContractsWorkspace(
  initialRecords: CheckInContractRecord[],
) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [records, setRecords] = useState(initialRecords);
  const [filters, setFilters] =
    useState<CheckInContractFilterState>(defaultFilterState);
  const [selectedRecordId, setSelectedRecordId] = useState<string | null>(
    initialRecords[0]?.id ?? null,
  );
  const [screenMode, setScreenMode] = useState<ScreenMode>("list");
  const [draft, setDraft] = useState<ContractDraft | null>(
    initialRecords[0] ? createContractDraftFromRecord(initialRecords[0]) : null,
  );
  const [notice, setNotice] = useState<string | null>(null);
  const [returnTicketModalOpen, setReturnTicketModalOpen] = useState(false);
  const [returnTicketSubmitting, setReturnTicketSubmitting] = useState(false);
  const [returnTicketError, setReturnTicketError] = useState<string | null>(null);

  // Sync with URL on mount
  useEffect(() => {
    const idFromUrl = searchParams.get('id');
    if (idFromUrl && records.find(r => r.id === idFromUrl)) {
      setSelectedRecordId(idFromUrl);
      setScreenMode('detail');
      const record = records.find(r => r.id === idFromUrl);
      if (record) {
        setDraft(createContractDraftFromRecord(record));
      }
    }
  }, [searchParams, records]);

  const visibleRecords = useMemo(
    () => filterCheckInContractRecords(records, filters),
    [filters, records],
  );
  const effectiveSelectedRecordId = useMemo(
    () => getEffectiveSelectedRecordId(visibleRecords, selectedRecordId),
    [selectedRecordId, visibleRecords],
  );
  const selectedRecord = useMemo(
    () => getSelectedRecord(records, effectiveSelectedRecordId),
    [effectiveSelectedRecordId, records],
  );

  function setSearch(search: string) {
    setFilters((current) => ({ ...current, search }));
  }

  function setStatus(status: CheckInContractFilterState["status"]) {
    setFilters((current) => ({ ...current, status }));
    setScreenMode("list");
  }

  function selectRecord(recordId: string) {
    const record = records.find((item) => item.id === recordId);

    setSelectedRecordId(recordId);
    setScreenMode("detail");
    setDraft(record ? createContractDraftFromRecord(record) : null);
    setNotice(null);
    
    // Update URL
    router.push(`?id=${recordId}`, { scroll: false });
  }

  function showList() {
    setScreenMode("list");
    setNotice(null);
    
    // Clear URL parameter
    router.push('?', { scroll: false });
  }

  function showDetail() {
    setScreenMode("detail");
    
    // Ensure URL has the selected record ID
    if (selectedRecordId) {
      router.push(`?id=${selectedRecordId}`, { scroll: false });
    }
  }

  function startContractForm() {
    if (!selectedRecord) {
      return;
    }

    setDraft(createContractDraftFromRecord(selectedRecord));
    setScreenMode("form");
  }

  function cancelContractForm() {
    if (selectedRecord) {
      setDraft(createContractDraftFromRecord(selectedRecord));
    }

    setScreenMode("detail");
  }

  function updateDraft(nextDraft: ContractDraft) {
    setDraft(nextDraft);
  }

  async function completeContractCreation() {
    if (!selectedRecord || !draft) {
      return;
    }

    // Call the server action to create the contract
    const { createContractFromDeposit } = await import('@/actions/check-in-contracts');
    
    // Transform draft to match server action input
    const result = await createContractFromDeposit(selectedRecord.id, {
      startDate: new Date(draft.startDate),
      endDate: undefined, // Not captured in current form
      paymentCycle: draft.paymentCycle.toUpperCase() as 'MONTHLY' | 'QUARTERLY',
      depositAmount: Number(draft.depositAmount),
      monthlyRent: Number(draft.monthlyRent),
      serviceFee: Number(draft.serviceFee),
      note: draft.note,
      checkInConfirmed: draft.checkInConfirmed,
      roomConditionConfirmed: draft.roomConditionConfirmed,
      documentConfirmed: draft.documentConfirmed,
      occupants: draft.occupants.map((occupant) => ({
        fullName: occupant.fullName,
        identityNumber: occupant.identityNumber,
        gender: occupant.gender.toUpperCase() as 'MALE' | 'FEMALE' | 'OTHER',
        dateOfBirth: new Date(occupant.dateOfBirth),
        nationality: occupant.nationality || 'Việt Nam',
        isRepresentative: occupant.isRepresentative,
      })),
    });

    if (result.success) {
      // Update local state to reflect the contract was created
      setRecords((currentRecords) =>
        currentRecords.map((record) =>
          record.id === selectedRecord.id
            ? {
                ...record,
                status: 'contractCreated' as const,
                contract: {
                  id: result.contractId ?? selectedRecord.contract?.id ?? "",
                  code: `HD${String(currentRecords.length + 1).padStart(3, '0')}`,
                  startDate: draft.startDate,
                  paymentCycle: draft.paymentCycle,
                  rentalType: draft.rentalType,
                  status: "active" as const,
                },
              }
            : record,
        ),
      );
      setScreenMode('detail');
      setNotice('Đã hoàn tất nhận phòng và lập hợp đồng cho khách.');
    } else {
      // Show error message
      setNotice(`Lỗi: ${result.error || 'Không thể tạo hợp đồng'}`);
    }
  }

  function openReturnTicketModal() {
    setReturnTicketError(null);
    setReturnTicketModalOpen(true);
  }

  function closeReturnTicketModal() {
    if (!returnTicketSubmitting) {
      setReturnTicketModalOpen(false);
      setReturnTicketError(null);
    }
  }

  async function completeReturnTicketCreation(input: { expectedReturnDate: string; saleNote: string }) {
    if (!selectedRecord?.contract) return;

    setReturnTicketSubmitting(true);
    setReturnTicketError(null);

    const { createReturnRoomTicketFromContract } = await import('@/actions/check-in-contracts');
    const result = await createReturnRoomTicketFromContract(selectedRecord.contract.id, {
      expectedReturnDate: new Date(input.expectedReturnDate),
      saleNote: input.saleNote,
    });

    setReturnTicketSubmitting(false);

    if (!result.success) {
      setReturnTicketError(result.error || "Không thể tạo phiếu trả phòng");
      return;
    }

    setRecords((currentRecords) =>
      currentRecords.map((record) =>
        record.id === selectedRecord.id && record.contract
          ? {
              ...record,
              contract: {
                ...record.contract,
                returnTicket: {
                  id: result.ticketId ?? "",
                  code: result.ticketCode ?? "PTP",
                  status: "PENDING_MANAGER_REVIEW",
                },
              },
            }
          : record,
      ),
    );
    setReturnTicketModalOpen(false);
    setNotice(`Đã tạo phiếu trả phòng ${result.ticketCode ?? ""}.`);
  }

  return {
    state: {
      filters,
      visibleRecords,
      selectedRecord,
      effectiveSelectedRecordId,
      screenMode,
      draft,
      notice,
      returnTicketModalOpen,
      returnTicketSubmitting,
      returnTicketError,
    },
    actions: {
      setSearch,
      setStatus,
      selectRecord,
      showList,
      showDetail,
      startContractForm,
      cancelContractForm,
      updateDraft,
      completeContractCreation,
      openReturnTicketModal,
      closeReturnTicketModal,
      completeReturnTicketCreation,
    },
  };
}

function createContractCode() {
  return `HD-${new Date().getFullYear()}-${String(Date.now()).slice(-4)}`;
}

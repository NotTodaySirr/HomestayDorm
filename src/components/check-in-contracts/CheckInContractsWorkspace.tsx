"use client";

import { Toast } from "@/components/feedback/Toast";
import type { CheckInContractRecord } from "@/lib/check-in-contracts/types";
import { CheckInActionPanel } from "./CheckInActionPanel";
import { ContractFormPanel } from "./ContractFormPanel";
import { ContractListPanel } from "./ContractListPanel";
import { ContractToolbar } from "./ContractToolbar";
import { useCheckInContractsWorkspace } from "./hooks/useCheckInContractsWorkspace";

type CheckInContractsWorkspaceProps = {
  initialRecords: CheckInContractRecord[];
};

export function CheckInContractsWorkspace({
  initialRecords,
}: CheckInContractsWorkspaceProps) {
  const { state, actions } = useCheckInContractsWorkspace(initialRecords);
  const {
    filters,
    visibleRecords,
    selectedRecord,
    effectiveSelectedRecordId,
    screenMode,
    draft,
    notice,
  } = state;
  const {
    setSearch,
    setStatus,
    selectRecord,
    showList,
    startContractForm,
    cancelContractForm,
    updateDraft,
    completeContractCreation,
  } = actions;

  return (
    <div className="relative flex h-[calc(100dvh-76px)] w-full flex-col gap-3 sm:gap-4">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-[20px] font-bold tracking-tight text-[var(--color-on-surface)]">
            Quản lý hợp đồng
          </h1>
          <p className="mt-1 text-[12px] text-[var(--color-on-surface-secondary)]">
            Xử lý hồ sơ đã đặt cọc, xác nhận nhận phòng và tạo hợp đồng thuê.
          </p>
        </div>

        {screenMode === "list" ? (
          <ContractToolbar
            search={filters.search}
            status={filters.status}
            onSearchChange={setSearch}
            onStatusChange={setStatus}
          />
        ) : null}
      </header>

      {notice ? <Toast message={notice} variant="success" /> : null}

      <section className="flex min-h-0 flex-1 flex-col">
        {screenMode === "list" ? (
          <ContractListPanel
            records={visibleRecords}
            selectedRecordId={effectiveSelectedRecordId}
            onSelectRecord={selectRecord}
          />
        ) : null}

        {selectedRecord && screenMode === "form" && draft ? (
          <ContractFormPanel
            key={`${selectedRecord.id}-form`}
            record={selectedRecord}
            draft={draft}
            onDraftChange={updateDraft}
            onCancel={cancelContractForm}
            onSubmit={completeContractCreation}
          />
        ) : null}

        {screenMode === "detail" ? (
          <CheckInActionPanel
            record={selectedRecord}
            onBackToList={showList}
            onStartContractForm={startContractForm}
          />
        ) : null}
      </section>
    </div>
  );
}

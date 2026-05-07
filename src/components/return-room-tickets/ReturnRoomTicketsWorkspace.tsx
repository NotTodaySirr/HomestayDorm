"use client";

import { Toast } from "@/components/feedback/Toast";
import type { ReturnRoomTicket } from "@/lib/return-room-tickets/types";
import { useReturnRoomTicketsWorkspace } from "./hooks/useReturnRoomTicketsWorkspace";
import { TicketDetailPanel } from "./TicketDetailPanel";
import { TicketListPanel } from "./TicketListPanel";
import { TicketToolbar } from "./TicketToolbar";
import {
  ReconciliationFormPanel,
  RoomStatusUpdatePanel,
} from "./WorkflowPanels";

type ReturnRoomTicketsWorkspaceProps = {
  initialTickets: ReturnRoomTicket[];
};

export function ReturnRoomTicketsWorkspace({
  initialTickets,
}: ReturnRoomTicketsWorkspaceProps) {
  const {
    filters,
    visibleTickets,
    queueCounts,
    selectedTicket,
    effectiveSelectedTicketId,
    activePanelMode,
    notice,
    setQueue,
    setSearch,
    setSort,
    setAdvancedFilters,
    selectTicket,
    showDetailPanel,
    showReconciliationPanel,
    showRoomUpdatePanel,
    completeReconciliation,
    markCustomerAgreed,
    markCustomerDisagreed,
    completeRoomUpdate,
  } = useReturnRoomTicketsWorkspace(initialTickets);

  return (
    <div className="flex w-full flex-col gap-3 sm:gap-4 xl:h-full">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-[20px] font-bold tracking-tight text-[var(--color-on-surface)]">
          Quản lý phiếu trả phòng
        </h1>

        <TicketToolbar
          queue={filters.queue}
          search={filters.search}
          sort={filters.sort}
          advancedFilters={{
            ticketCode: filters.ticketCode,
            tenantName: filters.tenantName,
            contractCode: filters.contractCode,
            roomOrBed: filters.roomOrBed,
            status: filters.status,
            fromDate: filters.fromDate,
            toDate: filters.toDate,
          }}
          onSearchChange={setSearch}
          onSortChange={setSort}
          onAdvancedFiltersChange={setAdvancedFilters}
        />
      </header>

      {notice ? <Toast message={notice} variant="success" /> : null}

      <section className="grid flex-1 grid-cols-1 gap-3 xl:min-h-0 xl:grid-cols-[1.3fr_1fr]">
        <TicketListPanel
          tickets={visibleTickets}
          activeQueue={filters.queue}
          sort={filters.sort}
          queueCounts={queueCounts}
          onQueueChange={setQueue}
          selectedTicketId={effectiveSelectedTicketId}
          onSelectTicket={selectTicket}
        />

        {selectedTicket && activePanelMode === "reconciliation" ? (
          <ReconciliationFormPanel
            key={`${selectedTicket.id}-reconciliation`}
            ticket={selectedTicket}
            onCancel={showDetailPanel}
            onSubmit={completeReconciliation}
          />
        ) : null}

        {selectedTicket && activePanelMode === "roomUpdate" ? (
          <RoomStatusUpdatePanel
            key={`${selectedTicket.id}-room-update`}
            ticket={selectedTicket}
            onCancel={showDetailPanel}
            onSubmit={completeRoomUpdate}
          />
        ) : null}

        {activePanelMode === "detail" ? (
          <TicketDetailPanel
            ticket={selectedTicket}
            onStartReconciliation={showReconciliationPanel}
            onStartRoomUpdate={showRoomUpdatePanel}
            onCustomerAgreed={markCustomerAgreed}
            onCustomerDisagreed={markCustomerDisagreed}
          />
        ) : null}
      </section>
    </div>
  );
}

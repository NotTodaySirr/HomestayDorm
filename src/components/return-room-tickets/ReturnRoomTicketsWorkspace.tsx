"use client";

import { Toast } from "@/components/feedback/Toast";
import { canUpdateRoomBeds } from "./logic/roomBedFinalization";
import type { ReturnRoomTicket } from "@/lib/return-room-tickets/types";
import { useReturnRoomTicketsWorkspace } from "./hooks/useReturnRoomTicketsWorkspace";
import { RoomBedUpdateModal } from "./RoomBedUpdateModal";
import { TicketDetailPanel } from "./TicketDetailPanel";
import { TicketListPanel } from "./TicketListPanel";
import { TicketToolbar } from "./TicketToolbar";
import { ReconciliationFormPanel } from "./WorkflowPanels";

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
    noticeVariant,
    roomBedModalOpen,
    isSubmittingReconciliation,
    setQueue,
    setSearch,
    // setSort, // No longer used in Toolbar
    // setAdvancedFilters, // No longer used in Toolbar
    selectTicket,
    showDetailPanel,
    showReconciliationPanel,
    openRoomBedModal,
    closeRoomBedModal,
    completeReconciliation,
    markCustomerAgreed,
    markCustomerDisagreed,
    completeRoomBedUpdate,
  } = useReturnRoomTicketsWorkspace(initialTickets);

  return (
    <div className="relative flex h-[calc(100dvh-96px)] min-h-0 w-full flex-col gap-3 overflow-hidden sm:h-[calc(100dvh-104px)] sm:gap-4">
      <header className="flex shrink-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-[20px] font-bold tracking-tight text-[var(--color-on-surface)]">
          Quản lý phiếu trả phòng
        </h1>

        <TicketToolbar
          search={filters.search}
          onSearchChange={setSearch}
        />
      </header>

      {notice ? <Toast message={notice} variant={noticeVariant} /> : null}

      <section className="grid min-h-0 flex-1 grid-cols-1 gap-3 overflow-hidden lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
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
            isSubmitting={isSubmittingReconciliation}
          />
        ) : null}

        {activePanelMode === "detail" ? (
          <TicketDetailPanel
            ticket={selectedTicket}
            onStartReconciliation={showReconciliationPanel}
            onStartRoomUpdate={openRoomBedModal}
            onCustomerAgreed={markCustomerAgreed}
            onCustomerDisagreed={markCustomerDisagreed}
          />
        ) : null}
      </section>

      {selectedTicket && roomBedModalOpen && canUpdateRoomBeds(selectedTicket) ? (
        <RoomBedUpdateModal
          key={`${selectedTicket.id}-room-bed-modal`}
          ticket={selectedTicket}
          open={roomBedModalOpen}
          onClose={closeRoomBedModal}
          onSubmit={completeRoomBedUpdate}
        />
      ) : null}
    </div>
  );
}

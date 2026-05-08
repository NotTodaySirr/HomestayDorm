import { useMemo, useState } from "react";
import { returnRoomTicketToastMessages } from "@/components/feedback/toastMessages";
import {
  countTicketsByQueue,
  defaultFilterState,
  filterTickets,
} from "@/lib/return-room-tickets/filters";
import type {
  AdvancedFilterState,
  QueueKey,
  ReturnRoomTicket,
  RoomBedUpdateSubmission,
  SortKey,
} from "@/lib/return-room-tickets/types";
import {
  getEffectiveSelectedTicketId,
  getSelectedTicket,
} from "../logic/ticketSelection";
import {
  applyCustomerAgreement,
  applyCustomerDisagreement,
  applyReconciliationSubmission,
  applyRoomBedUpdateSubmission,
} from "../logic/ticketWorkflowActions";
import type { PanelMode } from "../types";
import type { ReconciliationSubmission } from "../WorkflowPanels";

export function useReturnRoomTicketsWorkspace(
  initialTickets: ReturnRoomTicket[],
) {
  const [tickets, setTickets] = useState(initialTickets);
  const [filters, setFilters] = useState(defaultFilterState);
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(
    initialTickets[0]?.id ?? null,
  );
  const [panelMode, setPanelMode] = useState<PanelMode>("detail");
  const [notice, setNotice] = useState<string | null>(null);
  const [roomBedModalOpen, setRoomBedModalOpen] = useState(false);

  const visibleTickets = useMemo(
    () => filterTickets(tickets, filters),
    [filters, tickets],
  );
  const queueCounts = useMemo(() => countTicketsByQueue(tickets), [tickets]);
  const effectiveSelectedTicketId = useMemo(
    () => getEffectiveSelectedTicketId(visibleTickets, selectedTicketId),
    [selectedTicketId, visibleTickets],
  );
  const selectedTicket = useMemo(
    () => getSelectedTicket(tickets, effectiveSelectedTicketId),
    [effectiveSelectedTicketId, tickets],
  );
  const activePanelMode = selectedTicket ? panelMode : "detail";

  function setQueue(queue: QueueKey) {
    setFilters((current) => ({
      ...current,
      queue,
      status: queue === "all" ? current.status : "all",
    }));
    showDetailPanel();
  }

  function setSearch(search: string) {
    setFilters((current) => ({ ...current, search }));
  }

  function setSort(sort: SortKey) {
    setFilters((current) => ({ ...current, sort }));
  }

  function setAdvancedFilters(advancedFilters: AdvancedFilterState) {
    setFilters((current) => ({
      ...current,
      ...advancedFilters,
    }));
  }

  function selectTicket(ticketId: string) {
    setSelectedTicketId(ticketId);
    showDetailPanel();
    closeRoomBedModal();
    setNotice(null);
  }

  function showDetailPanel() {
    setPanelMode("detail");
  }

  function showReconciliationPanel() {
    setPanelMode("reconciliation");
  }

  function openRoomBedModal() {
    setRoomBedModalOpen(true);
  }

  function closeRoomBedModal() {
    setRoomBedModalOpen(false);
  }

  function updateSelectedTicket(
    updater: (ticket: ReturnRoomTicket) => ReturnRoomTicket,
  ) {
    if (!selectedTicket) {
      return;
    }

    setTickets((currentTickets) =>
      currentTickets.map((ticket) =>
        ticket.id === selectedTicket.id ? updater(ticket) : ticket,
      ),
    );
  }

  function completeReconciliation(submission: ReconciliationSubmission) {
    const completedAt = getToday();
    updateSelectedTicket((ticket) =>
      applyReconciliationSubmission(ticket, submission, completedAt),
    );
    showDetailPanel();
    setNotice(returnRoomTicketToastMessages.reconciliationCompleted);
  }

  function markCustomerAgreed() {
    updateSelectedTicket((ticket) => applyCustomerAgreement(ticket, getToday()));
    setNotice(returnRoomTicketToastMessages.customerAgreed);
  }

  function markCustomerDisagreed() {
    updateSelectedTicket(applyCustomerDisagreement);
    setNotice(returnRoomTicketToastMessages.customerDisagreed);
  }

  function completeRoomBedUpdate(submission: RoomBedUpdateSubmission) {
    const completedAt = getToday();
    updateSelectedTicket((ticket) =>
      applyRoomBedUpdateSubmission(ticket, submission, completedAt),
    );
    closeRoomBedModal();
    showDetailPanel();
    setNotice(returnRoomTicketToastMessages.roomUpdateCompleted);
  }

  return {
    filters,
    visibleTickets,
    queueCounts,
    selectedTicket,
    effectiveSelectedTicketId,
    activePanelMode,
    notice,
    roomBedModalOpen,
    setQueue,
    setSearch,
    setSort,
    setAdvancedFilters,
    selectTicket,
    showDetailPanel,
    showReconciliationPanel,
    openRoomBedModal,
    closeRoomBedModal,
    completeReconciliation,
    markCustomerAgreed,
    markCustomerDisagreed,
    completeRoomBedUpdate,
  };
}

function getToday() {
  return new Date().toISOString().slice(0, 10);
}

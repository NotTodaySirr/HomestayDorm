import { useMemo, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  confirmReturnRoomCustomerResponse,
  createReconciliationTicket,
  finalizeReturnRoomStatus,
} from "@/actions/check-in-contracts";
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
import type { PanelMode } from "../types";
import type { ReconciliationSubmission } from "../WorkflowPanels";

export function useReturnRoomTicketsWorkspace(
  initialTickets: ReturnRoomTicket[],
) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const urlTicketId = searchParams.get("id");

  const [tickets, setTickets] = useState(initialTickets);
  const [filters, setFilters] = useState(defaultFilterState);
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(
    urlTicketId ?? initialTickets[0]?.id ?? null,
  );
  const [panelMode, setPanelMode] = useState<PanelMode>("detail");
  const [notice, setNotice] = useState<string | null>(null);
  const [noticeVariant, setNoticeVariant] = useState<"success" | "error">(
    "success",
  );
  const [roomBedModalOpen, setRoomBedModalOpen] = useState(false);
  const [isSubmittingWorkflow, startWorkflowTransition] = useTransition();

  // Sync state back to URL
  function updateUrl(ticketId: string | null) {
    const params = new URLSearchParams(searchParams.toString());
    if (ticketId) {
      params.set("id", ticketId);
    } else {
      params.delete("id");
    }
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  }

  const visibleTickets = useMemo(
    () => filterTickets(tickets, filters),
    [filters, tickets],
  );
  const queueCounts = useMemo(() => countTicketsByQueue(tickets), [tickets]);
  const requestedSelectedTicketId = urlTicketId ?? selectedTicketId;
  const effectiveSelectedTicketId = useMemo(
    () => getEffectiveSelectedTicketId(visibleTickets, requestedSelectedTicketId),
    [requestedSelectedTicketId, visibleTickets],
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
    updateUrl(ticketId);
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

  function replaceTicket(updatedTicket: ReturnRoomTicket) {
    setTickets((currentTickets) =>
      currentTickets.map((ticket) =>
        ticket.id === updatedTicket.id ? updatedTicket : ticket,
      ),
    );
  }

  function completeReconciliation(submission: ReconciliationSubmission) {
    if (!selectedTicket) {
      return;
    }

    startWorkflowTransition(async () => {
      const result = await createReconciliationTicket(selectedTicket.id, {
        hygieneStatus: submission.hygieneStatus,
        keycardStatus: submission.keycardStatus,
        hasDamageOrLoss: submission.hasDamageOrLoss,
        damageDescription: submission.damageDescription,
        estimatedCost: submission.estimatedCost,
        managerNotes: submission.managerNotes,
      });

      if (!result.success || !result.ticket) {
        setNoticeVariant("error");
        setNotice(result.error ?? "Không thể lập phiếu thanh toán.");
        return;
      }

      replaceTicket(result.ticket);
      showDetailPanel();
      setNoticeVariant("success");
      setNotice(returnRoomTicketToastMessages.reconciliationCompleted);
    });
  }

  function markCustomerAgreed() {
    if (!selectedTicket) return;

    startWorkflowTransition(async () => {
      const result = await confirmReturnRoomCustomerResponse(selectedTicket.id, true);

      if (!result.success || !result.ticket) {
        setNoticeVariant("error");
        setNotice(result.error ?? "Không thể xác nhận đồng ý.");
        return;
      }

      replaceTicket(result.ticket);
      setNoticeVariant("success");
      setNotice(returnRoomTicketToastMessages.customerAgreed);
    });
  }

  function markCustomerDisagreed() {
    if (!selectedTicket) return;

    startWorkflowTransition(async () => {
      const result = await confirmReturnRoomCustomerResponse(selectedTicket.id, false);

      if (!result.success || !result.ticket) {
        setNoticeVariant("error");
        setNotice(result.error ?? "Không thể xác nhận không đồng ý.");
        return;
      }

      replaceTicket(result.ticket);
      setNoticeVariant("success");
      setNotice(returnRoomTicketToastMessages.customerDisagreed);
    });
  }

  function completeRoomBedUpdate(submission: RoomBedUpdateSubmission) {
    if (!selectedTicket) return;

    startWorkflowTransition(async () => {
      const result = await finalizeReturnRoomStatus(selectedTicket.id, submission);

      if (!result.success || !result.ticket) {
        setNoticeVariant("error");
        setNotice(result.error ?? "Không thể cập nhật trạng thái phòng.");
        return;
      }

      replaceTicket(result.ticket);
      closeRoomBedModal();
      showDetailPanel();
      setNoticeVariant("success");
      setNotice(returnRoomTicketToastMessages.roomUpdateCompleted);
    });
  }

  return {
    filters,
    visibleTickets,
    queueCounts,
    selectedTicket,
    effectiveSelectedTicketId,
    activePanelMode,
    notice,
    noticeVariant,
    roomBedModalOpen,
    isSubmittingReconciliation: isSubmittingWorkflow,
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

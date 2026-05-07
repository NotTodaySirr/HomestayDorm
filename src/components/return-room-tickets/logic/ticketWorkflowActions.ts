import type { ReturnRoomTicket } from "@/lib/return-room-tickets/types";
import type {
  ReconciliationSubmission,
  RoomStatusSubmission,
} from "../WorkflowPanels";

export function applyReconciliationSubmission(
  ticket: ReturnRoomTicket,
  submission: ReconciliationSubmission,
  completedAt: string,
): ReturnRoomTicket {
  return {
    ...ticket,
    status: "waitingAccounting",
    nextAction: "Theo dÃµi káº¿ toÃ¡n xá»­ lÃ½",
    reconciliation: {
      code: ticket.reconciliation?.code ?? createReconciliationCode(ticket),
      status: "Chá» káº¿ toÃ¡n xá»­ lÃ½",
      hygieneStatus: submission.hygieneStatus,
      keycardStatus: submission.keycardStatus,
      hasDamageOrLoss: submission.hasDamageOrLoss,
      managerNotes: submission.managerNotes || "KhÃ´ng cÃ³ ghi chÃº thÃªm.",
      estimatedDeductions:
        submission.estimatedCost > 0 || submission.damageDescription
          ? [
              {
                id: `${ticket.id}-manager-deduction-${completedAt}`,
                description:
                  submission.damageDescription || "Khoáº£n kháº¥u trá»« quáº£n lÃ½",
                amount: submission.estimatedCost,
                source: "manager",
              },
            ]
          : [],
    },
  };
}

export function applyCustomerAgreement(
  ticket: ReturnRoomTicket,
  confirmedAt: string,
): ReturnRoomTicket {
  return {
    ...ticket,
    status: "customerConfirmed",
    nextAction: "Cáº­p nháº­t phÃ²ng/giÆ°á»ng",
    customerConfirmation: {
      status: "agreed",
      confirmedAt,
    },
  };
}

export function applyCustomerDisagreement(
  ticket: ReturnRoomTicket,
): ReturnRoomTicket {
  return {
    ...ticket,
    status: "needsRecheck",
    nextAction: "Kiá»ƒm tra láº¡i khoáº£n Ä‘á»‘i soÃ¡t",
    reconciliation: ticket.reconciliation
      ? {
          ...ticket.reconciliation,
          status: "Cáº§n kiá»ƒm tra láº¡i",
        }
      : ticket.reconciliation,
    customerConfirmation: {
      status: "disagreed",
      disagreementReason: "KhÃ¡ch yÃªu cáº§u kiá»ƒm tra láº¡i khoáº£n kháº¥u trá»«.",
    },
  };
}

export function applyRoomStatusSubmission(
  ticket: ReturnRoomTicket,
  submission: RoomStatusSubmission,
  completedAt: string,
): ReturnRoomTicket {
  return {
    ...ticket,
    status: "completed",
    nextAction: "KhÃ´ng cÃ²n hÃ nh Ä‘á»™ng báº¯t buá»™c",
    contract: {
      ...ticket.contract,
      status: "ÄÃ£ thanh lÃ½",
      stayStatus: "ÄÃ£ tráº£ phÃ²ng",
    },
    room: {
      ...ticket.room,
      currentStatus:
        submission.finalStatus === "available" ? "Trá»‘ng" : "Cáº§n báº£o trÃ¬",
      actualReturnDate: completedAt,
    },
    roomFinalization: {
      status: submission.finalStatus,
      note: submission.note,
      completedAt,
    },
  };
}

export function createReconciliationCode(ticket: ReturnRoomTicket) {
  return ticket.code.replace("PTP", "PDS");
}

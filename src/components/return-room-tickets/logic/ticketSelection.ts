import type { ReturnRoomTicket } from "@/lib/return-room-tickets/types";

export function getEffectiveSelectedTicketId(
  visibleTickets: ReturnRoomTicket[],
  selectedTicketId: string | null,
) {
  if (visibleTickets.length === 0) {
    return null;
  }

  if (visibleTickets.some((ticket) => ticket.id === selectedTicketId)) {
    return selectedTicketId;
  }

  return visibleTickets[0].id;
}

export function getSelectedTicket(
  tickets: ReturnRoomTicket[],
  effectiveSelectedTicketId: string | null,
) {
  return (
    tickets.find((ticket) => ticket.id === effectiveSelectedTicketId) ?? null
  );
}

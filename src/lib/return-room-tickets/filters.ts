import type {
  AdvancedFilterState,
  QueueKey,
  ReturnRoomTicket,
  ReturnTicketFilterState,
  SortKey,
} from "./types";
import { queueStatusGroups } from "./status";

export const emptyAdvancedFilters: AdvancedFilterState = {
  ticketCode: "",
  tenantName: "",
  contractCode: "",
  roomOrBed: "",
  status: "all",
  fromDate: "",
  toDate: "",
};

export const defaultFilterState: ReturnTicketFilterState = {
  ...emptyAdvancedFilters,
  queue: "pendingReview",
  search: "",
  sort: "newest",
};

export function countTicketsByQueue(tickets: ReturnRoomTicket[]) {
  return Object.keys(queueStatusGroups).reduce(
    (counts, queueKey) => {
      counts[queueKey as QueueKey] = tickets.filter((ticket) =>
        isTicketInQueue(ticket, queueKey as QueueKey),
      ).length;

      return counts;
    },
    {} as Record<QueueKey, number>,
  );
}

export function filterTickets(
  tickets: ReturnRoomTicket[],
  filters: ReturnTicketFilterState,
) {
  const search = normalizeText(filters.search);
  const ticketCode = normalizeText(filters.ticketCode);
  const tenantName = normalizeText(filters.tenantName);
  const contractCode = normalizeText(filters.contractCode);
  const roomOrBed = normalizeText(filters.roomOrBed);

  return sortTickets(
    tickets.filter((ticket) => {
      if (!isTicketInQueue(ticket, filters.queue)) {
        return false;
      }

      if (filters.status !== "all" && ticket.status !== filters.status) {
        return false;
      }

      if (search && !matchesQuickSearch(ticket, search)) {
        return false;
      }

      if (ticketCode && !normalizeText(ticket.code).includes(ticketCode)) {
        return false;
      }

      if (tenantName && !normalizeText(ticket.tenant.name).includes(tenantName)) {
        return false;
      }

      if (
        contractCode &&
        !normalizeText(ticket.contract.code).includes(contractCode)
      ) {
        return false;
      }

      if (roomOrBed && !matchesRoomOrBed(ticket, roomOrBed)) {
        return false;
      }

      if (filters.fromDate && ticket.room.expectedReturnDate < filters.fromDate) {
        return false;
      }

      if (filters.toDate && ticket.room.expectedReturnDate > filters.toDate) {
        return false;
      }

      return true;
    }),
    filters.sort,
  );
}

export function isTicketInQueue(ticket: ReturnRoomTicket, queue: QueueKey) {
  return queueStatusGroups[queue].includes(ticket.status);
}

export function hasAdvancedFilters(filters: AdvancedFilterState) {
  return Boolean(
    filters.ticketCode ||
      filters.tenantName ||
      filters.contractCode ||
      filters.roomOrBed ||
      filters.status !== "all" ||
      filters.fromDate ||
      filters.toDate,
  );
}

function sortTickets(tickets: ReturnRoomTicket[], sort: SortKey) {
  return [...tickets].sort((first, second) => {
    if (sort === "urgentFirst") {
      const urgentScore =
        Number(isTicketOverdue(second)) - Number(isTicketOverdue(first));

      if (urgentScore !== 0) {
        return urgentScore;
      }
    }

    if (sort === "oldest") {
      return first.createdAt.localeCompare(second.createdAt);
    }

    if (sort === "nearestReturn" || sort === "urgentFirst") {
      return first.room.expectedReturnDate.localeCompare(
        second.room.expectedReturnDate,
      );
    }

    return second.createdAt.localeCompare(first.createdAt);
  });
}

function matchesQuickSearch(ticket: ReturnRoomTicket, search: string) {
  return [
    ticket.code,
    ticket.tenant.name,
    ticket.contract.code,
    ticket.room.roomCode,
    ticket.room.bedCode,
  ].some((value) => normalizeText(value).includes(search));
}

function matchesRoomOrBed(ticket: ReturnRoomTicket, roomOrBed: string) {
  return [ticket.room.roomCode, ticket.room.bedCode]
    .map(normalizeText)
    .some((value) => value.includes(roomOrBed));
}

function normalizeText(value: string) {
  return value.trim().toLocaleLowerCase("vi-VN");
}

function isTicketOverdue(ticket: ReturnRoomTicket) {
  const expectedDate = new Date(ticket.room.expectedReturnDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  expectedDate.setHours(0, 0, 0, 0);
  return ticket.status !== "completed" && expectedDate.getTime() < today.getTime();
}

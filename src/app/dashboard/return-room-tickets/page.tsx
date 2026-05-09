import type { Metadata } from "next";
import { getReturnRoomTickets } from "@/actions/check-in-contracts";
import { ReturnRoomTicketsWorkspace } from "@/components/return-room-tickets/ReturnRoomTicketsWorkspace";

export const metadata: Metadata = {
  title: "Quản lý phiếu trả phòng | HomestayDorm",
};

export default async function ReturnRoomTicketsPage() {
  const tickets = await getReturnRoomTickets();

  return <ReturnRoomTicketsWorkspace initialTickets={tickets} />;
}

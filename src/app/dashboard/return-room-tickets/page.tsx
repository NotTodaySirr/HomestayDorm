import type { Metadata } from "next";
import { ReturnRoomTicketsWorkspace } from "@/components/return-room-tickets/ReturnRoomTicketsWorkspace";
import { returnRoomTickets } from "@/lib/return-room-tickets/mock-data";

export const metadata: Metadata = {
  title: "Quản lý phiếu trả phòng | HomestayDorm",
};

export default function ReturnRoomTicketsPage() {
  return <ReturnRoomTicketsWorkspace initialTickets={returnRoomTickets} />;
}

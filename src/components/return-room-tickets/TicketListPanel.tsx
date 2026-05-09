import { Eye } from "lucide-react";
import type {
  QueueKey,
  ReturnRoomTicket,
  SortKey,
} from "@/lib/return-room-tickets/types";
import { queueLabels } from "@/lib/return-room-tickets/status";
import {
  ActionButton,
  cx,
  formatDate,
  StatusPill,
} from "./ui";
import { QueueTabs } from "./QueueTabs";

const sortLabels: Record<SortKey, string> = {
  newest: "Mới nhất",
  oldest: "Cũ nhất",
  nearestReturn: "Ngày trả gần nhất",
  urgentFirst: "Quá hạn trước",
};

type TicketListPanelProps = {
  tickets: ReturnRoomTicket[];
  activeQueue: QueueKey;
  sort: SortKey;
  queueCounts: Record<QueueKey, number>;
  onQueueChange: (queue: QueueKey) => void;
  selectedTicketId: string | null;
  onSelectTicket: (ticketId: string) => void;
};

export function TicketListPanel({
  tickets,
  activeQueue,
  sort,
  queueCounts,
  onQueueChange,
  selectedTicketId,
  onSelectTicket,
}: TicketListPanelProps) {
  return (
    <section className="flex h-[500px] min-h-0 flex-col overflow-hidden rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] xl:h-full">
      <div className="shrink-0 border-b border-[var(--color-border)] bg-slate-50 px-3 py-3">
        <div className="flex items-center justify-between">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase leading-none tracking-[0.06em] text-[var(--color-primary)]">
              Danh sách phiếu trả phòng
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2 rounded-full bg-[var(--color-surface)] px-3 py-1.5 text-[12px] font-semibold text-[var(--color-primary)]">
            <span className="text-[15px] leading-none">{tickets.length}</span>
            <span>phiếu</span>
          </div>
        </div>
        <div className="mt-3">
          <QueueTabs
            activeQueue={activeQueue}
            counts={queueCounts}
            onQueueChange={onQueueChange}
          />
        </div>
      </div>

      {tickets.length === 0 ? (
        <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-2 px-4 text-center">
          <p className="text-[13px] font-semibold text-[var(--color-on-surface)]">
            Không có phiếu phù hợp
          </p>
          <p className="max-w-[360px] text-[12px] text-[var(--color-on-surface-secondary)]">
            Thử đổi hàng đợi, từ khóa tìm kiếm hoặc bộ lọc đang áp dụng.
          </p>
        </div>
      ) : (
        <div className="min-h-0 flex-1 overflow-auto">
          <table className="min-w-[900px] w-full border-collapse text-left text-[12px]">
            <thead className="sticky top-0 z-[1] bg-[var(--color-secondary)] text-[11px] font-semibold uppercase leading-none tracking-[0.06em] text-[var(--color-on-secondary)]">
              <tr>
                <th className="w-[108px] px-3 py-2">Mã PTP</th>
                <th className="px-3 py-2">Khách thuê</th>
                <th className="w-[128px] px-3 py-2">Phòng</th>
                <th className="w-[116px] px-3 py-2">Ngày trả</th>
                <th className="w-[158px] px-3 py-2">Trạng thái</th>
                <th className="w-[118px] px-3 py-2 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border)]">
              {tickets.map((ticket) => {
                const isSelected = ticket.id === selectedTicketId;
                const isOverdue = isTicketOverdue(ticket);

                return (
                  <tr
                    key={ticket.id}
                    onClick={() => onSelectTicket(ticket.id)}
                    className={cx(
                      "cursor-pointer transition-colors hover:bg-[var(--color-secondary)]",
                      isSelected && "bg-[var(--color-primary-container)]",
                    )}
                  >
                    <td className="px-3 py-3 align-top">
                      <div className="flex items-center gap-2">
                        <span
                          className={cx(
                            "block h-8 w-[3px] rounded-full",
                            isOverdue ? "bg-[var(--color-warning)]" : "bg-transparent",
                          )}
                        />
                        <div className="min-w-0">
                          <p className="font-mono text-[11px] font-semibold text-[var(--color-on-surface)]">
                            {ticket.code}
                          </p>
                          {isOverdue ? (
                            <span className="mt-1 inline-flex rounded-full bg-[var(--color-warning-container)] px-2 py-0.5 text-[10px] font-semibold text-[var(--color-warning)]">
                              Quá hạn
                            </span>
                          ) : null}
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-3 align-top">
                      <p className="font-medium text-[var(--color-on-surface)]">
                        {ticket.tenant.name}
                      </p>
                      <p className="mt-0.5 font-mono text-[11px] text-[var(--color-on-surface-secondary)]">
                        {ticket.contract.code}
                      </p>
                    </td>
                    <td className="px-3 py-3 align-top">
                      <p className="font-medium">{ticket.room.roomCode}</p>
                      <p className="mt-0.5 text-[var(--color-on-surface-secondary)]">
                        {ticket.room.bedCode}
                      </p>
                    </td>
                    <td className="px-3 py-3 align-top font-mono text-[11px]">
                      {formatDate(ticket.room.expectedReturnDate)}
                    </td>
                    <td className="px-3 py-3 align-top">
                      <StatusPill status={ticket.status} compact />
                    </td>
                    <td className="px-3 py-3 text-right align-top">
                      <ActionButton icon={Eye} onClick={() => onSelectTicket(ticket.id)}>
                        Xem
                      </ActionButton>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

function isTicketOverdue(ticket: ReturnRoomTicket) {
  const expectedDate = new Date(ticket.room.expectedReturnDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  expectedDate.setHours(0, 0, 0, 0);
  return ticket.status !== "completed" && expectedDate.getTime() < today.getTime();
}

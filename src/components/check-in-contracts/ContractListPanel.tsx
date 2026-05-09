import { Eye } from "lucide-react";
import type { CheckInContractRecord } from "@/lib/check-in-contracts/types";
import {
  formatContractedBeds,
  getContractRentalType,
  getRentalTypeLabel,
} from "./logic/contractScope";
import {
  ActionButton,
  cx,
  formatCurrency,
  formatDate,
  StatusPill,
} from "./ui";

type ContractListPanelProps = {
  records: CheckInContractRecord[];
  selectedRecordId: string | null;
  onSelectRecord: (recordId: string) => void;
};

export function ContractListPanel({
  records,
  selectedRecordId,
  onSelectRecord,
}: ContractListPanelProps) {
  return (
    <section className="flex h-[500px] min-h-0 flex-col overflow-hidden rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] xl:h-full">
      <div className="shrink-0 border-b border-[var(--color-border)] bg-slate-50 px-3 py-3">
        <div className="flex items-center justify-between gap-3">
          <p className="min-w-0 truncate text-[11px] font-semibold uppercase leading-none tracking-[0.06em] text-[var(--color-primary)]">
            Danh sách hồ sơ đã đặt cọc
          </p>
          <div className="flex shrink-0 items-center gap-2 rounded-full bg-[var(--color-surface)] px-3 py-1.5 text-[12px] font-semibold text-[var(--color-primary)]">
            <span className="text-[15px] leading-none">{records.length}</span>
            <span>hồ sơ</span>
          </div>
        </div>
      </div>

      {records.length === 0 ? (
        <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-2 px-4 text-center">
          <p className="text-[13px] font-semibold text-[var(--color-on-surface)]">
            Không có hồ sơ phù hợp
          </p>
          <p className="max-w-[360px] text-[12px] text-[var(--color-on-surface-secondary)]">
            Thử đổi từ khóa tìm kiếm hoặc trạng thái đang lọc.
          </p>
        </div>
      ) : (
        <div className="min-h-0 flex-1 overflow-auto">
          <table className="w-full min-w-[1080px] border-collapse text-left text-[12px]">
            <thead className="sticky top-0 z-[1] bg-[var(--color-secondary)] text-[11px] font-semibold uppercase leading-none tracking-[0.06em] text-[var(--color-on-secondary)]">
              <tr>
                <th className="w-[126px] px-3 py-2">Phiếu cọc</th>
                <th className="w-[126px] px-3 py-2">Phiếu TT</th>
                <th className="px-3 py-2">Khách hàng</th>
                <th className="w-[112px] px-3 py-2">SĐT</th>
                <th className="w-[190px] px-3 py-2">Phòng/Giường</th>
                <th className="w-[132px] px-3 py-2">Loại thuê</th>
                <th className="w-[126px] px-3 py-2 text-right">Tiền cọc</th>
                <th className="w-[126px] px-3 py-2">Ngày nhận</th>
                <th className="w-[148px] px-3 py-2">Trạng thái</th>
                <th className="w-[92px] px-3 py-2 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border)]">
              {records.map((record) => {
                const isSelected = record.id === selectedRecordId;
                const rentalType = getContractRentalType(record);

                return (
                  <tr
                    key={record.id}
                    onClick={() => onSelectRecord(record.id)}
                    className={cx(
                      "cursor-pointer transition-colors hover:bg-[var(--color-secondary)]",
                      isSelected && "bg-[var(--color-primary-container)]",
                    )}
                  >
                    <td className="px-3 py-3 align-top">
                      <p className="font-mono text-[11px] font-semibold text-[var(--color-on-surface)]">
                        {record.depositCode}
                      </p>
                      <p className="mt-0.5 font-mono text-[11px] text-[var(--color-on-surface-secondary)]">
                        {record.registrationCode}
                      </p>
                    </td>
                    <td className="px-3 py-3 align-top font-mono text-[11px]">
                      {record.paymentCode}
                    </td>
                    <td className="px-3 py-3 align-top">
                      <p className="font-medium text-[var(--color-on-surface)]">
                        {record.customer.name}
                      </p>
                      <p className="mt-0.5 text-[11px] text-[var(--color-on-surface-secondary)]">
                        {record.customer.identityNumber ?? "Chưa có CCCD"}
                      </p>
                    </td>
                    <td className="px-3 py-3 align-top font-mono text-[11px]">
                      {record.customer.phone}
                    </td>
                    <td className="px-3 py-3 align-top">
                      <p className="font-semibold">{record.room.roomCode}</p>
                      <p className="mt-0.5 text-[var(--color-on-surface-secondary)]">
                        {formatContractedBeds(record)}
                      </p>
                    </td>
                    <td className="px-3 py-3 align-top">
                      <span className="inline-flex rounded-full bg-[var(--color-primary-container)] px-2 py-1 text-[11px] font-semibold text-[var(--color-primary)]">
                        {getRentalTypeLabel(rentalType)}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-right align-top font-medium">
                      {formatCurrency(record.depositAmount)}
                    </td>
                    <td className="px-3 py-3 align-top font-mono text-[11px]">
                      {formatDate(record.expectedMoveInDate)}
                    </td>
                    <td className="px-3 py-3 align-top">
                      <StatusPill status={record.status} />
                    </td>
                    <td className="px-3 py-3 text-right align-top">
                      <ActionButton icon={Eye} onClick={() => onSelectRecord(record.id)}>
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

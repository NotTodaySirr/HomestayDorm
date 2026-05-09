import { ArrowLeft, ClipboardCheck, FileSignature } from "lucide-react";
import type { CheckInContractRecord } from "@/lib/check-in-contracts/types";
import {
  formatContractedBeds,
  getContractRentalType,
  getRentalTypeLabel,
} from "./logic/contractScope";
import {
  ActionButton,
  DetailSection,
  FieldRow,
  formatCurrency,
  formatDate,
  StatusPill,
} from "./ui";

type CheckInActionPanelProps = {
  record: CheckInContractRecord | null;
  onBackToList: () => void;
  onStartContractForm: () => void;
};

const roomStatusLabel: Record<CheckInContractRecord["room"]["roomStatus"], string> = {
  ready: "Sẵn sàng bàn giao",
  cleaning: "Đang dọn phòng",
  maintenance: "Đang bảo trì",
};

const genderLabel: Record<string, string> = {
  male: "Nam",
  female: "Nữ",
  other: "Khác",
};

export function CheckInActionPanel({
  record,
  onBackToList,
  onStartContractForm,
}: CheckInActionPanelProps) {
  if (!record) {
    return (
      <section className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)]">
        <PanelHeader
          title="Chi tiết & thao tác"
          description="Chọn một hồ sơ trong danh sách để xử lý nhận phòng."
          leadingAction={
            <ActionButton icon={ArrowLeft} onClick={onBackToList}>
              Danh sách
            </ActionButton>
          }
        />
        <div className="flex min-h-0 flex-1 items-center justify-center px-4 text-center text-[12px] text-[var(--color-on-surface-secondary)]">
          Chọn một hồ sơ trong danh sách để xử lý nhận phòng.
        </div>
      </section>
    );
  }

  const canCreateContract = record.status === "waitingCheckIn";
  const rentalType = getContractRentalType(record);

  return (
    <section className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)]">
      <PanelHeader
        title="Chi tiết phiếu"
        description={`${record.depositCode} · ${record.paymentCode} · ${record.customer.name}`}
        leadingAction={
          <ActionButton icon={ArrowLeft} onClick={onBackToList}>
            Danh sách
          </ActionButton>
        }
        action={<StatusPill status={record.status} />}
      />

      <div className="min-h-0 flex-1 overflow-auto">
        <DetailSection title="1. Nguồn hồ sơ">
          <dl>
            <FieldRow label="Phiếu đăng ký" value={record.registrationCode} />
            <FieldRow label="Phiếu cọc" value={record.depositCode} />
            <FieldRow label="Phiếu thanh toán" value={record.paymentCode} />
            <FieldRow label="Trạng thái nguồn" value="Đã đặt cọc" />
          </dl>
        </DetailSection>

        <DetailSection title="2. Thông tin khách">
          <dl>
            <FieldRow label="Đại diện" value={record.customer.name} />
            <FieldRow label="SĐT" value={record.customer.phone} />
            <FieldRow
              label="CCCD/CMND"
              value={record.customer.identityNumber ?? "Chưa cập nhật"}
            />
            <FieldRow label="Email" value={record.customer.email ?? "Không có"} />
          </dl>
        </DetailSection>

        <DetailSection title="3. Phòng/giường cần lập hợp đồng">
          <dl>
            <FieldRow label="Phòng" value={record.room.roomCode} />
            <FieldRow
              label="Giường đã cọc"
              value={`${formatContractedBeds(record)} (${record.room.contractedBeds.length}/${record.room.roomCapacity})`}
            />
            <FieldRow label="Loại thuê" value={getRentalTypeLabel(rentalType)} />
            <FieldRow label="Tình trạng" value={roomStatusLabel[record.room.roomStatus]} />
            <FieldRow label="Tiền cọc" value={formatCurrency(record.depositAmount)} />
            <FieldRow label="Giá thuê" value={`${formatCurrency(record.monthlyRent)}/tháng`} />
            <FieldRow label="Phí dịch vụ" value={`${formatCurrency(record.serviceFee)}/tháng`} />
          </dl>

          <div className="mt-3 overflow-hidden rounded-[var(--radius-sm)] border border-[var(--color-border)]">
            <div className="grid grid-cols-[1fr_140px] bg-[var(--color-secondary)] px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.06em] text-[var(--color-on-secondary)]">
              <span>Giường</span>
              <span className="text-right">Giá/tháng</span>
            </div>
            {record.room.contractedBeds.map((bed) => (
              <div
                key={bed.id}
                className="grid grid-cols-[1fr_140px] border-t border-[var(--color-border)] px-3 py-2 text-[12px]"
              >
                <span className="font-medium">{bed.bedCode}</span>
                <span className="text-right font-medium">
                  {formatCurrency(bed.monthlyRent)}
                </span>
              </div>
            ))}
          </div>
        </DetailSection>

        <DetailSection title="4. Xác nhận nhận phòng">
          <dl>
            <FieldRow label="Ngày nhận" value={formatDate(record.expectedMoveInDate)} />
            <FieldRow label="Ngày cọc" value={formatDate(record.depositedAt)} />
            <FieldRow label="Số người ở" value={`${record.expectedOccupantCount} người`} />
            <FieldRow label="Ghi chú" value={record.note} />
          </dl>
        </DetailSection>

        <DetailSection title="5. Danh sách người trong hợp đồng">
          <div className="overflow-hidden rounded-[var(--radius-sm)] border border-[var(--color-border)]">
            <div className="grid grid-cols-[1.2fr_110px_110px_1fr] bg-[var(--color-secondary)] px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.06em] text-[var(--color-on-secondary)]">
              <span>Họ tên</span>
              <span>CCCD</span>
              <span>Giới tính</span>
              <span>Ngày sinh/Quốc tịch</span>
            </div>
            {record.occupants.map((occupant) => (
              <div
                key={occupant.id}
                className="grid grid-cols-[1.2fr_110px_110px_1fr] border-t border-[var(--color-border)] px-3 py-2 text-[12px]"
              >
                <span className="font-medium">
                  {occupant.fullName}
                  {occupant.isRepresentative ? (
                    <span className="ml-1 text-[11px] text-[var(--color-primary)]">
                      · đại diện
                    </span>
                  ) : null}
                </span>
                <span className="font-mono text-[11px]">
                  {occupant.identityNumber || "Chưa có"}
                </span>
                <span>{genderLabel[occupant.gender] ?? "Chưa rõ"}</span>
                <span className="min-w-0 truncate">
                  {occupant.dateOfBirth ? formatDate(occupant.dateOfBirth) : "Chưa có"} ·{" "}
                  {occupant.nationality || "Chưa có"}
                </span>
              </div>
            ))}
          </div>
        </DetailSection>

        <DetailSection title="6. Thông tin hợp đồng">
          <dl>
            <FieldRow
              label="Mã hợp đồng"
              value={record.contract?.code ?? "Chưa lập"}
            />
            <FieldRow
              label="Ngày bắt đầu"
              value={
                record.contract
                  ? formatDate(record.contract.startDate)
                  : "Sẽ lấy theo ngày nhận phòng"
              }
            />
            <FieldRow
              label="Chu kỳ"
              value={record.contract?.paymentCycle === "quarterly" ? "Theo quý" : "Theo tháng"}
            />
            <FieldRow
              label="Loại thuê"
              value={getRentalTypeLabel(record.contract?.rentalType ?? rentalType)}
            />
          </dl>
        </DetailSection>
      </div>

      <div className="flex shrink-0 justify-end gap-2 border-t border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-3">
        <ActionButton
          icon={FileSignature}
          variant="primary"
          disabled={!canCreateContract}
          onClick={onStartContractForm}
        >
          Lập hợp đồng
        </ActionButton>
        {!canCreateContract ? (
          <ActionButton icon={ClipboardCheck} disabled>
            Đã xử lý
          </ActionButton>
        ) : null}
      </div>
    </section>
  );
}

function PanelHeader({
  title,
  description,
  leadingAction,
  action,
}: {
  title: string;
  description: string;
  leadingAction?: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex shrink-0 flex-col gap-3 border-b border-[var(--color-border)] bg-slate-50 px-3 py-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 items-center gap-3">
        {leadingAction ? <div className="shrink-0">{leadingAction}</div> : null}
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase leading-none tracking-[0.06em] text-[var(--color-primary)]">
            {title}
          </p>
          <p className="mt-1 truncate text-[12px] text-[var(--color-on-surface-secondary)]">
            {description}
          </p>
        </div>
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

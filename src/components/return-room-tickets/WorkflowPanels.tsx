"use client";

import { ArrowLeft, Check, Send, Wrench } from "lucide-react";
import type { FormEvent } from "react";
import { useMemo, useState } from "react";
import type { ReturnRoomTicket } from "@/lib/return-room-tickets/types";
import {
  ActionButton,
  FieldRow,
  formatCurrency,
  formatDate,
  PanelHeader,
} from "./ui";

export type ReconciliationSubmission = {
  assetConditions: Record<string, string>;
  hygieneStatus: "passed" | "failed";
  keycardStatus: "complete" | "missing";
  hasDamageOrLoss: boolean;
  damageDescription: string;
  estimatedCost: number;
  managerNotes: string;
};

export type RoomStatusSubmission = {
  finalStatus: "available" | "maintenance";
  note: string;
};

type ReconciliationFormPanelProps = {
  ticket: ReturnRoomTicket;
  onCancel: () => void;
  onSubmit: (submission: ReconciliationSubmission) => void;
  isSubmitting?: boolean;
};

export function ReconciliationFormPanel({
  ticket,
  onCancel,
  onSubmit,
  isSubmitting = false,
}: ReconciliationFormPanelProps) {
  const initialFormState = useMemo(
    () =>
      getInitialReconciliationFormState(ticket),
    [ticket],
  );
  const [assetConditions, setAssetConditions] = useState(
    initialFormState.assetConditions,
  );
  const [hygieneStatus, setHygieneStatus] =
    useState<ReconciliationSubmission["hygieneStatus"]>(
      initialFormState.hygieneStatus,
    );
  const [keycardStatus, setKeycardStatus] =
    useState<ReconciliationSubmission["keycardStatus"]>(
      initialFormState.keycardStatus,
    );
  const [hasDamageOrLoss, setHasDamageOrLoss] = useState(
    initialFormState.hasDamageOrLoss,
  );
  const [damageDescription, setDamageDescription] = useState(
    initialFormState.damageDescription,
  );
  const [estimatedCost, setEstimatedCost] = useState(
    initialFormState.estimatedCost,
  );
  const [managerNotes, setManagerNotes] = useState(
    initialFormState.managerNotes,
  );

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    onSubmit({
      assetConditions,
      hygieneStatus,
      keycardStatus,
      hasDamageOrLoss,
      damageDescription,
      estimatedCost: Number(estimatedCost) || 0,
      managerNotes,
    });
  }

  return (
    <section className="flex h-[500px] min-h-0 flex-col overflow-hidden rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] xl:h-full">
      <div className="flex min-h-[54px] items-center gap-3 border-b border-[var(--color-border)] px-3 py-2">
        <ActionButton icon={ArrowLeft} onClick={onCancel} disabled={isSubmitting}>
          Chi tiết
        </ActionButton>
        <h2 className="min-w-0 truncate text-[13px] font-semibold uppercase leading-[1.4] tracking-[0.06em] text-[var(--color-on-secondary)]">
          Lập phiếu thanh toán
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col divide-y divide-[var(--color-border)]">
        <div className="min-h-0 flex-1 overflow-auto">
          <section className="p-3">
            <ReconciliationSectionTitle>
              1. Thông tin phiếu trả phòng
            </ReconciliationSectionTitle>
            <dl className="mt-2 grid gap-x-4 sm:grid-cols-2">
              <FieldRow label="Khách" value={ticket.tenant.name} />
              <FieldRow label="Phòng" value={ticket.room.roomCode} />
              <FieldRow label="Giường" value={ticket.room.bedCode} />
              <FieldRow
                label="Tiền cọc"
                value={formatCurrency(ticket.contract.depositAmount)}
              />
              <FieldRow
                label="Ngày trả"
                value={formatDate(ticket.room.expectedReturnDate)}
              />
              <FieldRow label="Ghi chú sale" value={ticket.saleNote} />
            </dl>
          </section>

          <section className="p-3">
            <ReconciliationSectionTitle>
              2. Tài sản bàn giao ban đầu
            </ReconciliationSectionTitle>
            <div className="mt-3 overflow-auto rounded-[var(--radius-sm)] border border-[var(--color-border)]">
              <table className="min-w-[620px] w-full text-left text-[12px]">
                <thead className="bg-[var(--color-secondary)] text-[11px] font-semibold uppercase leading-none tracking-[0.06em] text-[var(--color-on-secondary)]">
                  <tr>
                    <th className="px-3 py-2">Tài sản</th>
                    <th className="w-[100px] px-3 py-2">Số lượng</th>
                    <th className="w-[160px] px-3 py-2">Ban đầu</th>
                    <th className="w-[180px] px-3 py-2">Hiện trạng trả phòng</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--color-border)]">
                  {ticket.handoverAssets.map((asset) => (
                    <tr key={asset.id}>
                      <td className="px-3 py-2">
                        <p className="font-medium">{asset.name}</p>
                        <p className="mt-0.5 text-[11px] text-[var(--color-on-surface-secondary)]">
                          {asset.handedBy} · {formatDate(asset.handedAt)}
                        </p>
                      </td>
                      <td className="px-3 py-2">{asset.quantity}</td>
                      <td className="px-3 py-2">{asset.initialCondition}</td>
                      <td className="px-3 py-2">
                        <select
                          value={assetConditions[asset.id]}
                          onChange={(event) =>
                            setAssetConditions((current) => ({
                              ...current,
                              [asset.id]: event.target.value,
                            }))
                          }
                          className="h-8 w-full rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-surface)] px-2 text-[12px] outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary-container)]"
                        >
                          <option>Tốt</option>
                          <option>Đã trả</option>
                          <option>Hỏng</option>
                          <option>Thiếu</option>
                          <option>Cần kiểm tra</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="p-3">
            <ReconciliationSectionTitle>
              3. Kết quả kiểm tra
            </ReconciliationSectionTitle>
            <div className="mt-3 grid gap-3 lg:grid-cols-3">
              <SegmentedChoice
                label="Vệ sinh"
                options={[
                  { label: "Đạt", value: "passed" },
                  { label: "Không đạt", value: "failed" },
                ]}
                value={hygieneStatus}
                onChange={(value) => setHygieneStatus(value)}
              />
              <SegmentedChoice
                label="Chìa khóa/thẻ"
                options={[
                  { label: "Đủ", value: "complete" },
                  { label: "Thiếu", value: "missing" },
                ]}
                value={keycardStatus}
                onChange={(value) => setKeycardStatus(value)}
              />
              <SegmentedChoice
                label="Hư hỏng/mất mát"
                options={[
                  { label: "Không", value: "false" },
                  { label: "Có", value: "true" },
                ]}
                value={String(hasDamageOrLoss)}
                onChange={(value) => setHasDamageOrLoss(value === "true")}
              />
            </div>
          </section>

          <section className="p-3">
            <ReconciliationSectionTitle>
              4. Khoản khấu trừ quản lý ghi nhận
            </ReconciliationSectionTitle>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <label className="flex flex-col gap-1.5 text-[12px]">
                <span className="font-semibold text-[var(--color-on-surface-secondary)]">
                  Mô tả hư hỏng/mất mát
                </span>
                <input
                  value={damageDescription}
                  onChange={(event) => setDamageDescription(event.target.value)}
                  placeholder="VD: Remote máy lạnh hỏng"
                  className="h-8 rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-surface)] px-2.5 outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary-container)]"
                />
              </label>
              <label className="flex flex-col gap-1.5 text-[12px]">
                <span className="font-semibold text-[var(--color-on-surface-secondary)]">
                  Chi phí dự kiến
                </span>
                <input
                  inputMode="numeric"
                  value={estimatedCost}
                  onChange={(event) =>
                    setEstimatedCost(event.target.value.replace(/\D/g, ""))
                  }
                  placeholder="300000"
                  className="h-8 rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-surface)] px-2.5 font-mono text-[11px] outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary-container)]"
                />
              </label>
              <label className="flex flex-col gap-1.5 text-[12px] sm:col-span-2">
                <span className="font-semibold text-[var(--color-on-surface-secondary)]">
                  Ghi chú kiểm tra thực tế
                </span>
                <textarea
                  value={managerNotes}
                  onChange={(event) => setManagerNotes(event.target.value)}
                  rows={3}
                  className="resize-none rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-surface)] px-2.5 py-2 outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary-container)]"
                />
              </label>
            </div>
          </section>

        </div>
        <div className="flex shrink-0 flex-wrap justify-end gap-2 p-3">

          <ActionButton icon={Send} type="submit" variant="primary" disabled={isSubmitting}>
            Hoàn tất kiểm tra & chuyển kế toán
          </ActionButton>
        </div>
      </form>
    </section>
  );
}

type RoomStatusUpdatePanelProps = {
  ticket: ReturnRoomTicket;
  onCancel: () => void;
  onSubmit: (submission: RoomStatusSubmission) => void;
};

export function RoomStatusUpdatePanel({
  ticket,
  onCancel,
  onSubmit,
}: RoomStatusUpdatePanelProps) {
  const [finalStatus, setFinalStatus] =
    useState<RoomStatusSubmission["finalStatus"]>("available");
  const [note, setNote] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSubmit({ finalStatus, note });
  }

  return (
    <section className="flex h-[500px] min-h-0 flex-col overflow-hidden rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] xl:h-full">
      <PanelHeader
        eyebrow="Cập nhật trạng thái phòng/giường"
        title={`Phiếu trả phòng: ${ticket.code}`}
        description={`${ticket.tenant.name} · ${ticket.room.roomCode} / ${ticket.room.bedCode}`}
        action={
          <ActionButton icon={ArrowLeft} onClick={onCancel}>
            Chi tiết
          </ActionButton>
        }
      />

      <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col divide-y divide-[var(--color-border)]">
        <div className="min-h-0 flex-1 overflow-auto">
          <section className="p-3">
            <p className="text-[11px] font-semibold uppercase leading-none tracking-[0.06em] text-[var(--color-on-secondary)]">
              Điều kiện hoàn tất
            </p>
            <dl className="mt-2">
              <FieldRow label="Khách đã xác nhận" value="Có" />
              <FieldRow label="Thanh toán/hoàn cọc" value="Đã xử lý trên phiếu" />
              <FieldRow label="Chìa khóa/thẻ" value="Đã thu hồi hoặc đã ghi nhận" />
            </dl>
          </section>

          <section className="grid gap-3 p-3 sm:grid-cols-2">
            <label
              className={`cursor-pointer rounded-[var(--radius-md)] border p-3 ${finalStatus === "available"
                  ? "border-[var(--color-success)] bg-[var(--color-success-container)] text-[var(--color-success)]"
                  : "border-[var(--color-border)] bg-[var(--color-surface)]"
                }`}
            >
              <input
                type="radio"
                name="finalStatus"
                value="available"
                checked={finalStatus === "available"}
                onChange={() => setFinalStatus("available")}
                className="sr-only"
              />
              <span className="flex items-center gap-2 text-[13px] font-semibold">
                <Check aria-hidden="true" className="h-4 w-4" strokeWidth={2} />
                Trống
              </span>
              <span className="mt-1 block text-[12px] text-[var(--color-on-surface-secondary)]">
                Phòng/giường đủ điều kiện mở bán lại.
              </span>
            </label>

            <label
              className={`cursor-pointer rounded-[var(--radius-md)] border p-3 ${finalStatus === "maintenance"
                  ? "border-[var(--color-warning)] bg-[var(--color-warning-container)] text-[var(--color-warning)]"
                  : "border-[var(--color-border)] bg-[var(--color-surface)]"
                }`}
            >
              <input
                type="radio"
                name="finalStatus"
                value="maintenance"
                checked={finalStatus === "maintenance"}
                onChange={() => setFinalStatus("maintenance")}
                className="sr-only"
              />
              <span className="flex items-center gap-2 text-[13px] font-semibold">
                <Wrench aria-hidden="true" className="h-4 w-4" strokeWidth={2} />
                Cần bảo trì
              </span>
              <span className="mt-1 block text-[12px] text-[var(--color-on-surface-secondary)]">
                Có hư hỏng hoặc cần xử lý trước khi mở bán.
              </span>
            </label>

            <label className="flex flex-col gap-1.5 text-[12px] sm:col-span-2">
              <span className="font-semibold text-[var(--color-on-surface-secondary)]">
                Ghi chú bảo trì nếu có
              </span>
              <textarea
                value={note}
                onChange={(event) => setNote(event.target.value)}
                rows={3}
                className="resize-none rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-surface)] px-2.5 py-2 outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary-container)]"
              />
            </label>
          </section>

        </div>
        <div className="flex shrink-0 flex-wrap justify-end gap-2 p-3">
          <ActionButton icon={ArrowLeft} onClick={onCancel}>
            Hủy
          </ActionButton>
          <ActionButton icon={Check} type="submit" variant="primary">
            Xác nhận cập nhật
          </ActionButton>
        </div>
      </form>
    </section>
  );
}

type SegmentedChoiceProps<Value extends string> = {
  label: string;
  value: Value;
  options: Array<{ label: string; value: Value }>;
  onChange: (value: Value) => void;
};

function SegmentedChoice<Value extends string>({
  label,
  value,
  options,
  onChange,
}: SegmentedChoiceProps<Value>) {
  return (
    <fieldset className="min-w-0">
      <legend className="mb-1.5 text-[12px] font-semibold text-[var(--color-on-surface-secondary)]">
        {label}
      </legend>
      <div className="grid grid-cols-2 overflow-hidden rounded-[var(--radius-sm)] border border-[var(--color-border)]">
        {options.map((option) => {
          const isActive = value === option.value;

          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange(option.value)}
              className={`min-h-8 px-2 text-[12px] font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[var(--color-primary)] ${isActive
                  ? "bg-[var(--color-primary)] text-white"
                  : "bg-[var(--color-surface)] text-[var(--color-on-surface-secondary)] hover:bg-[var(--color-secondary)]"
                }`}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}

function ReconciliationSectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="border-l-[3px] border-[var(--color-primary)] bg-[#FAFBFF] px-3 pb-2 pt-2.5 text-[12px] font-semibold uppercase leading-[1.2] tracking-[0.05em] text-[var(--color-primary)]">
      {children}
    </h3>
  );
}

function getInitialReconciliationFormState(ticket: ReturnRoomTicket) {
  const firstDeduction = ticket.reconciliation?.estimatedDeductions[0];

  return {
    assetConditions: Object.fromEntries(
      ticket.handoverAssets.map((asset) => [
        asset.id,
        ticket.reconciliation?.hasDamageOrLoss ? "Cần kiểm tra" : "Tốt",
      ]),
    ) as Record<string, string>,
    hygieneStatus: ticket.reconciliation?.hygieneStatus ?? "passed",
    keycardStatus: ticket.reconciliation?.keycardStatus ?? "complete",
    hasDamageOrLoss: ticket.reconciliation?.hasDamageOrLoss ?? false,
    damageDescription: firstDeduction?.description ?? "",
    estimatedCost: firstDeduction?.amount ? String(firstDeduction.amount) : "",
    managerNotes: ticket.reconciliation?.managerNotes ?? "",
  };
}

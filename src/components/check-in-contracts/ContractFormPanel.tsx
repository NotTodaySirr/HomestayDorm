"use client";

import { ArrowLeft, Plus, Send, Trash2 } from "lucide-react";
import type { FormEvent } from "react";
import type {
  CheckInContractRecord,
  ContractDraft,
  ContractOccupant,
} from "@/lib/check-in-contracts/types";
import { getRentalTypeLabel } from "./logic/contractScope";
import {
  ActionButton,
  DetailSection,
  FieldRow,
  formatCurrency,
  formatDate,
  FormField,
  inputClasses,
} from "./ui";

type ContractFormPanelProps = {
  record: CheckInContractRecord;
  draft: ContractDraft;
  onDraftChange: (draft: ContractDraft) => void;
  onCancel: () => void;
  onSubmit: () => void;
};

export function ContractFormPanel({
  record,
  draft,
  onDraftChange,
  onCancel,
  onSubmit,
}: ContractFormPanelProps) {
  const expectedOccupantCount = Math.max(record.expectedOccupantCount, 1);
  const hasReachedOccupantLimit =
    draft.occupants.length >= expectedOccupantCount;
  const hasValidOccupantCount =
    draft.occupants.length > 0 && draft.occupants.length <= expectedOccupantCount;
  const canSubmit =
    draft.customerName.trim() &&
    draft.phone.trim() &&
    draft.roomCode.trim() &&
    draft.bedCodes.length > 0 &&
    draft.startDate &&
    hasValidOccupantCount &&
    draft.occupants.every(
      (occupant) =>
        occupant.fullName.trim() &&
        occupant.identityNumber.trim() &&
        occupant.gender &&
        occupant.dateOfBirth,
    ) &&
    draft.checkInConfirmed &&
    draft.roomConditionConfirmed &&
    draft.documentConfirmed;

  function updateDraft<Key extends keyof ContractDraft>(
    key: Key,
    value: ContractDraft[Key],
  ) {
    onDraftChange({ ...draft, [key]: value });
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (canSubmit) {
      onSubmit();
    }
  }

  function updateRepresentative(
    key: "customerName" | "phone" | "identityNumber",
    value: string,
  ) {
    const occupantKey =
      key === "customerName"
        ? "fullName"
        : key === "identityNumber"
          ? "identityNumber"
          : null;
    const occupants = draft.occupants.map((occupant, index) =>
      index === 0 && occupantKey ? { ...occupant, [occupantKey]: value } : occupant,
    );

    onDraftChange({ ...draft, [key]: value, occupants });
  }

  function updateOccupant<Key extends keyof ContractOccupant>(
    occupantId: string,
    key: Key,
    value: ContractOccupant[Key],
  ) {
    updateDraft(
      "occupants",
      draft.occupants.map((occupant) =>
        occupant.id === occupantId ? { ...occupant, [key]: value } : occupant,
      ),
    );
  }

  function addOccupant() {
    if (draft.occupants.length >= expectedOccupantCount) {
      return;
    }

    updateDraft("occupants", [
      ...draft.occupants,
      {
        id: `draft-occupant-${Date.now()}`,
        fullName: "",
        identityNumber: "",
        gender: "",
        dateOfBirth: "",
        nationality: "Việt Nam",
        isRepresentative: false,
      },
    ]);
  }

  function removeOccupant(occupantId: string) {
    const nextOccupants = draft.occupants.filter(
      (occupant) => occupant.id !== occupantId,
    );

    updateDraft("occupants", nextOccupants.length > 0 ? nextOccupants : draft.occupants);
  }

  return (
    <section className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)]">
      <div className="flex min-h-[54px] shrink-0 items-center gap-3 border-b border-[var(--color-border)] bg-slate-50 px-3 py-2">
        <ActionButton icon={ArrowLeft} onClick={onCancel}>
          Chi tiết
        </ActionButton>
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase leading-none tracking-[0.06em] text-[var(--color-primary)]">
            Lập hợp đồng mới
          </p>
          <p className="mt-1 truncate text-[12px] text-[var(--color-on-surface-secondary)]">
            {record.depositCode} · {record.paymentCode} · {record.customer.name}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
        <div className="min-h-0 flex-1 overflow-auto">
          <DetailSection title="1. Thông tin người đại diện">
            <div className="grid gap-3 sm:grid-cols-2">
              <FormField label="Họ tên" required>
                <input
                  value={draft.customerName}
                  onChange={(event) =>
                    updateRepresentative("customerName", event.target.value)
                  }
                  className={inputClasses}
                />
              </FormField>
              <FormField label="Số điện thoại" required>
                <input
                  value={draft.phone}
                  onChange={(event) => updateRepresentative("phone", event.target.value)}
                  className={inputClasses}
                />
              </FormField>
              <FormField label="CCCD/CMND">
                <input
                  value={draft.identityNumber}
                  onChange={(event) =>
                    updateRepresentative("identityNumber", event.target.value)
                  }
                  className={inputClasses}
                  placeholder="Nhập số giấy tờ nếu có"
                />
              </FormField>
            </div>
          </DetailSection>

          <DetailSection title="2. Phòng/giường cần lập hợp đồng">
            <div className="grid gap-3 sm:grid-cols-2">
              <FormField label="Phòng">
                <input
                  value={draft.roomCode}
                  readOnly
                  className={`${inputClasses} bg-[var(--color-secondary)]`}
                />
              </FormField>
              <FormField label="Loại thuê">
                <input
                  value={getRentalTypeLabel(draft.rentalType)}
                  readOnly
                  className={`${inputClasses} bg-[var(--color-secondary)]`}
                />
              </FormField>
              <div className="sm:col-span-2">
                <div className="overflow-hidden rounded-[var(--radius-sm)] border border-[var(--color-border)]">
                  <div className="grid grid-cols-[1fr_130px] bg-[var(--color-secondary)] px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.06em] text-[var(--color-on-secondary)]">
                    <span>Giường</span>
                    <span className="text-right">Giá/tháng</span>
                  </div>
                  {record.room.contractedBeds.map((bed) => (
                    <div
                      key={bed.id}
                      className="grid grid-cols-[1fr_130px] border-t border-[var(--color-border)] px-3 py-2 text-[12px]"
                    >
                      <span className="font-medium">
                        {record.room.roomCode} · {bed.bedCode}
                      </span>
                      <span className="text-right font-medium">
                        {formatCurrency(bed.monthlyRent)}
                      </span>
                    </div>
                  ))}
                </div>
                <p className="mt-1 text-[11px] text-[var(--color-on-surface-secondary)]">
                  {draft.bedCodes.length}/{draft.roomCapacity} giường được giữ bởi cùng phiếu đặt cọc.
                </p>
              </div>
              <FormField label="Tiền cọc">
                <input
                  inputMode="numeric"
                  value={draft.depositAmount}
                  onChange={(event) =>
                    updateDraft("depositAmount", event.target.value.replace(/\D/g, ""))
                  }
                  className={`${inputClasses} font-mono`}
                />
              </FormField>
              <FormField label="Giá thuê/tháng">
                <input
                  inputMode="numeric"
                  value={draft.monthlyRent}
                  onChange={(event) =>
                    updateDraft("monthlyRent", event.target.value.replace(/\D/g, ""))
                  }
                  className={`${inputClasses} font-mono`}
                />
              </FormField>
              <FormField label="Phí dịch vụ/tháng">
                <input
                  inputMode="numeric"
                  value={draft.serviceFee}
                  onChange={(event) =>
                    updateDraft("serviceFee", event.target.value.replace(/\D/g, ""))
                  }
                  className={`${inputClasses} font-mono`}
                />
              </FormField>
            </div>
          </DetailSection>

          <DetailSection title="3. Xác nhận nhận phòng">
            <dl className="mb-3">
              <FieldRow label="Phiếu đăng ký" value={record.registrationCode} />
              <FieldRow label="Phiếu thanh toán" value={record.paymentCode} />
              <FieldRow label="Ngày cọc" value={formatDate(record.depositedAt)} />
              <FieldRow label="Tiền cọc" value={formatCurrency(record.depositAmount)} />
            </dl>
            <div className="grid gap-2">
              <CheckboxRow
                checked={draft.checkInConfirmed}
                onChange={(checked) => updateDraft("checkInConfirmed", checked)}
              >
                Khách đã có mặt và xác nhận nhận phòng.
              </CheckboxRow>
              <CheckboxRow
                checked={draft.roomConditionConfirmed}
                onChange={(checked) => updateDraft("roomConditionConfirmed", checked)}
              >
                Phòng/giường đủ điều kiện bàn giao.
              </CheckboxRow>
              <CheckboxRow
                checked={draft.documentConfirmed}
                onChange={(checked) => updateDraft("documentConfirmed", checked)}
              >
                Thông tin giấy tờ đã được kiểm tra.
              </CheckboxRow>
            </div>
          </DetailSection>

          <OccupantsSection
            draft={draft}
            expectedOccupantCount={expectedOccupantCount}
            hasReachedOccupantLimit={hasReachedOccupantLimit}
            onAddOccupant={addOccupant}
            onRemoveOccupant={removeOccupant}
            onUpdateOccupant={updateOccupant}
          />

          <DetailSection title="5. Thông tin hợp đồng">
            <div className="grid gap-3 sm:grid-cols-2">
              <FormField label="Ngày bắt đầu" required>
                <input
                  type="date"
                  value={draft.startDate}
                  onChange={(event) => updateDraft("startDate", event.target.value)}
                  className={inputClasses}
                />
              </FormField>
              <FormField label="Chu kỳ thanh toán">
                <select
                  value={draft.paymentCycle}
                  onChange={(event) =>
                    updateDraft(
                      "paymentCycle",
                      event.target.value as ContractDraft["paymentCycle"],
                    )
                  }
                  className={inputClasses}
                >
                  <option value="monthly">Theo tháng</option>
                  <option value="quarterly">Theo quý</option>
                </select>
              </FormField>
              <FormField label="Ghi chú">
                <textarea
                  value={draft.note}
                  onChange={(event) => updateDraft("note", event.target.value)}
                  rows={3}
                  className="w-full resize-none rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-surface)] px-2.5 py-2 text-[12px] outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary-container)] sm:col-span-2"
                />
              </FormField>
            </div>
          </DetailSection>
        </div>

        <div className="flex shrink-0 flex-col gap-3 border-t border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="text-[12px] text-[var(--color-on-surface-secondary)]">
            <span className="font-semibold text-[var(--color-on-surface)]">
              {draft.occupants.length}
            </span>{" "}
            người · {getRentalTypeLabel(draft.rentalType)} ·{" "}
            <span className="font-semibold text-[var(--color-on-surface)]">
              {draft.roomCode} / {draft.bedCodes.join(", ")}
            </span>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
            <ActionButton icon={ArrowLeft} onClick={onCancel}>
              Hủy thay đổi
            </ActionButton>
            <ActionButton icon={Send} type="submit" variant="primary" disabled={!canSubmit}>
              Lập hợp đồng
            </ActionButton>
          </div>
        </div>
      </form>
    </section>
  );
}

type OccupantsSectionProps = {
  draft: ContractDraft;
  expectedOccupantCount: number;
  hasReachedOccupantLimit: boolean;
  onAddOccupant: () => void;
  onRemoveOccupant: (occupantId: string) => void;
  onUpdateOccupant: <Key extends keyof ContractOccupant>(
    occupantId: string,
    key: Key,
    value: ContractOccupant[Key],
  ) => void;
};

function OccupantsSection({
  draft,
  expectedOccupantCount,
  hasReachedOccupantLimit,
  onAddOccupant,
  onRemoveOccupant,
  onUpdateOccupant,
}: OccupantsSectionProps) {
  return (
    <section className="border-b border-[var(--color-border)]">
      <div className="flex items-center justify-between gap-3 border-l-[3px] border-[var(--color-primary)] bg-[#FAFBFF] px-3 pb-2 pt-2.5">
        <h3 className="text-[12px] font-semibold uppercase leading-[1.2] tracking-[0.05em] text-[var(--color-primary)]">
          4. Danh sách người trong hợp đồng
        </h3>
        <span className="shrink-0 rounded-full bg-[var(--color-surface)] px-3 py-1 text-[11px] font-semibold text-[var(--color-primary)]">
          Tổng: {draft.occupants.length} / {expectedOccupantCount}
        </span>
      </div>

      <div className="px-3 pb-3 pt-2">
        <div className="max-h-[320px] overflow-auto rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-surface)]">
          {draft.occupants.map((occupant, index) => (
            <div
              key={occupant.id}
              className="border-b border-[var(--color-border)] p-3 last:border-b-0"
            >
              <div className="grid gap-3 lg:grid-cols-[92px_1.2fr_128px_110px_138px_32px] lg:items-end">
                <div className="flex items-center gap-2 lg:flex-col lg:items-start lg:gap-1">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[var(--color-on-secondary)]">
                    Người {index + 1}
                  </p>
                  {index === 0 ? (
                    <span className="rounded-full bg-[var(--color-primary-container)] px-2 py-1 text-[10px] font-semibold text-[var(--color-primary)]">
                      Đại diện
                    </span>
                  ) : null}
                </div>

                <FormField label="Họ tên" required>
                  <input
                    value={occupant.fullName}
                    onChange={(event) =>
                      onUpdateOccupant(occupant.id, "fullName", event.target.value)
                    }
                    className={inputClasses}
                  />
                </FormField>
                <FormField label="CCCD/CMND" required>
                  <input
                    value={occupant.identityNumber}
                    onChange={(event) =>
                      onUpdateOccupant(occupant.id, "identityNumber", event.target.value)
                    }
                    className={inputClasses}
                  />
                </FormField>
                <FormField label="Giới tính" required>
                  <select
                    value={occupant.gender}
                    onChange={(event) =>
                      onUpdateOccupant(
                        occupant.id,
                        "gender",
                        event.target.value as ContractOccupant["gender"],
                      )
                    }
                    className={inputClasses}
                  >
                    <option value="">Chọn</option>
                    <option value="male">Nam</option>
                    <option value="female">Nữ</option>
                    <option value="other">Khác</option>
                  </select>
                </FormField>
                <FormField label="Ngày sinh" required>
                  <input
                    type="date"
                    value={occupant.dateOfBirth}
                    onChange={(event) =>
                      onUpdateOccupant(occupant.id, "dateOfBirth", event.target.value)
                    }
                    className={inputClasses}
                  />
                </FormField>
                <div className="flex items-end justify-end">
                  {index === 0 ? (
                    <span className="hidden h-8 w-8 lg:block" />
                  ) : (
                    <button
                      type="button"
                      onClick={() => onRemoveOccupant(occupant.id)}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-[var(--radius-sm)] border border-[var(--color-error)] text-[var(--color-error)] hover:bg-[var(--color-error-container)]"
                      title="Xóa người ở"
                    >
                      <Trash2 aria-hidden="true" className="h-3.5 w-3.5" strokeWidth={2} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-2 flex justify-end">
          <ActionButton
            icon={Plus}
            onClick={onAddOccupant}
            disabled={hasReachedOccupantLimit}
          >
            Thêm người ở
          </ActionButton>
        </div>
      </div>
    </section>
  );
}

function CheckboxRow({
  checked,
  onChange,
  children,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  children: React.ReactNode;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2 rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-[12px] hover:bg-[var(--color-secondary)]">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="h-4 w-4 accent-[var(--color-primary)]"
      />
      <span className="text-[var(--color-on-surface)]">{children}</span>
    </label>
  );
}

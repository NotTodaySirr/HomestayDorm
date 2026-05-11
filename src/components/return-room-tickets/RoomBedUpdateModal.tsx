"use client";

import { AlertTriangle, ArrowLeft, Check, DoorOpen, Wrench } from "lucide-react";
import { useMemo, useState } from "react";
import type {
  ReturnRoomTicket,
  RoomBedUpdateSubmission,
} from "@/lib/return-room-tickets/types";
import {
  buildRoomBedModalData,
  buildRoomBedSubmission,
  summarizeRoomStatus,
  validateRoomBedUpdates,
} from "./logic/roomBedFinalization";
import { ActionButton, FieldRow } from "./ui";

type RoomBedUpdateModalProps = {
  ticket: ReturnRoomTicket;
  open: boolean;
  onClose: () => void;
  onSubmit: (submission: RoomBedUpdateSubmission) => void;
};

export function RoomBedUpdateModal({
  ticket,
  open,
  onClose,
  onSubmit,
}: RoomBedUpdateModalProps) {
  const modalData = useMemo(() => buildRoomBedModalData(ticket), [ticket]);
  const [editableBeds, setEditableBeds] = useState(modalData.editableBeds);
  const [generalNote, setGeneralNote] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const summary = useMemo(
    () => summarizeRoomStatus(modalData.allBeds, editableBeds),
    [editableBeds, modalData.allBeds],
  );

  if (!open) {
    return null;
  }

  function handleClose() {
    if (hasUnsavedChanges(editableBeds, modalData.editableBeds, generalNote)) {
      const shouldClose = window.confirm(
        "Bạn có thay đổi chưa lưu. Bạn có chắc muốn thoát?",
      );
      if (!shouldClose) {
        return;
      }
    }

    onClose();
  }

  function handleSubmit() {
    const validationError = validateRoomBedUpdates(editableBeds);
    if (validationError) {
      setErrorMessage(validationError);
      return;
    }

    setErrorMessage(null);
    onSubmit(buildRoomBedSubmission(modalData.allBeds, editableBeds, generalNote));
  }

  return (
    <div className="absolute inset-0 z-[120] bg-[var(--color-surface)] shadow-lg">
      <div className="flex h-full w-full flex-col bg-[var(--color-surface)]">
        <header className="flex items-start justify-between border-b border-[var(--color-border)] px-5 py-4">
          <div>
            <button
              type="button"
              onClick={handleClose}
              className="mb-2 inline-flex items-center gap-1 rounded-[var(--radius-sm)] border border-[var(--color-border)] px-2 py-1 text-[12px] text-[var(--color-on-surface-secondary)] hover:bg-[var(--color-secondary)]"
            >
              <ArrowLeft className="h-4 w-4" />
              Quay lại
            </button>
            <h2 className="text-[18px] font-semibold text-[var(--color-on-surface)]">
              Cập nhật phòng/giường sau trả phòng
            </h2>
            <p className="mt-1 text-[12px] text-[var(--color-on-surface-secondary)]">
              {ticket.code} · {ticket.contract.code} · {ticket.tenant.name} ·{" "}
              {ticket.room.roomCode} · {modalData.rentalTypeLabel}
            </p>
          </div>

        </header>

        <div className="grid min-h-0 flex-1 grid-cols-1 gap-0 xl:grid-cols-[1fr_320px]">
          <main className="min-h-0 overflow-auto p-5">
            <section className="rounded-[var(--radius-md)] border border-[var(--color-border)] p-4">
              <h3 className="text-[12px] font-semibold uppercase tracking-[0.05em] text-[var(--color-primary)]">
                Phạm vi cập nhật
              </h3>
              <dl className="mt-2">
                <FieldRow label="Loại thuê" value={modalData.rentalTypeLabel} />
                <FieldRow label="Phòng" value={ticket.room.roomCode} />
                <FieldRow label="Tổng số giường" value={String(modalData.allBeds.length)} />
                <FieldRow
                  label="Giường thuộc hợp đồng"
                  value={modalData.contractedBeds.map((bed) => bed.bedCode).join(", ")}
                />
                <FieldRow
                  label="Giường giữ nguyên"
                  value={
                    modalData.uncontractedBeds.length > 0
                      ? modalData.uncontractedBeds.map((bed) => bed.bedCode).join(", ")
                      : "Không có"
                  }
                />
              </dl>
            </section>

            <section className="mt-4 rounded-[var(--radius-md)] border border-[var(--color-border)]">
              <div className="border-b border-[var(--color-border)] px-4 py-3">
                <h3 className="text-[12px] font-semibold uppercase tracking-[0.05em] text-[var(--color-primary)]">
                  Bảng giường thuộc hợp đồng
                </h3>
              </div>
              <div className="overflow-auto">
                <table className="min-w-[760px] w-full text-left text-[12px]">
                  <thead className="bg-[var(--color-secondary)] text-[11px] font-semibold uppercase tracking-[0.05em] text-[var(--color-on-secondary)]">
                    <tr>
                      <th className="px-3 py-2">Giường</th>
                      <th className="px-3 py-2">Trạng thái hiện tại</th>
                      <th className="px-3 py-2">Kết quả kiểm tra</th>
                      <th className="px-3 py-2">Trạng thái sau trả</th>
                      <th className="px-3 py-2">Ghi chú</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--color-border)]">
                    {editableBeds.map((bed, index) => (
                      <tr key={bed.bedCode}>
                        <td className="px-3 py-2 font-medium">{bed.bedCode}</td>
                        <td className="px-3 py-2">{renderCurrentBedStatus(bed.currentStatus)}</td>
                        <td className="px-3 py-2">{renderInspectionResult(bed.inspectionResult)}</td>
                        <td className="px-3 py-2">
                          <select
                            value={bed.statusAfterCheckout}
                            onChange={(event) =>
                              setEditableBeds((current) =>
                                current.map((item, currentIndex) =>
                                  currentIndex === index
                                    ? {
                                        ...item,
                                        statusAfterCheckout: event.target.value as
                                          | "TRONG"
                                          | "CAN_BAO_TRI",
                                      }
                                    : item,
                                ),
                              )
                            }
                            className="h-8 rounded-[var(--radius-sm)] border border-[var(--color-border)] px-2"
                          >
                            <option value="TRONG">Trống</option>
                            <option value="CAN_BAO_TRI">Cần bảo trì</option>
                          </select>
                        </td>
                        <td className="px-3 py-2">
                          <input
                            value={bed.note}
                            onChange={(event) =>
                              setEditableBeds((current) =>
                                current.map((item, currentIndex) =>
                                  currentIndex === index
                                    ? { ...item, note: event.target.value }
                                    : item,
                                ),
                              )
                            }
                            placeholder={
                              bed.statusAfterCheckout === "CAN_BAO_TRI"
                                ? "Bắt buộc nếu cần bảo trì"
                                : "Không bắt buộc"
                            }
                            className="h-8 w-full rounded-[var(--radius-sm)] border border-[var(--color-border)] px-2"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <section className="mt-4 rounded-[var(--radius-md)] border border-[var(--color-border)] p-4">
              <h3 className="text-[12px] font-semibold uppercase tracking-[0.05em] text-[var(--color-primary)]">
                Ghi chú cập nhật
              </h3>
              <textarea
                value={generalNote}
                onChange={(event) => setGeneralNote(event.target.value)}
                rows={3}
                className="mt-2 w-full resize-none rounded-[var(--radius-sm)] border border-[var(--color-border)] px-3 py-2"
                placeholder="Nhập ghi chú tổng quan (nếu có)"
              />
            </section>
          </main>

          <aside className="border-t border-[var(--color-border)] bg-[#FAFBFF] p-5 xl:border-l xl:border-t-0">
            <h3 className="text-[12px] font-semibold uppercase tracking-[0.05em] text-[var(--color-primary)]">
              Kết luận cập nhật
            </h3>
            <dl className="mt-3">
              <FieldRow label="Giường thuộc HD" value={String(modalData.contractedBeds.length)} />
              <FieldRow label="Trống" value={String(summary.emptyCount)} />
              <FieldRow label="Cần bảo trì" value={String(summary.maintenanceCount)} />
              <FieldRow label="Vẫn đang thuê" value={String(summary.occupiedCount)} />
              <FieldRow label="Trạng thái phòng" value={renderRoomStatus(summary.roomStatus)} />
              <FieldRow label="Hợp đồng" value="Sẽ cập nhật thành Đã thanh lý" />
            </dl>
          </aside>
        </div>

        <footer className="flex shrink-0 items-center justify-between border-t border-[var(--color-border)] px-5 py-3">
          <div className="min-h-5 text-[12px] text-[var(--color-error)]">
            {errorMessage ? (
              <span className="inline-flex items-center gap-1">
                <AlertTriangle className="h-4 w-4" />
                {errorMessage}
              </span>
            ) : null}
          </div>
          <div className="flex items-center gap-2">
            <ActionButton onClick={handleClose}>Hủy</ActionButton>
            <ActionButton variant="primary" icon={Check} onClick={handleSubmit}>
              Xác nhận cập nhật
            </ActionButton>
          </div>
        </footer>
      </div>
    </div>
  );
}

function renderCurrentBedStatus(status: string) {
  if (status === "DANG_THUE") {
    return (
      <span className="inline-flex items-center gap-1 text-[var(--color-primary)]">
        <DoorOpen className="h-4 w-4" />
        Đang thuê
      </span>
    );
  }

  if (status === "CAN_BAO_TRI") {
    return (
      <span className="inline-flex items-center gap-1 text-[var(--color-warning)]">
        <Wrench className="h-4 w-4" />
        Cần bảo trì
      </span>
    );
  }

  if (status === "TRONG") {
    return "Trống";
  }

  return "Không khả dụng";
}

function renderInspectionResult(
  result: "DAT" | "HU_HONG" | "MAT_TAI_SAN" | "CAN_KIEM_TRA",
) {
  if (result === "DAT") {
    return "Đạt";
  }

  if (result === "HU_HONG") {
    return "Hư hỏng";
  }

  if (result === "MAT_TAI_SAN") {
    return "Mất tài sản";
  }

  return "Cần kiểm tra";
}

function renderRoomStatus(
  status: "TRONG" | "DANG_CO_NGUOI_O" | "CAN_BAO_TRI" | "KHONG_KHA_DUNG",
) {
  if (status === "TRONG") {
    return "Trống";
  }
  if (status === "DANG_CO_NGUOI_O") {
    return "Đang có người ở";
  }
  if (status === "CAN_BAO_TRI") {
    return "Cần bảo trì";
  }
  return "Không khả dụng";
}

function hasUnsavedChanges(
  current: Array<{ statusAfterCheckout: string; note: string }>,
  original: Array<{ statusAfterCheckout: string; note: string }>,
  generalNote: string,
) {
  if (generalNote.trim()) {
    return true;
  }

  if (current.length !== original.length) {
    return true;
  }

  return current.some(
    (item, index) =>
      item.statusAfterCheckout !== original[index].statusAfterCheckout ||
      item.note !== original[index].note,
  );
}

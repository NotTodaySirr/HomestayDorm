import type {
  ReturnRoomTicket,
  RoomBedUpdateSubmission,
} from "@/lib/return-room-tickets/types";
import type { ReconciliationSubmission } from "../WorkflowPanels";

export function applyReconciliationSubmission(
  ticket: ReturnRoomTicket,
  submission: ReconciliationSubmission,
  completedAt: string,
): ReturnRoomTicket {
  return {
    ...ticket,
    status: "waitingAccounting",
    nextAction: "Theo dõi kế toán xử lý",
    reconciliation: {
      code: ticket.reconciliation?.code ?? createReconciliationCode(ticket),
      status: "Chờ kế toán xử lý",
      hygieneStatus: submission.hygieneStatus,
      keycardStatus: submission.keycardStatus,
      hasDamageOrLoss: submission.hasDamageOrLoss,
      managerNotes: submission.managerNotes || "Không có ghi chú thêm.",
      estimatedDeductions:
        submission.estimatedCost > 0 || submission.damageDescription
          ? [
              {
                id: `${ticket.id}-manager-deduction-${completedAt}`,
                description:
                  submission.damageDescription || "Khoản khấu trừ quản lý",
                amount: submission.estimatedCost,
                source: "manager",
              },
            ]
          : [],
    },
  };
}

export function applyCustomerAgreement(
  ticket: ReturnRoomTicket,
  confirmedAt: string,
): ReturnRoomTicket {
  return {
    ...ticket,
    status: "customerConfirmed",
    nextAction: "Cập nhật phòng/giường",
    customerConfirmation: {
      status: "agreed",
      confirmedAt,
    },
  };
}

export function applyCustomerDisagreement(
  ticket: ReturnRoomTicket,
): ReturnRoomTicket {
  return {
    ...ticket,
    status: "needsRecheck",
    nextAction: "Kiểm tra lại khoản đối soát",
    reconciliation: ticket.reconciliation
      ? {
          ...ticket.reconciliation,
          status: "Cần kiểm tra lại",
        }
      : ticket.reconciliation,
    customerConfirmation: {
      status: "disagreed",
      disagreementReason: "Khách yêu cầu kiểm tra lại khoản khấu trừ.",
    },
  };
}

export function applyRoomBedUpdateSubmission(
  ticket: ReturnRoomTicket,
  submission: RoomBedUpdateSubmission,
  completedAt: string,
): ReturnRoomTicket {
  const mergedBeds =
    ticket.room.beds?.map((bed) => {
      const updated = submission.updates.find((item) => item.bedCode === bed.bedCode);
      if (!updated) {
        return bed;
      }

      return {
        ...bed,
        currentStatus: updated.statusAfterCheckout,
      };
    }) ?? ticket.room.beds;

  return {
    ...ticket,
    status: "completed",
    nextAction: "Không còn hành động bắt buộc",
    contract: {
      ...ticket.contract,
      status: "Đã thanh lý",
      stayStatus: "Đã trả phòng",
    },
    room: {
      ...ticket.room,
      beds: mergedBeds,
      currentStatus: mapRoomStatusToLabel(submission.roomStatusAfterCheckout),
      actualReturnDate: completedAt,
    },
    roomFinalization: {
      status:
        submission.roomStatusAfterCheckout === "CAN_BAO_TRI"
          ? "maintenance"
          : "available",
      note: submission.generalNote || undefined,
      completedAt,
      updatedBeds: submission.updates,
      roomStatusAfterCheckout: submission.roomStatusAfterCheckout,
    },
  };
}

export function createReconciliationCode(ticket: ReturnRoomTicket) {
  return ticket.code.replace("PTP", "PDS");
}

function mapRoomStatusToLabel(
  roomStatus: "TRONG" | "DANG_CO_NGUOI_O" | "CAN_BAO_TRI" | "KHONG_KHA_DUNG",
) {
  if (roomStatus === "TRONG") {
    return "Trống";
  }

  if (roomStatus === "DANG_CO_NGUOI_O") {
    return "Đang có người ở";
  }

  if (roomStatus === "CAN_BAO_TRI") {
    return "Cần bảo trì";
  }

  return "Không khả dụng";
}

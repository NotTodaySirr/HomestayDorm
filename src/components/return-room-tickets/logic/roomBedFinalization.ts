import type {
  BedOccupancyStatus,
  ReturnRoomTicket,
  RoomBedState,
  RoomBedUpdateSubmission,
} from "@/lib/return-room-tickets/types";

export type EditableBed = {
  bedCode: string;
  currentStatus: BedOccupancyStatus;
  inspectionResult: "DAT" | "HU_HONG" | "MAT_TAI_SAN" | "CAN_KIEM_TRA";
  statusAfterCheckout: "TRONG" | "CAN_BAO_TRI";
  note: string;
};

export type RoomBedModalData = {
  rentalTypeLabel: string;
  allBeds: RoomBedState[];
  contractedBeds: RoomBedState[];
  uncontractedBeds: RoomBedState[];
  editableBeds: EditableBed[];
};

export function canUpdateRoomBeds(ticket: ReturnRoomTicket) {
  const allowedStatus =
    ticket.status === "customerConfirmed" ||
    ticket.status === "waitingDepositRefund" ||
    ticket.status === "waitingExtraPayment";

  return allowedStatus && ticket.roomFinalization.status === "notStarted";
}

export function buildRoomBedModalData(ticket: ReturnRoomTicket): RoomBedModalData {
  const allBeds = getAllBeds(ticket);
  const contractedBedCodes = getContractedBedCodes(ticket, allBeds);
  const contractedBeds = allBeds.filter((bed) =>
    contractedBedCodes.includes(bed.bedCode),
  );
  const uncontractedBeds = allBeds.filter(
    (bed) => !contractedBedCodes.includes(bed.bedCode),
  );

  return {
    rentalTypeLabel:
      ticket.rentalType === "THUE_NGUYEN_PHONG"
        ? "Thuê nguyên phòng"
        : "Thuê giường",
    allBeds,
    contractedBeds,
    uncontractedBeds,
    editableBeds: contractedBeds.map((bed) => {
      const inspectionResult = bed.inspectionResult ?? "DAT";
      return {
        bedCode: bed.bedCode,
        currentStatus: bed.currentStatus,
        inspectionResult,
        statusAfterCheckout: inspectionResult === "DAT" ? "TRONG" : "CAN_BAO_TRI",
        note: "",
      };
    }),
  };
}

export function validateRoomBedUpdates(editableBeds: EditableBed[]) {
  for (const bed of editableBeds) {
    if (bed.statusAfterCheckout === "CAN_BAO_TRI" && !bed.note.trim()) {
      return `Vui lòng nhập ghi chú cho giường ${bed.bedCode} cần bảo trì.`;
    }
  }

  return null;
}

export function buildRoomBedSubmission(
  allBeds: RoomBedState[],
  editableBeds: EditableBed[],
  generalNote: string,
): RoomBedUpdateSubmission {
  const updatedByCode = new Map(
    editableBeds.map((bed) => [bed.bedCode, bed.statusAfterCheckout]),
  );

  const mergedStatuses = allBeds.map((bed) => ({
    bedCode: bed.bedCode,
    currentStatus:
      updatedByCode.get(bed.bedCode) ??
      mapRoomBedCurrentStatusToPostCheckoutStatus(bed.currentStatus),
  }));

  return {
    roomStatusAfterCheckout: deriveRoomStatus(mergedStatuses),
    updates: editableBeds.map((bed) => ({
      bedCode: bed.bedCode,
      statusAfterCheckout: bed.statusAfterCheckout,
      note: bed.note.trim() || undefined,
    })),
    generalNote: generalNote.trim(),
  };
}

export function summarizeRoomStatus(allBeds: RoomBedState[], editableBeds: EditableBed[]) {
  const updatedByCode = new Map(
    editableBeds.map((bed) => [bed.bedCode, bed.statusAfterCheckout]),
  );

  let emptyCount = 0;
  let maintenanceCount = 0;
  let occupiedCount = 0;

  for (const bed of allBeds) {
    const effectiveStatus =
      updatedByCode.get(bed.bedCode) ??
      mapRoomBedCurrentStatusToPostCheckoutStatus(bed.currentStatus);

    if (effectiveStatus === "TRONG") {
      emptyCount += 1;
      continue;
    }

    if (effectiveStatus === "CAN_BAO_TRI") {
      maintenanceCount += 1;
      continue;
    }

    occupiedCount += 1;
  }

  return {
    emptyCount,
    maintenanceCount,
    occupiedCount,
    roomStatus: deriveRoomStatus(
      allBeds.map((bed) => ({
        bedCode: bed.bedCode,
        currentStatus:
          updatedByCode.get(bed.bedCode) ??
          mapRoomBedCurrentStatusToPostCheckoutStatus(bed.currentStatus),
      })),
    ),
  };
}

function getAllBeds(ticket: ReturnRoomTicket) {
  if (ticket.room.beds && ticket.room.beds.length > 0) {
    return ticket.room.beds;
  }

  return [
    {
      bedCode: ticket.room.bedCode,
      currentStatus: "DANG_THUE" as const,
      inspectionResult: ticket.reconciliation?.hasDamageOrLoss ? "HU_HONG" : "DAT",
    },
  ];
}

function getContractedBedCodes(ticket: ReturnRoomTicket, allBeds: RoomBedState[]) {
  if (ticket.rentalType === "THUE_NGUYEN_PHONG") {
    return allBeds.map((bed) => bed.bedCode);
  }

  if (ticket.contractedBedCodes && ticket.contractedBedCodes.length > 0) {
    return ticket.contractedBedCodes;
  }

  return [ticket.room.bedCode];
}

function mapRoomBedCurrentStatusToPostCheckoutStatus(status: BedOccupancyStatus) {
  if (status === "DANG_THUE") {
    return "DANG_THUE";
  }

  if (status === "CAN_BAO_TRI") {
    return "CAN_BAO_TRI";
  }

  if (status === "TRONG") {
    return "TRONG";
  }

  return "KHONG_KHA_DUNG";
}

function deriveRoomStatus(
  statuses: Array<{
    bedCode: string;
    currentStatus: "TRONG" | "CAN_BAO_TRI" | "DANG_THUE" | "KHONG_KHA_DUNG";
  }>,
): "TRONG" | "DANG_CO_NGUOI_O" | "CAN_BAO_TRI" | "KHONG_KHA_DUNG" {
  if (statuses.some((bed) => bed.currentStatus === "DANG_THUE")) {
    return "DANG_CO_NGUOI_O";
  }

  if (statuses.some((bed) => bed.currentStatus === "CAN_BAO_TRI")) {
    return "CAN_BAO_TRI";
  }

  if (statuses.every((bed) => bed.currentStatus === "TRONG")) {
    return "TRONG";
  }

  return "KHONG_KHA_DUNG";
}

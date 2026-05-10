import type { CheckInContractStatus } from "./types";

export type StatusTone = "success" | "error" | "warning" | "muted";

export const statusMeta: Record<
  CheckInContractStatus,
  { label: string; tone: StatusTone }
> = {
  waitingCheckIn: {
    label: "Chờ nhận phòng",
    tone: "warning",
  },
  contractCreated: {
    label: "Đã lập hợp đồng",
    tone: "success",
  },
  ended: {
    label: "Đã kết thúc",
    tone: "muted",
  },
  cancelled: {
    label: "Đã hủy",
    tone: "error",
  },
};

export const statusFilterOptions: Array<{
  value: CheckInContractStatus | "all";
  label: string;
}> = [
  { value: "all", label: "Tất cả trạng thái" },
  { value: "waitingCheckIn", label: "Chờ nhận phòng" },
  { value: "contractCreated", label: "Đã lập hợp đồng" },
  { value: "ended", label: "Đã kết thúc" },
  { value: "cancelled", label: "Đã hủy" },
];

import type { Metadata } from "next";
import { CheckInContractsWorkspace } from "@/components/check-in-contracts/CheckInContractsWorkspace";
import { getCheckInContractRecords } from "@/actions/check-in-contracts";

export const metadata: Metadata = {
  title: "Quản lý hợp đồng | HomestayDorm",
};

export default async function CheckInContractsPage() {
  const checkInContractRecords = await getCheckInContractRecords();
  
  return <CheckInContractsWorkspace initialRecords={checkInContractRecords} />;
}

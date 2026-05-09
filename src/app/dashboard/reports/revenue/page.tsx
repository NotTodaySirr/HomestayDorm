import type { Metadata } from "next";
import { getPaymentSlips } from "@/actions/payment-slips";
import { FinancialReportView } from "@/components/payment-slips/FinancialReportView";

export const metadata: Metadata = {
  title: "Báo cáo tài chính | HomestayDorm",
};

export default async function FinancialReportPage() {
  const slips = await getPaymentSlips();

  return <FinancialReportView slips={slips} />;
}

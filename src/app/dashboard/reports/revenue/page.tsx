import type { Metadata } from "next";
import { FinancialReportView } from "@/components/payment-slips/FinancialReportView";
import { paymentSlips } from "@/lib/payment-slips/mock-data";

export const metadata: Metadata = {
  title: "Báo cáo tài chính | HomestayDorm",
};

export default function FinancialReportPage() {
  return <FinancialReportView slips={paymentSlips} />;
}

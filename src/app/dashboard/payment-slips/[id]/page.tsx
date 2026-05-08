import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PaymentSlipDetailView } from "@/components/payment-slips/PaymentSlipDetailView";
import { paymentSlips } from "@/lib/payment-slips/mock-data";

export const metadata: Metadata = {
  title: "Chi tiết phiếu thanh toán | HomestayDorm",
};

type PaymentSlipDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function PaymentSlipDetailPage({
  params,
}: PaymentSlipDetailPageProps) {
  const { id } = await params;
  const slip = paymentSlips.find((item) => item.id === id);

  if (!slip) {
    notFound();
  }

  return <PaymentSlipDetailView slip={slip} />;
}

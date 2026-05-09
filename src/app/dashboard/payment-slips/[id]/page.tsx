import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPaymentSlipById } from "@/actions/payment-slips";
import { PaymentSlipDetailView } from "@/components/payment-slips/PaymentSlipDetailView";

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
  const slip = await getPaymentSlipById(id);

  if (!slip) {
    notFound();
  }

  return <PaymentSlipDetailView slip={slip} />;
}

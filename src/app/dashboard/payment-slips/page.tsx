import type { Metadata } from "next";
import { PaymentSlipsWorkspace } from "@/components/payment-slips/PaymentSlipsWorkspace";
import { paymentSlips } from "@/lib/payment-slips/mock-data";
import type { PaymentQueue } from "@/lib/payment-slips/types";

export const metadata: Metadata = {
  title: "Quản lý phiếu thanh toán | HomestayDorm",
};

type PaymentSlipsPageProps = {
  searchParams: Promise<{ queue?: string | string[] }>;
};

export default async function PaymentSlipsPage({
  searchParams,
}: PaymentSlipsPageProps) {
  const params = await searchParams;
  const queue = getQueue(params.queue);

  return <PaymentSlipsWorkspace initialSlips={paymentSlips} initialQueue={queue} />;
}

function getQueue(value: string | string[] | undefined): PaymentQueue {
  const queue = Array.isArray(value) ? value[0] : value;

  if (queue === "refund" || queue === "debt") {
    return queue;
  }

  return "all";
}

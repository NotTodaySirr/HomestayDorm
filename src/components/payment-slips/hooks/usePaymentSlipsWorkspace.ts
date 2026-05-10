import { useEffect, useMemo, useState } from "react";
import {
  countPaymentSlipsByQueue,
  filterPaymentSlips,
} from "@/components/payment-slips/logic/filters";
import type {
  PaymentQueue,
  PaymentSlip,
  PaymentSlipStatusFilter,
} from "@/lib/payment-slips/types";

export function usePaymentSlipsWorkspace(
  initialSlips: PaymentSlip[],
  initialQueue: PaymentQueue,
) {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<PaymentSlipStatusFilter>("all");
  const [queue, setQueue] = useState<PaymentQueue>(initialQueue);

  const queueCounts = useMemo(
    () => countPaymentSlipsByQueue(initialSlips),
    [initialSlips],
  );
  const visibleSlips = useMemo(
    () => filterPaymentSlips(initialSlips, { search, status, queue }),
    [initialSlips, queue, search, status],
  );

  useEffect(() => {
    setQueue(initialQueue);
  }, [initialQueue]);

  return {
    state: {
      search,
      status,
      queue,
      queueCounts,
      visibleSlips,
    },
    actions: {
      setSearch,
      setStatus,
      setQueue,
    },
  };
}

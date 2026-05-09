import { recordPaymentTransaction } from "@/actions/payment-slips";
import type {
  PaymentMethod,
  PaymentTransaction,
  TransactionDirection,
  TransactionStatus,
  TransactionType,
} from "@/lib/payment-slips/types";

type TransactionRequest = {
  paymentSlipCode?: unknown;
  type?: unknown;
  direction?: unknown;
  amount?: unknown;
  paymentMethod?: unknown;
  transactionDate?: unknown;
  bankTransactionCode?: unknown;
  proofFile?: unknown;
  note?: unknown;
  status?: unknown;
};

const transactionTypes: TransactionType[] = ["HOAN_COC", "THU_THEM"];
const transactionDirections: TransactionDirection[] = ["CHI_RA", "THU_VAO"];
const paymentMethods: PaymentMethod[] = ["TIEN_MAT", "CHUYEN_KHOAN"];
const transactionStatuses: TransactionStatus[] = [
  "CHO_XAC_NHAN",
  "DA_THANH_TOAN",
  "THAT_BAI",
  "HUY",
];

export async function POST(
  request: Request,
  context: RouteContext<"/api/payment-slips/[id]/transactions">,
) {
  const { id } = await context.params;
  const body = (await request.json()) as TransactionRequest;
  const transaction = parseTransaction(body);

  if ("error" in transaction) {
    return Response.json(
      {
        success: false,
        error: transaction.error,
      },
      { status: 400 },
    );
  }

  const result = await recordPaymentTransaction(id, transaction.value);

  return Response.json(result, {
    status: result.success ? 200 : 400,
  });
}

function parseTransaction(
  body: TransactionRequest,
): { value: PaymentTransaction } | { error: string } {
  if (typeof body.paymentSlipCode !== "string" || !body.paymentSlipCode.trim()) {
    return { error: "Field `paymentSlipCode` must be a non-empty string." };
  }
  if (!isOneOf(body.type, transactionTypes)) {
    return { error: "Field `type` must be HOAN_COC or THU_THEM." };
  }
  if (!isOneOf(body.direction, transactionDirections)) {
    return { error: "Field `direction` must be CHI_RA or THU_VAO." };
  }
  if (typeof body.amount !== "number" || !Number.isFinite(body.amount) || body.amount <= 0) {
    return { error: "Field `amount` must be a positive number." };
  }
  if (!isOneOf(body.paymentMethod, paymentMethods)) {
    return { error: "Field `paymentMethod` must be TIEN_MAT or CHUYEN_KHOAN." };
  }
  if (typeof body.transactionDate !== "string" || !body.transactionDate.trim()) {
    return { error: "Field `transactionDate` must be a non-empty string." };
  }
  if (Number.isNaN(new Date(body.transactionDate).getTime())) {
    return { error: "Field `transactionDate` must be a valid date." };
  }
  if (
    body.paymentMethod === "CHUYEN_KHOAN" &&
    (typeof body.bankTransactionCode !== "string" || !body.bankTransactionCode.trim())
  ) {
    return { error: "Field `bankTransactionCode` is required for transfer payments." };
  }
  if (body.status !== undefined && !isOneOf(body.status, transactionStatuses)) {
    return { error: "Field `status` is invalid." };
  }

  const paymentSlipCode = body.paymentSlipCode.trim();
  const type = body.type;
  const direction = body.direction;
  const amount = body.amount;
  const paymentMethod = body.paymentMethod;
  const transactionDate = body.transactionDate;
  const status: TransactionStatus =
    body.status === undefined ? "DA_THANH_TOAN" : body.status;

  return {
    value: {
      paymentSlipCode,
      type,
      direction,
      amount,
      paymentMethod,
      transactionDate,
      bankTransactionCode:
        typeof body.bankTransactionCode === "string"
          ? body.bankTransactionCode.trim() || undefined
          : undefined,
      proofFile:
        typeof body.proofFile === "string" ? body.proofFile.trim() || undefined : undefined,
      note: typeof body.note === "string" ? body.note.trim() || undefined : undefined,
      status,
    },
  };
}

function isOneOf<T extends string>(value: unknown, options: readonly T[]): value is T {
  return typeof value === "string" && options.includes(value as T);
}

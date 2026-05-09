import { confirmPaymentSlipCustomerResponse } from "@/actions/payment-slips";

type CustomerResponseRequest = {
  agreed?: unknown;
  disagreementReason?: unknown;
};

export async function POST(
  request: Request,
  context: RouteContext<"/api/payment-slips/[id]/customer-response">,
) {
  const { id } = await context.params;
  const body = (await request.json()) as CustomerResponseRequest;

  if (typeof body.agreed !== "boolean") {
    return Response.json(
      {
        success: false,
        error: "Field `agreed` must be a boolean.",
      },
      { status: 400 },
    );
  }

  const result = await confirmPaymentSlipCustomerResponse(id, {
    agreed: body.agreed,
    disagreementReason:
      typeof body.disagreementReason === "string"
        ? body.disagreementReason
        : undefined,
  });

  return Response.json(result, {
    status: result.success ? 200 : 400,
  });
}

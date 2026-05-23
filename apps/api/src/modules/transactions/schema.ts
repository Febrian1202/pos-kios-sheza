import { t, validationDetail, type Static } from "elysia";


export const bodySchemaTransaction = t.Object({
  items: t.Array(t.Object({
    productId: t.String({ format: "uuid", error: validationDetail("Product ID must be in UUID format") }),
    qty: t.Number({ error: validationDetail("QTY must be in number") }),
    unitPrice: t.Number({ error: validationDetail("Unit Price must be in number") }),
  }), { minItems: 1, error: validationDetail("Shopping cart cannot empty!") }),
  paymentMethod: t.Union([
    t.Literal("cash"),
    t.Literal("transfer"),
    t.Literal("qris"),
  ], { error: validationDetail("Payment method invalid!") }),
  amountPaid: t.Number({ error: validationDetail("Amount Paid must be a  number!") })
});

export type ArgsTransaction = Static<typeof bodySchemaTransaction>

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
  amountPaid: t.Number({ error: validationDetail("Amount Paid must be a  number!") }),
});

export type ArgsTransaction = Static<typeof bodySchemaTransaction>

export const querySchemaTransaction = t.Object({
  date: t.Optional(t.String({ format: "date", error: validationDetail("Date invalid") })),
  from: t.Optional(t.String({ error: validationDetail("Must be in string") })),
  to: t.Optional(t.String({ error: validationDetail("Must be in string") })),
  page: t.Numeric({ default: 1, error: validationDetail("Page must be a numeric") }),
  limit: t.Numeric({ default: 10, error: validationDetail("Limit must be a numeric") }),
});

export type ArgsGetTransaction = Static<typeof querySchemaTransaction>

export const paramsSchemaTransaction = t.Object({
  id: t.String({ format: "uuid", error: validationDetail("ID must be a UUID") })
});

export type ArgsGetTransactionDetail = Static<typeof paramsSchemaTransaction>

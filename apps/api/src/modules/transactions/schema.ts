import { transactionItems, transactions } from "@/db/schema";
import { schemaPagination, withSuccess, withSuccessMeta } from "@/shared";
import { createSelectSchema } from "drizzle-typebox";
import { t, validationDetail, type Static } from "elysia";

const baseTransaction = createSelectSchema(transactions);
const baseItem = createSelectSchema(transactionItems);

const itemWithProduct = t.Composite([
  baseItem,
  t.Object({
    product: t.Object({
      name: t.String()
    })
  })
])

const fullTransaction = t.Composite([
  baseTransaction,
  t.Object({
    cashier: t.Nullable(t.Object({
      name: t.String()
    })),
    items: t.Array(itemWithProduct)
  })
])

export const schemaResponseGet = withSuccessMeta(
  t.Array(fullTransaction),
  schemaPagination
)

const detailTransactionBase = t.Pick(baseTransaction, [
  "trxNumber",
  "totalAmount",
  "amountPaid",
  "changeAmount",
  "paymentMethod",
  "createdAt"
]);

const detailItemBase = t.Pick(baseItem, [
  "id",
  "qty",
  "unitPrice",
  "subtotal",
  "createdAt"
]);

const detailItemWithProduct = t.Composite([
  detailItemBase,
  t.Object({
    product: t.Object({
      id: t.String(),
      name: t.String(),
      createdAt: t.Date()
    })
  })
]);

export const schemaResponseGetDetail = withSuccess(
  t.Composite([
    detailTransactionBase,
    t.Object({
      items: t.Array(detailItemWithProduct)
    })
  ])
)

export const schemaResponsePost = t.Object({
  trxNumber: t.String(),
  totalAmount: t.Number(),
  changeAmount: t.Number()
})

export const schemaResponsePostVoid = t.Pick(schemaResponsePost, ["trxNumber"])

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

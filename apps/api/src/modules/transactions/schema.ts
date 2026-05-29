import { transactionItems, transactions } from "@/db/schema";
import { schemaPagination, withSuccess, withSuccessMeta } from "@/shared";
import { createSelectSchema } from "drizzle-typebox";
import { t, validationDetail, type Static } from "elysia";

// --- Constants ---

const PAYMENT_METHODS = [
  t.Literal("cash"),
  t.Literal("transfer"),
  t.Literal("qris"),
];

const createPaymentMethodSchema = (errorMessage = "Payment method invalid!") =>
  t.Union(PAYMENT_METHODS, { error: validationDetail(errorMessage) });

// --- Request Schemas ---

export const bodySchemaTransaction = t.Object({
  items: t.Array(t.Object({
    productId: t.String({ format: "uuid", error: validationDetail("Product ID must be in UUID format") }),
    qty: t.Number({ error: validationDetail("QTY must be a number") }),
    unitPrice: t.Number({ error: validationDetail("Unit Price must be a number") }),
  }), { minItems: 1, error: validationDetail("Shopping cart cannot be empty!") }),
  paymentMethod: createPaymentMethodSchema(),
  amountPaid: t.Number({ error: validationDetail("Amount Paid must be a number!") }),
});

export type ArgsTransaction = Static<typeof bodySchemaTransaction>

export const querySchemaTransaction = t.Object({
  date: t.Optional(t.String({ format: "date", error: validationDetail("Date invalid") })),
  from: t.Optional(t.String({ error: validationDetail("Must be a string") })),
  to: t.Optional(t.String({ error: validationDetail("Must be a string") })),
  page: t.Numeric({ default: 1, error: validationDetail("Page must be numeric") }),
  limit: t.Numeric({ default: 10, error: validationDetail("Limit must be numeric") }),
});

export type ArgsGetTransaction = Static<typeof querySchemaTransaction>

export const schemaParamsId = t.Object({
  id: t.String({ format: "uuid", error: validationDetail("ID must be a UUID") })
});

// Alias for backward compatibility or semantic clarity
export const paramsSchemaTransaction = schemaParamsId;

export type ArgsGetTransactionDetail = Static<typeof schemaParamsId>

// --- Response Schemas ---

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

export const schemaResponsePost = withSuccess(
  t.Object({
    trxNumber: t.String(),
    totalAmount: t.Number(),
    changeAmount: t.Number()
  })
)

export const schemaResponsePostVoid = withSuccess(
  t.Pick(t.Object({ trxNumber: t.String() }), ["trxNumber"])
)

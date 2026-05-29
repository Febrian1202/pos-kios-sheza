import { brilinkTransactions } from "@/db/schema";
import { withSuccess } from "@/shared";
import { createInsertSchema, createSelectSchema } from "drizzle-typebox";
import { t, validationDetail, type Static } from "elysia";

// --- Constants & Helpers ---
const REGEX_SAFE_NOTES = "^[^<>{}]+$";
const REGEX_ALPHANUMERIC = "^[a-zA-Z0-9]+$";

const TRX_TYPES = [
  t.Literal("transfer"),
  t.Literal("tarik_tunai"),
  t.Literal("pembayaran"),
  t.Literal("e-wallet"),
  t.Literal("other"),
];

const createTrxTypeSchema = (errorMessage = "Trx Type invalid!") => 
  t.Union(TRX_TYPES, { error: validationDetail(errorMessage) });

const trxType = createTrxTypeSchema();

// --- Request Schemas ---

const baseBrilinkSchema = createInsertSchema(brilinkTransactions, {
  trxType: trxType,
  agentCommission: t.Numeric({ exclusiveMinimum: 0, error: validationDetail("Agent commission cannot empty!") }),
  customerAmount: t.Numeric({ minimum: 0, error: validationDetail("Customer amount invalid!") }),
  adminFeeCharged: t.Numeric({ minimum: 0, error: validationDetail("Admin fee invalid!") }),
  notes: t.Optional(t.String({
    pattern: REGEX_SAFE_NOTES,
    error: validationDetail("Notes must not contain the characters <, >, {, or }.")
  })),
  referenceNumber: t.String({
    pattern: REGEX_ALPHANUMERIC,
    error: validationDetail("The reference number may only contain letters and numbers.")
  })
})

export const schemaBodyBrilink = t.Omit(baseBrilinkSchema, ["id", "status", "tenantId", "createdAt", "cashierId"])

export type ArgsBrilink = Static<typeof schemaBodyBrilink>

export const schemaQueryBrilink = t.Object({
  date: t.Optional(t.String({ format: "date", error: validationDetail("Date invalid!") })),
  type: t.Optional(createTrxTypeSchema("Type invalid!"))
})

export type ArgsGetBrilink = Static<typeof schemaQueryBrilink>

export const schemaQuerySummaryBrilink = t.Object({
  date: t.String({ format: "date", error: validationDetail("Date invalid!") })
})

export type ArgsGetSummaryBrilink = Static<typeof schemaQuerySummaryBrilink>

export const schemaParamsDetailBrilink = t.Object({
  id: t.String({ format: "uuid", error: validationDetail("ID must be in UUID") })
})

export type ArgsGetBrilinkDetail = Static<typeof schemaParamsDetailBrilink>

// --- Response Schemas ---

const baseBrilink = createSelectSchema(brilinkTransactions)

const brilinkWithCashier = t.Composite([
  t.Omit(baseBrilink, ["tenantId"]),
  t.Object({
    cashier: t.Object({
      name: t.String()
    })
  })
])

export const schemaResponseGet = withSuccess(
  t.Array(brilinkWithCashier)
)

export const schemaResponseGetSummary = withSuccess(
  t.Object({
    date: t.String({ format: "date" }),
    grandTotalCommission: t.Number(),
    grandTotalTransaction: t.Number(),
    breakdown: t.Array(t.Object({
      trxType,
      totalTransaction: t.Number(),
      totalCommission: t.Number()
    }))
  })
);

export const schemaResponsePost = withSuccess(
  t.Object({
    tenantId: t.String({ format: "uuid" }),
    cashierId: t.String({ format: "uuid" }),
    customerAmount: t.String(),
    trxType: trxType,
    adminFeeCharged: t.String(),
    agentCommission: t.String(),
    status: t.String(),
  })
)

export const schemaResponseGetDetail = withSuccess(
  baseBrilink
)

export const schemaResponsePostVoid = withSuccess(
  t.Pick(baseBrilink, ["referenceNumber", "id", "status"])
)

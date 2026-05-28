import { brilinkTransactions } from "@/db/schema";
import { createInsertSchema } from "drizzle-typebox";
import { t, validationDetail, type Static } from "elysia";

const regexSafeNotes = "^[^<>{}]+$";
const regexSafeRefNumber = "^[a-zA-Z0-9]+$";

const baseBrilinkSchema = createInsertSchema(brilinkTransactions, {
  trxType: t.Union([
    t.Literal("transfer"),
    t.Literal("tarik_tunai"),
    t.Literal("pembayaran"),
    t.Literal("e-wallet"),
    t.Literal("other"),
  ], { error: validationDetail("Trx Type invalid!") }),
  agentCommission: t.Numeric({ exclusiveMinimum: 0, error: validationDetail("Agent commission cannot empty!") }),
  customerAmount: t.Numeric({ minimum: 0, error: validationDetail("Customer amount invalid!") }),
  adminFeeCharged: t.Numeric({ minimum: 0, error: validationDetail("Admin fee invalid!") }),
  notes: t.Optional(t.String({
    pattern: regexSafeNotes,
    error: validationDetail("Notes must not contain the characters <, >, {, or }.")
  })),
  referenceNumber: t.Optional(t.String({
    pattern: regexSafeRefNumber,
    error: validationDetail("The reference number may only contain letters and numbers.")
  }))
})

export const schemaBodyBrilink = t.Omit(baseBrilinkSchema, ["id", "status", "tenantId", "createdAt", "cashierId"])

export type ArgsBrilink = Static<typeof schemaBodyBrilink>

export const schemaQueryBrilink = t.Object({
  date: t.Optional(t.String({ format: "date", error: validationDetail("Date invalid!") })),
  type: t.Optional(t.Union([
    t.Literal("transfer"),
    t.Literal("tarik_tunai"),
    t.Literal("pembayaran"),
    t.Literal("e-wallet"),
    t.Literal("other"),
  ], {
    error: validationDetail("Type invalid!")
  }))
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

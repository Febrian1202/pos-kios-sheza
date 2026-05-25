import { brilinkTransactions } from "@/db/schema";
import { createInsertSchema } from "drizzle-typebox";
import { t, validationDetail, type Static } from "elysia";

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

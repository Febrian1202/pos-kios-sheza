import { dailySummaries } from "@/db/schema";
import { withSuccess } from "@/shared";
import { createSelectSchema } from "drizzle-typebox";
import { t, validationDetail, type Static } from "elysia";

// --- Request Schemas ---

export const schemaQueryDailySummary = t.Object({
  date: t.String({ format: "date", error: validationDetail("Must be in YYYY-MM-DD date format") })
});

export type ArgsQueryDailySummary = Static<typeof schemaQueryDailySummary>;

export const schemaQueryMonthlySummary = t.Object({
  month: t.String({ pattern: "^\\d{4}-\\d{2}$", error: validationDetail("Month format must be YYYY-MM") })
})

export type ArgsQueryMonthlySummary = Static<typeof schemaQueryMonthlySummary>;

// --- Response Schemas ---

const baseDailySummary = createSelectSchema(dailySummaries);

export const schemaResponseDaily = withSuccess(baseDailySummary);

export const schemaResponseMonthly = withSuccess(
  t.Object({
    month: t.String(),
    retailRevenue: t.Number(),
    retailCogs: t.Number(),
    brilinkCommission: t.Number(),
    totalRevenue: t.Number(),
    grossProfit: t.Number(),
    trxCount: t.Number(),
  })
);

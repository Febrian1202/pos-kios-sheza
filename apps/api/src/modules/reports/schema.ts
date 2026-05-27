import { t, validationDetail, type Static } from "elysia";

export const schemaQueryDailySummary = t.Object({
  date: t.String({ format: "date", error: validationDetail("Must be in date format") })
});

export type ArgsQueryDailySummary = Static<typeof schemaQueryDailySummary>;

export const schemaQueryMonthlySummary = t.Object({
  month: t.String({ pattern: "^\\d{4}-\\d{2}$", error: validationDetail("Month format must be YYYY-MM") })
})

export type ArgsQueryMonthlySummary = Static<typeof schemaQueryMonthlySummary>;

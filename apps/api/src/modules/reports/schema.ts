import { t, validationDetail, type Static } from "elysia";

export const schemaQueryDailySummary = t.Object({
  date: t.String({ format: "date", error: validationDetail("Must be in date format") })
});

export type ArgsQueryDailySummary = Static<typeof schemaQueryDailySummary>;

import { pgTable, uuid, date, decimal, integer, timestamp, unique } from "drizzle-orm/pg-core"
import { relations } from "drizzle-orm"
import { tenants } from "@schema/tenants"

export const dailySummaries = pgTable("daily_summaries", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").references(() => tenants.id, { onDelete: "cascade" }),
  summaryDate: date("summary_date", { mode: "string" }).notNull(),
  retailRevenue: decimal("retail_revenue"),
  retailCogs: decimal("retail_cogs"),
  brilinkCommission: decimal("brilink_commission"),
  totalRevenue: decimal("total_revenue"),
  grossProfit: decimal("gross_profit"),
  trxCount: integer("trx_count"),
  generatedAt: timestamp("generated_at").defaultNow(),
}, (table) => [
  unique("unique_tenant_date").on(table.tenantId, table.summaryDate)
])

// Relations 
export const dailySummariesRelations = relations(dailySummaries, ({ one }) => ({
  tenant: one(tenants, {
    fields: [dailySummaries.tenantId],
    references: [tenants.id],
  })
}))

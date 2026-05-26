import { pgTable, uuid, varchar, decimal, timestamp } from "drizzle-orm/pg-core"
import { relations } from "drizzle-orm"
import { tenants } from "@schema/tenants"
import { users } from "@schema/users"

export const brilinkTransactions = pgTable("brilink_transactions", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").references(() => tenants.id, { onDelete: "cascade" }),
  cashierId: uuid("cashier_id").references(() => users.id, { onDelete: "set null" }),
  trxType: varchar("trx_type", { length: 255 }).notNull(),
  customerAmount: decimal("customer_amount").notNull(),
  adminFeeCharged: decimal("admin_fee_charged").notNull(),
  agentCommission: decimal("agent_commission").notNull(),
  referenceNumber: varchar("reference_number", { length: 255 }).notNull(),
  status: varchar("status", { length: 255 }).notNull().default("success"),
  notes: varchar("notes", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow(),
})

// Relations
export const brilinkTransactionsRelations = relations(brilinkTransactions, ({ one }) => ({
  tenant: one(tenants, {
    fields: [brilinkTransactions.tenantId],
    references: [tenants.id],
  }),
  cashier: one(users, {
    fields: [brilinkTransactions.cashierId],
    references: [users.id]
  })
}))

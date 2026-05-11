import { pgTable, uuid, varchar, decimal, timestamp } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { tenants } from "@schema/tenants";
import { users } from "@schema/users";
import { transactionItems } from "@schema/transactionItems";

export const transactions = pgTable("transactions", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").references(() => tenants.id, { onDelete: "cascade" }),
  cashierId: uuid("cashier_id").references(() => users.id, { onDelete: "cascade" }),
  trxNumber: varchar("trx_number", { length: 255 }).unique(),
  totalAmount: decimal("total_amount"),
  amountPaid: decimal("amount_paid"),
  changeAmount: decimal("change_amount"),
  createdAt: timestamp("created_at").defaultNow(),
})

// Relations 
export const transactionRelations = relations(transactions, ({ one, many }) => ({
  tenant: one(tenants, {
    fields: [transactions.tenantId],
    references: [tenants.id],
  }),
  cashier: one(users, {
    fields: [transactions.cashierId],
    references: [users.id],
  }),
  items: many(transactionItems),
}))

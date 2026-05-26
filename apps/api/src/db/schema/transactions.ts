import { pgTable, uuid, varchar, decimal, timestamp, unique } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { tenants } from "@schema/tenants";
import { users } from "@schema/users";
import { transactionItems } from "@schema/transactionItems";

export const transactions = pgTable("transactions", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").references(() => tenants.id, { onDelete: "cascade" }),
  cashierId: uuid("cashier_id").references(() => users.id, { onDelete: "set null" }),
  trxNumber: varchar("trx_number", { length: 255 }),
  totalAmount: decimal("total_amount").notNull(),
  amountPaid: decimal("amount_paid").notNull(),
  changeAmount: decimal("change_amount").notNull(),
  paymentMethod: varchar("payment_method").notNull(),
  status: varchar("status", { length: 50 }).notNull().default("success"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  unique("unique_tenant_transaction_trx_number").on(table.tenantId, table.trxNumber),
])

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

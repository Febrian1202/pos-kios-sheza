import { pgTable, uuid, varchar, text, boolean, timestamp } from "drizzle-orm/pg-core";
import { tenants } from "@schema/tenants";
import { relations } from "drizzle-orm";
import { transactions } from "@schema/transactions";
import { brilinkTransactions } from "@schema/brilinkTransactions";

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").
    references(() => tenants.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 255 }),
  email: varchar("email", { length: 255 }),
  emailVerifiedAt: timestamp("email_verified_at"),
  role: varchar("role", { length: 255 }),
  passwordHash: text("password_hash"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()),
})

// Relation 
export const userRelations = relations(users, ({ one, many }) => ({
  tenant: one(tenants, {
    fields: [users.tenantId],
    references: [tenants.id],
  }),
  transactions: many(transactions),
  brilinkTransactions: many(brilinkTransactions),
}))


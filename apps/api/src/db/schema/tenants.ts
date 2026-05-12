import { pgTable, uuid, text, varchar, boolean, timestamp } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { categories } from "@schema/categories";
import { users } from "@schema/users";
import { products } from "@schema/products";
import { transactions } from "@schema/transactions";
import { brilinkTransactions } from "@schema/brilinkTransactions";
import { dailySummaries } from "@schema/dailySummaries";

export const tenants = pgTable("multi-tenant", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text('name'),
  slug: varchar("slug", { length: 255 }).unique(),
  plan: varchar("plan", { length: 255 }),
  isActive: boolean("is_active").default(false),
  createdAt: timestamp("created_at").defaultNow(),
})

// Relations
export const tenantRelations = relations(tenants, ({ many }) => ({
  users: many(users),
  categories: many(categories),
  products: many(products),
  transactions: many(transactions),
  brilinkTransactions: many(brilinkTransactions),
  dailySummaries: many(dailySummaries),
}))



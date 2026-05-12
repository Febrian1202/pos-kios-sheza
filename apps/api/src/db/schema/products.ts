import { pgTable, uuid, varchar, integer, boolean, timestamp, decimal } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { tenants } from "@schema/tenants";
import { categories } from "@schema/categories";
import { transactionItems } from "@schema/transactionItems";
export const products = pgTable("products", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").references(() => tenants.id, { onDelete: "cascade" }),
  categoryId: uuid("category_id").references(() => categories.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 255 }),
  barcode: varchar("barcode", { length: 255 }),
  sellingPrice: decimal("selling_price"),
  unit: varchar("unit", { length: 255 }),
  stockQty: integer("stock_qty"),
  isActive: boolean("is_active").default(true),
  updatedAt: timestamp("updated_at").defaultNow(),
})

// Relations
export const productRelations = relations(products, ({ one, many }) => ({
  tenant: one(tenants, {
    fields: [products.tenantId],
    references: [tenants.id],
  }),
  category: one(categories, {
    fields: [products.categoryId],
    references: [categories.id],
  }),
  transactionItems: many(transactionItems),
}))

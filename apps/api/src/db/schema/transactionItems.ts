import { pgTable, uuid, integer, decimal, timestamp } from "drizzle-orm/pg-core";
import { transactions } from "@schema/transactions";
import { products } from "@schema/products";
import { relations } from "drizzle-orm";

export const transactionItems = pgTable("transaction_items", {
  id: uuid("id").defaultRandom().primaryKey(),
  transactionId: uuid("transaction_id").references(() => transactions.id, { onDelete: "cascade" }),
  productId: uuid("product_id").references(() => products.id, { onDelete: "restrict" }).notNull(),
  qty: integer("qty"),
  unitPrice: decimal("unit_price"),
  subtotal: decimal("subtotal"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const transactionItemsRelations = relations(transactionItems, ({ one }) => ({
  transaction: one(transactions, {
    fields: [transactionItems.transactionId],
    references: [transactions.id],
  }),
  product: one(products, {
    fields: [transactionItems.productId],
    references: [products.id],
  })
}));

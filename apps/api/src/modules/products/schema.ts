import { products } from "@/db/schema";
import { createInsertSchema } from "drizzle-typebox";
import { t, type Static } from "elysia";

export const schemaQueryProduct = t.Object({
  search: t.Optional(t.String()),
  barcode: t.Optional(t.String()),
  category_id: t.Optional(t.String()),
});

export const schemaQueryProductDetail = t.Object({
  id: t.String({
    format: "uuid",
    error: "Product ID format doesn't valid (must be UUID)",
  }),
});

const unfilteredBodyProduct = createInsertSchema(products, {
  barcode: t.Optional(t.String()),
})

export const schemaBodyProduct = t.Omit(unfilteredBodyProduct, ["id", "createdAt", "updatedAt", "isActive", "slug", "tenantId"]);

export type ArgsProduct = Static<typeof schemaBodyProduct> & {
  tenantId: string,
};

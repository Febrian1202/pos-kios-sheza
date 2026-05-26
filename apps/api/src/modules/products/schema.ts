import { products } from "@/db/schema";
import { createInsertSchema } from "drizzle-typebox";
import { validationDetail, t, type Static } from "elysia";

export const schemaQueryProduct = t.Object({
  search: t.Optional(t.String({ error: validationDetail("Search must be in string") })),
  barcode: t.Optional(t.String({ error: validationDetail("Barcode must be in string") })),
  category_id: t.Optional(t.String({ error: validationDetail("Category must be in string") })),
});

export const schemaQueryProductDetail = t.Object({
  id: t.String({
    format: "uuid",
    error: validationDetail("Product ID format doesn't valid (must be UUID)"),
  }),
});

const unfilteredBodyProduct = createInsertSchema(products, {
  barcode: t.Optional(t.String()),
});

export const schemaBodyProduct = t.Omit(unfilteredBodyProduct, ["id", "createdAt", "updatedAt", "isActive", "slug", "tenantId"]);

export type ArgsProduct = Static<typeof schemaBodyProduct> & {
  tenantId: string,
};

export const schemaQueryUpdateProduct = t.Object({
  id: t.String({ format: "uuid", error: validationDetail("Id must be in UUID") })
})

export const schemaBodyUpdateProduct = t.Partial(schemaBodyProduct);

export type ArgsProductUpdate = Static<typeof schemaBodyUpdateProduct>

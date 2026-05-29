import { products } from "@/db/schema";
import { schemaResponseSuccess, withSuccess } from "@/shared";
import { createInsertSchema, createSelectSchema } from "drizzle-typebox";
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

// Regex
const regexProductName = "^[a-zA-Z0-9 .,'\\-()/%+&]+$";
const regexBarcode = "^[a-zA-Z0-9_-]+$";

const unfilteredBodyProduct = createInsertSchema(products, {
  barcode: t.Optional(t.String({ pattern: regexBarcode, error: validationDetail("The barcode may only contain letters, numbers, hyphens, and underscores.") })),
  name: t.String({ pattern: regexProductName, error: validationDetail("The product name may only contain letters, numbers, and basic symbols.") })
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

const baseProduct = createSelectSchema(products)

const productWithCategory = t.Composite([
  t.Omit(baseProduct, ["tenantId", "categoryId"]),
  t.Object({
    category: t.Object({
      name: t.String()
    })
  })
])

export const schemaResponseGet = withSuccess(
  t.Array(productWithCategory)
)

const productPlusCategory = t.Composite([
  t.Omit(baseProduct, ["tenantId", "categoryId"]),
  t.Object({
    category: t.String()
  })
])

export const schemaResponseGetDetail = withSuccess(
  productPlusCategory
)

export const schemaResponsePost = withSuccess(
  t.Object({
    id: t.String({ format: "uuid" }),
    name: t.String(),
    slug: t.String()
  })
)

export const schemaResponsePatch = withSuccess(
  baseProduct
)

export const schemaResponseDelete = schemaResponseSuccess;

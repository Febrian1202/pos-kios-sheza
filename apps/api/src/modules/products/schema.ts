import { products } from "@/db/schema";
import { schemaResponseSuccess, withSuccess } from "@/shared";
import { createInsertSchema, createSelectSchema } from "drizzle-typebox";
import { validationDetail, t, type Static } from "elysia";

// --- Constants ---
const REGEX_PRODUCT_NAME = "^[a-zA-Z0-9 .,'\\-()/%+&]+$";
const REGEX_BARCODE = "^[a-zA-Z0-9_-]+$";

// --- Request Schemas ---

export const schemaQueryProduct = t.Object({
  search: t.Optional(t.String({ error: validationDetail("Search must be a string") })),
  barcode: t.Optional(t.String({ error: validationDetail("Barcode must be a string") })),
  category_id: t.Optional(t.String({ error: validationDetail("Category ID must be a string") })),
});

export const schemaParamsId = t.Object({
  id: t.String({
    format: "uuid",
    error: validationDetail("ID format is not valid (must be UUID)"),
  }),
});

// Alias for backward compatibility or semantic clarity if needed
export const schemaQueryProductDetail = schemaParamsId;
export const schemaQueryUpdateProduct = schemaParamsId;

const unfilteredBodyProduct = createInsertSchema(products, {
  barcode: t.Optional(t.String({ 
    pattern: REGEX_BARCODE, 
    error: validationDetail("The barcode may only contain letters, numbers, hyphens, and underscores.") 
  })),
  name: t.String({ 
    pattern: REGEX_PRODUCT_NAME, 
    error: validationDetail("The product name may only contain letters, numbers, and basic symbols.") 
  })
});

export const schemaBodyProduct = t.Omit(unfilteredBodyProduct, ["id", "createdAt", "updatedAt", "isActive", "slug", "tenantId"]);

export type ArgsProduct = Static<typeof schemaBodyProduct> & {
  tenantId: string,
};

export const schemaBodyUpdateProduct = t.Partial(schemaBodyProduct);

export type ArgsProductUpdate = Static<typeof schemaBodyUpdateProduct>

// --- Response Schemas ---

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

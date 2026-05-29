import { categories } from "@/db/schema";
import { schemaResponseSuccess, withSuccess } from "@/shared";
import { createInsertSchema, createSelectSchema } from "drizzle-typebox";
import { t, validationDetail, type Static } from "elysia";

// --- Request Schemas ---

export const schemaQueryCategory = t.Object({
  search: t.Optional(t.String({ error: validationDetail("Search must be a string") }))
});

export const schemaParamsId = t.Object({
  id: t.String({ format: "uuid", error: validationDetail("ID must be in UUID format") })
})

// Alias for backward compatibility
export const schemaParamsCategory = schemaParamsId;

const unfilteredSchemaBodyCategory = createInsertSchema(categories);

export const schemaBodyCategory = t.Omit(unfilteredSchemaBodyCategory, ["id", "slug", "tenantId", "createdAt", "updatedAt"]);

export const schemaBodyCategoryUpdate = t.Partial(schemaBodyCategory);

export type ArgsUpdateCategory = Static<typeof schemaBodyCategoryUpdate>;

// --- Response Schemas ---

const baseCategory = createSelectSchema(categories);

export const schemaResponseGet = withSuccess(
  t.Array(t.Omit(baseCategory, ["tenantId"]))
)

export const schemaResponseGetDetail = withSuccess(
  baseCategory
)

export const schemaResponsePost = withSuccess(
  t.Pick(baseCategory, ["id", "name", "slug"])
)

export const schemaResponsePatch = withSuccess(
  baseCategory
)

export const schemaResponseDelete = schemaResponseSuccess;

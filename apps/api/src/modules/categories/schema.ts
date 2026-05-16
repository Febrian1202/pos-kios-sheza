import { categories } from "@/db/schema";
import { createInsertSchema } from "drizzle-typebox";
import { t, validationDetail, type Static } from "elysia";

export const schemaQueryCategory = t.Object({
  search: t.Optional(t.String())
});

export const schemaParamsCategory = t.Object({
  id: t.String({ format: "uuid", error: validationDetail("id must be in UUID format") })
})

const unfilteredSchemaBodyCategory = createInsertSchema(categories);

export const schemaBodyCategory = t.Omit(unfilteredSchemaBodyCategory, ["id", "slug", "tenantId", "createdAt", "updatedAt"]);

export const schemaBodyCategoryUpdate = t.Partial(schemaBodyCategory);

export type ArgsUpdateCategory = Static<typeof schemaBodyCategoryUpdate>;

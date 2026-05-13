import { t } from "elysia";

export const schemaQueryProduct = t.Object({
  search: t.Optional(t.String()),
  barcode: t.Optional(t.String()),
  category_id: t.Optional(t.String()),
})

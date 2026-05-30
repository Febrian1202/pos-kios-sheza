import { t, type TSchema } from "elysia"

// --- Constants ---

export enum UserRole {
  ADMIN = "admin",
  CASHIER = "cashier"
}

export const schemaUser = t.Object({
  id: t.String({ format: "uuid" }),
  name: t.String(),
  email: t.String({ format: "email" }),
  role: t.Enum(UserRole),
  tenantId: t.String({ format: "uuid" })
});

export const schemaTenant = t.Object({
  id: t.String({ format: "uuid" }),
  name: t.String(),
  slug: t.String()
});

export const schemaResponseError = t.Object({
  success: t.Boolean({ default: false }),
  message: t.String(),
})

export const schemaResponseSuccess = t.Object({
  success: t.Boolean({ default: true }),
  message: t.String(),
})

export const withSuccess = (dataSchema: TSchema) => {
  return t.Composite([
    schemaResponseSuccess,
    t.Object({
      data: dataSchema
    })
  ])
}

export const schemaPagination = t.Object({
  page: t.Number(),
  limit: t.Number(),
  totalData: t.Number(),
  totalPages: t.Number()
})

export const withSuccessMeta = (dataSchema: TSchema, metaSchema: TSchema) => {
  return t.Composite([
    schemaResponseSuccess,
    t.Object({
      data: dataSchema,
      meta: metaSchema
    })
  ])
}

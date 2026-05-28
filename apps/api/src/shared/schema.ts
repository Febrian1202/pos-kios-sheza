import { t, type TSchema } from "elysia"

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

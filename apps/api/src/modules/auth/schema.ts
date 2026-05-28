import { withSuccess } from "@/shared";
import { t, validationDetail, type Static } from "elysia";

const user = t.Object({

  id: t.String(),
  name: t.String(),
  email: t.String(),
  role: t.String(),
  tenantId: t.String(),

})

const tenant = t.Object({
  id: t.String(),
  name: t.String(),
  slug: t.String(),
})

export const schemaResponseLogin = withSuccess(
  t.Object({
    accessToken: t.String(),
    user
  })
)

export const schemaResponseRegister = withSuccess(
  t.Object({
    accessToken: t.String(),
    user,
    tenant
  })
)

export const schemaResponseRefresh = withSuccess(
  t.Object({
    accessToken: t.String()
  })
)

export const schemaResponseMe = withSuccess(
  t.Object({
    user: user
  })
)

export const schemaBodyLogin = t.Object({
  email: t.String({ format: "email", error: validationDetail("Email is not valid") }),
  password: t.String({
    error: validationDetail("Password is required"),
  }),
});

const safeTextPattern = "^[a-zA-Z0-9 .,'-]+$";
const safeTextError = "Only letters, numbers, spaces, periods, commas, hyphens, and quotation marks are allowed."

export const schemaBodyRegister = t.Object({
  storeName: t.String({ minLength: 3, pattern: safeTextPattern, error: validationDetail(`Store name minimum 3 characters length. ${safeTextError}`) }),
  userName: t.String({ minLength: 3, error: validationDetail(`Admin name minimum 3 characters length. ${safeTextError}`), pattern: safeTextPattern }),
  email: t.String({ format: "email", error: validationDetail("Email format not valid!") }),
  password: t.String({ minLength: 6, error: validationDetail("Password minimum 6 characters length") })
});

export type ArgsRegister = Static<typeof schemaBodyRegister>;

export const schemaCookie = t.Cookie({
  refreshToken: t.Optional(t.String({ error: validationDetail("Token invalid!") }))
})

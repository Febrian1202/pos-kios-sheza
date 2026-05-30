import { t, validationDetail, type Static } from "elysia";
import { schemaUser, schemaTenant, withSuccess } from "@shared";

const REGEX_SAFE_TEXT = "^[a-zA-Z0-9 .,'-]+$";
const SAFE_TEXT_ERROR = "Only letters, numbers, spaces, periods, commas, hyphens, and quotation marks are allowed.";

// --- Request Schemas ---

export const schemaBodyLogin = t.Object({
  email: t.String({
    format: "email",
    error: validationDetail("Email is not valid")
  }),
  password: t.String({
    error: validationDetail("Password is required"),
  }),
});

const nameSchema = (label: string) => t.String({
  minLength: 3,
  pattern: REGEX_SAFE_TEXT,
  error: validationDetail(`${label} must be at least 3 characters. ${SAFE_TEXT_ERROR}`)
});

export const schemaBodyRegister = t.Object({
  storeName: nameSchema("Store name"),
  userName: nameSchema("Admin name"),
  email: t.String({
    format: "email",
    error: validationDetail("Email format is not valid")
  }),
  password: t.String({
    minLength: 6,
    error: validationDetail("Password must be at least 6 characters")
  })
});

export type ArgsRegister = Static<typeof schemaBodyRegister>;

export const schemaCookie = t.Cookie({
  refreshToken: t.Optional(t.String({
    error: validationDetail("Token invalid")
  }))
})


// --- Response Schemas ---

export const schemaResponseLogin = withSuccess(
  t.Object({
    accessToken: t.String(),
    user: schemaUser
  })
)

export const schemaResponseRegister = withSuccess(
  t.Object({
    accessToken: t.String(),
    user: schemaUser,
    tenant: schemaTenant
  })
)

export const schemaResponseRefresh = withSuccess(
  t.Object({
    accessToken: t.String()
  })
)

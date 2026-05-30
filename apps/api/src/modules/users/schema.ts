import { t, validationDetail, type Static } from "elysia";
import { withSuccess, schemaUser } from "@/shared";

const REGEX_SAFE_TEXT = "^[a-zA-Z0-9 .,'-]+$";
const SAFE_TEXT_ERROR = "Only letters, numbers, spaces, periods, commas, hyphens, and quotation marks are allowed.";

const nameSchema = (label: string) => t.String({
  minLength: 3,
  pattern: REGEX_SAFE_TEXT,
  error: validationDetail(`${label} must be at least 3 characters. ${SAFE_TEXT_ERROR}`)
});

export const schemaBodyRegisterCashier = t.Object({
  name: nameSchema("Cashier name"),
  email: t.String({
    format: "email",
    error: validationDetail("Email format is not valid")
  }),
  password: t.String({
    minLength: 6,
    error: validationDetail("Password must be atleast 6 characters")
  })
})

export type ArgsRegisterCashier = Static<typeof schemaBodyRegisterCashier>;


export const schemaResponseMe = withSuccess(schemaUser)

export const schemaResponseRegisterCashier = withSuccess(schemaUser);

export const schemaResponseGetCashier = withSuccess(t.Array(schemaUser));


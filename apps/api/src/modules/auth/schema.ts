import { users } from "@/db/schema";
import { createSelectSchema } from "drizzle-typebox";
import { t, validationDetail, type Static } from "elysia";

export const schemaResponseAuth = createSelectSchema(users);

export const schemaBodyLogin = t.Object({
  email: t.String({ format: "email", error: validationDetail("Email is not valid") }),
  password: t.String({
    error: validationDetail("Password is required"),
  }),
});

export const schemaBodyRegister = t.Object({
  storeName: t.String({ minLength: 3, error: validationDetail("Store name minimum 3 characters length") }),
  userName: t.String({ minLength: 3, error: validationDetail("Admin name minimum 3 characters length") }),
  email: t.String({ format: "email", error: validationDetail("Email format not valid!") }),
  password: t.String({ minLength: 6, error: validationDetail("Password minimum 6 characters length") })
});

export const schemaBodyRefresh = t.Object({
  id: t.String({ format: "uuid", error: validationDetail("ID must be in UUID format!") }),
  refreshToken: t.String({ error: validationDetail("Refresh Token must be in string type!") }),
})

export type ArgsRegister = Static<typeof schemaBodyRegister>;

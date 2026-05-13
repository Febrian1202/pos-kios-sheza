import { users } from "@/db/schema";
import { createInsertSchema, createSelectSchema } from "drizzle-typebox";
import { t, validationDetail } from "elysia";

export const schemaResponseAuth = createSelectSchema(users);

const SchemaInsertUnfiltered = createInsertSchema(users, {
  email: t.String({ format: "email" }),
});

export const schemaBodyRegister = t.Intersect([
  t.Omit(SchemaInsertUnfiltered, ["id", "passwordHash", "createdAt"]),
  t.Object({
    password: t.String({ error: validationDetail("Password is required") }),
  }),
]);

export const schemaBodyLogin = t.Object({
  email: t.String({ format: "email", error: validationDetail("Email is not valid") }),
  password: t.String({
    error: validationDetail("Password is required"),
  }),
});
import { db } from "@db"
import { users } from "@schema/index"
import { and, eq } from "drizzle-orm"
import { ConflictError } from "@plugin";
import { type ArgsRegisterCashier } from "./schema";
import { RegisterError, SessionError } from "@plugin";

export const registerCashier = async (
  tenantId: string,
  data: ArgsRegisterCashier
) => {
  // Cek email (lintas tenant)
  const existingUser = await db.query.users.findFirst({
    where: eq(users.email, data.email)
  });

  if (existingUser) throw new ConflictError("Email already registered!");

  // Hash password kasir 
  const hashedPassword = await Bun.password.hash(data.password, {
    algorithm: "bcrypt",
    cost: 10
  });

  // Insert ke database 
  const [newCashier] = await db.insert(users).values({
    tenantId: tenantId,
    name: data.name,
    email: data.email,
    passwordHash: hashedPassword,
    role: "cashier",
    isActive: true
  }).returning({
    id: users.id,
    name: users.name,
    email: users.email,
    role: users.role,
    tenantId: users.tenantId
  });

  if (!newCashier) throw new RegisterError("Failed to register new cashier!");

  return newCashier;
}

export const getCashier = async (
  tenantId: string
) => {
  const result = await db.query.users.findMany({
    where: and(
      eq(users.tenantId, tenantId),
      eq(users.role, "cashier"),
      eq(users.isActive, true)
    ),
    columns: {
      id: true,
      name: true,
      email: true,
      role: true,
      tenantId: true
    }
  });

  return result
}

export const getUser = async (userId: string) => {
  const user = await db.query.users.findFirst({
    where: and(eq(users.id, userId), eq(users.isActive, true)),
    columns: {
      id: true,
      name: true,
      email: true,
      role: true,
      tenantId: true,
      refreshToken: true,
    }
  });

  if (!user) throw new SessionError("User not found!");

  return user;
}

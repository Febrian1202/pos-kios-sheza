import { db } from "@/db"
import { users } from "@/db/schema"
import { and, eq } from "drizzle-orm"
import { LoginError, SessionError } from "./error";

export const verifyUsers = async (userEmail: string, userPassword: string) => {
  const user = await db.query.users.findFirst({
    columns: {
      id: true,
      name: true,
      email: true,
      role: true,
      tenantId: true,
      passwordHash: true,
    },
    where: and(
      eq(users.email, userEmail),
      eq(users.isActive, true),
    )
  });

  const isMatch = await Bun.password.verify(userPassword, user?.passwordHash || "");

  if (!user || !isMatch) throw new LoginError("Email or password is incorrect");

  return {
    id: user.id,
    name: user.name,
    tenantId: user.tenantId,
    email: user.email,
    role: user.role,
  }
}

export const getUser = async (userId: string) => {
  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
    columns: {
      id: true,
      name: true,
      email: true,
      role: true,
      tenantId: true,
    }
  });

  if (!user) throw new SessionError("User not found!");

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    tenantId: user.tenantId,
  }
}

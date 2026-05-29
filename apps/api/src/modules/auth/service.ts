import { db } from "@db"
import { tenants, users } from "@schema/index"
import { and, eq } from "drizzle-orm"
import { LoginError, RegisterError, SessionError } from "./error";
import type { ArgsRegister, ArgsRegisterCashier } from "./schema";
import { ConflictError } from "@plugin";
import { slugify } from "@helper";

export const verifyUsers = async (userEmail: string, userPassword: string) => {
  const normalizedEmail = userEmail.toLowerCase().trim();
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
      eq(users.email, normalizedEmail),
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

export const registerBusiness = async (args: ArgsRegister) => {
  const normalizedEmail = args.email.toLowerCase().trim();
  // Cek email
  const existUser = await db.query.users.findFirst({
    columns: {
      name: true,
      email: true,
    },
    where: eq(users.email, normalizedEmail),
  });

  if (existUser) throw new ConflictError("Email already registered!");

  // Buat slug, pastikan unique
  let storeSlug = slugify(args.storeName);
  const existTenant = await db.query.tenants.findFirst({
    columns: {
      slug: true,
    },
    where: eq(tenants.slug, storeSlug),
  });

  if (existTenant) {
    storeSlug = `${storeSlug}-${Math.random().toString(36).substring(2, 6)}`;
  }

  // Hash password
  const hashedPassword = await Bun.password.hash(args.password, {
    algorithm: "bcrypt",
    cost: 10,
  });

  // Transaction 
  const result = await db.transaction(async (tx) => {
    // Buat tenant 
    const [newTenant] = await tx.insert(tenants).values({
      name: args.storeName,
      slug: storeSlug,
      plan: "free",
      isActive: true,
    }).returning({ id: tenants.id, name: tenants.name, slug: tenants.slug });

    // Buat user admin dan kaitkan dengan tenant yang barusan di query
    const [newUser] = await tx.insert(users).values({
      name: args.userName,
      tenantId: newTenant?.id,
      email: normalizedEmail,
      passwordHash: hashedPassword,
      role: "admin",
      isActive: true,
    }).returning({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
      tenantId: users.tenantId
    });

    return {
      store: newTenant,
      user: newUser,
    }
  })

  return result;
}

export const updateRefreshToken = async (id: string, token: string | null) => {
  await db.update(users).set({
    refreshToken: token
  }).where(eq(users.id, id));
}

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

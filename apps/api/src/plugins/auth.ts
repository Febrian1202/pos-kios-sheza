import { Elysia } from "elysia";
import jwt from "@elysiajs/jwt";
import bearer from "@elysia/bearer";
import { AuthError } from "./error";

export const authPlugin = new Elysia({ name: "auth" })
  .error({ AUTH_FAILED: AuthError })
  .onError(({ code, error, set }) => {
    if (code === "AUTH_FAILED") {
      set.status = 401;
      return { success: false, message: error.message };
    }
  })
  .use(jwt({ name: "jwt", secret: Bun.env.JWT_SECRET! }))
  .use(bearer())
  .derive({ as: "global" }, async ({ jwt, bearer }) => {
    if (!bearer) throw new AuthError("Unauthorized");

    const payload = await jwt.verify(bearer);
    if (!payload) throw new AuthError("Invalid token");

    // tenantId, userId, role tersedia di semua route
    return {
      tenantId: payload.tenantId as string,
      userId: payload.sub as string,
      role: payload.role as string,
    };
  });

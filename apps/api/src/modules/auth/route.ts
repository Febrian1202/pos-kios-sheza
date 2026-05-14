import { Elysia } from "elysia";
import { schemaBodyLogin } from "./schema";
import { LoginError, SessionError } from "./error";
import jwt from "@elysiajs/jwt";
import { getUser, verifyUsers } from "./service";
import { authPlugin } from "@/plugins/auth";

export const authRoutes = new Elysia({ prefix: "/auth" })
  .error({
    LOGIN_ERROR: LoginError,
    SESSION_ERROR: SessionError,
  })
  .onError(({ code, set, error }) => {
    if (code === "LOGIN_ERROR" || code === "SESSION_ERROR") {
      set.status = 401;
      return { success: false, message: error.message };
    }

    if (code === "UNKNOWN") {
      set.status = 500;
      return { success: false, message: "Something wrong with the server" }
    }
  })
  .use(jwt({
    secret: Bun.env.JWT_SECRET ?? "uaregay",
    name: "jwt",
    exp: "7d",
  }))
  .post(
    "/login",
    async ({ body, jwt }) => {
      const user = await verifyUsers(body.email, body.password);
      const token = await jwt.sign({
        sub: user.id,
        tenantId: user.tenantId,
        role: user.role,
      });

      return {
        success: true,
        message: `Login succesfull, welcome back ${user.name}`,
        data: {
          token: token,
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            tenantId: user.tenantId,
          }
        }
      };
    },
    {
      body: schemaBodyLogin,
    },
  )
  .use(authPlugin)
  .get("/me", async ({ userId }) => {
    const user = await getUser(userId);

    return {
      success: true,
      message: "Get profile success",
      data: user,
    }
  })
  ;

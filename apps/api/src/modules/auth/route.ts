import { Elysia } from "elysia";
import { schemaBodyLogin, schemaBodyRegister, schemaBodyRefresh } from "./schema";
import { LoginError, RegisterError, SessionError } from "./error";
import { getUser, registerBusiness, updateRefreshToken, verifyUsers } from "./service";
import { authPlugin, jwtAccessSetup, jwtRefreshSetup } from "@plugin";

export const authRoutes = new Elysia({ prefix: "/auth", name: "Auth Routes" })
  .error({
    LOGIN_ERROR: LoginError,
    SESSION_ERROR: SessionError,
    REGISTER_ERROR: RegisterError,
  })
  .onError(({ code, set, error }) => {
    if (code === "LOGIN_ERROR" || code === "SESSION_ERROR") {
      set.status = 401;
      return { success: false, message: error.message };
    }
    if (code === "REGISTER_ERROR") {
      set.status = 500;
      return { success: false, message: error.message };
    }
  })
  .use(jwtAccessSetup)
  .use(jwtRefreshSetup)
  .post(
    "/login",
    async ({ body, accessJwt, refreshJwt }) => {
      const user = await verifyUsers(body.email, body.password);

      const accessToken = await accessJwt.sign({
        sub: user.id,
        tenantId: user.tenantId,
        role: user.role,
      });

      const refreshToken = await refreshJwt.sign({
        sub: user.id,
        tenantId: user.tenantId,
        role: user.role,
      });

      updateRefreshToken(user.id, refreshToken);

      return {
        success: true,
        message: `Login succesfull, welcome back ${user.name}`,
        data: {
          accessToken: accessToken,
          refreshToken: refreshToken,
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
  .post("/register", async ({ body, set, accessJwt, refreshJwt }) => {
    const result = await registerBusiness(body);

    if (!result.user || !result.store) throw new RegisterError("Failed when creating account, please try again!");

    const accessToken = await accessJwt.sign({
      sub: result.user.id,
      tenantId: result.store.id,
      role: result.user.role,
    });
    const refreshToken = await refreshJwt.sign({
      sub: result.user.id,
      tenantId: result.store.id,
      role: result.user.role,
    });

    updateRefreshToken(result.user.id, refreshToken);
    set.status = 201;

    return {
      success: true,
      message: `Registration success, welcome to ${result.store?.name}!`,
      data: {
        accessToken: accessToken,
        refreshToken: refreshToken,
        user: result.user,
        tenant: result.store
      }
    }
  }, {
    body: schemaBodyRegister
  })
  .post("/refresh", async ({ body, refreshJwt, accessJwt }) => {
    const payload = await refreshJwt.verify(body.refreshToken);

    if (!payload) throw new SessionError("Session is not valid, or session expired");

    const user = await getUser(payload.sub as string);

    if (body.refreshToken !== user.refreshToken) {
      throw new SessionError("Session ended (logged out).")
    }

    const newAccessToken = await accessJwt.sign({
      sub: user.id,
      tenantId: user.tenantId,
      role: user.role,
    })

    return {
      success: true,
      message: "Token refresh success",
      data: {
        accessToken: newAccessToken,
      }
    }
  }, {
    body: schemaBodyRefresh,
  })
  .use(authPlugin)
  .get("/me", async ({ userId }) => {
    const user = await getUser(userId);

    return {
      success: true,
      message: "Get profile success",
      data: user,
    }
  })
  .post("/logout", async ({ userId }) => {
    await updateRefreshToken(userId, null);

    return {
      success: true,
      message: "Logout success, session ended!"
    }
  }, {

  })
  ;

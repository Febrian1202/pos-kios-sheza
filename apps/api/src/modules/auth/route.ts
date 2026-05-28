import { Elysia } from "elysia";
import { schemaBodyLogin, schemaBodyRegister, schemaCookie } from "./schema";
import { LoginError, RegisterError, SessionError } from "./error";
import { getUser, registerBusiness, updateRefreshToken, verifyUsers } from "./service";
import { authPlugin, jwtAccessSetup, jwtRefreshSetup } from "@plugin";
import { rateLimit } from "elysia-rate-limit";

export const authRoutes = new Elysia({ prefix: "/auth", name: "Auth Routes" })
  .use(rateLimit({
    duration: 60000,
    max: 5,
    errorResponse: new Response("Too many login attempts. Please wait 1 minute.", { status: 429 })
  }))
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
    async ({ body, accessJwt, refreshJwt, cookie: { refreshToken } }) => {
      const user = await verifyUsers(body.email, body.password);

      const accessToken = await accessJwt.sign({
        sub: user.id,
        tenantId: user.tenantId,
        role: user.role,
      });

      const refreshJwtToken = await refreshJwt.sign({
        sub: user.id,
        tenantId: user.tenantId,
        role: user.role,
      });

      await updateRefreshToken(user.id, refreshJwtToken);

      refreshToken.set({
        value: refreshJwtToken,
        httpOnly: true,
        secure: Bun.env.NODE_ENV === "production",
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60,
        path: "/auth"
      })

      return {
        success: true,
        message: `Login succesfull, welcome back ${user.name}`,
        data: {
          accessToken: accessToken,
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
      cookie: schemaCookie
    },
  )
  .post("/register", async ({ body, set, accessJwt, refreshJwt, cookie: { refreshToken } }) => {
    const result = await registerBusiness(body);

    if (!result.user || !result.store) throw new RegisterError("Failed when creating account, please try again!");

    const accessToken = await accessJwt.sign({
      sub: result.user.id,
      tenantId: result.store.id,
      role: result.user.role,
    });
    const refreshJwtToken = await refreshJwt.sign({
      sub: result.user.id,
      tenantId: result.store.id,
      role: result.user.role,
    });

    await updateRefreshToken(result.user.id, refreshJwtToken);

    refreshToken.set({
      value: refreshJwtToken,
      httpOnly: true,
      secure: Bun.env.NODE_ENV === "production",
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60,
      path: "/auth"
    })

    set.status = 201;

    return {
      success: true,
      message: `Registration success, welcome to ${result.store?.name}!`,
      data: {
        accessToken: accessToken,
        user: result.user,
        tenant: result.store
      }
    }
  }, {
    body: schemaBodyRegister,
    cookie: schemaCookie
  })
  .post("/refresh", async ({ refreshJwt, accessJwt, cookie: { refreshToken } }) => {

    if (!refreshToken.value) throw new SessionError("Session is not valid, or session expired");

    const payload = await refreshJwt.verify(refreshToken.value);

    if (!payload) throw new SessionError("Session is not valid, or session expired");

    const user = await getUser(payload.sub as string);

    if (refreshToken.value !== user.refreshToken) {
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
    cookie: schemaCookie
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
  .post("/logout", async ({ userId, cookie: { refreshToken } }) => {
    await updateRefreshToken(userId, null);

    refreshToken?.remove();
    return {
      success: true,
      message: "Logout success, session ended!"
    }
  }, {
    cookie: schemaCookie,
  })
  ;

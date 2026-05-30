import Elysia from "elysia";
import {
  schemaBodyLogin,
  schemaBodyRegister,
  schemaCookie,
  schemaResponseLogin,
  schemaResponseRegister,
  schemaResponseRefresh
} from "./schema";
import { LoginError } from "./error";
import {
  registerBusiness,
  updateRefreshToken,
  verifyUsers
} from "./service";
import { getUser } from "@modules/users/service";
import {
  authPlugin,
  jwtAccessSetup,
  jwtRefreshSetup,
  adminGuard,
  SessionError,
  RegisterError
} from "@plugin";
import { rateLimit } from "elysia-rate-limit";
import { schemaResponseError, schemaResponseSuccess } from "@/shared";

export const authRoutes = new Elysia({ prefix: "/auth", name: "Auth Routes", detail: { tags: ["Auth Routes"] } })
  .use(rateLimit({
    duration: 60000,
    max: 5,
    errorResponse: new Response("Too many login attempts. Please wait 1 minute.", { status: 429 })
  }))
  .error({
    LOGIN_ERROR: LoginError,
  })
  .onError(({ code, set, error }) => {
    if (code === "LOGIN_ERROR") {
      set.status = 401;
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
      cookie: schemaCookie,
      response: {
        200: schemaResponseLogin,
        401: schemaResponseError,
        500: schemaResponseError,
      },
      detail: {
        summary: "Login Admin/Kasir",
        description: "Endpoint ini digunakan untuk memvalidasi email dan password. Jika berhasil, sistem akan mengembalikan `accessToken` dan otomatis memasang `refreshToken` ke dalam **HttpOnly Cookie**."
      }
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
    cookie: schemaCookie,
    response: {
      200: schemaResponseRegister,
      401: schemaResponseError,
      500: schemaResponseError
    },
    detail: {
      summary: "Pendaftaran Toko Baru (Tenant)",
      description: "Pendaftarkan toko atau cabang baru ke dalam sistem terpusat. Endpoint ini secara otomatis akan membangun entitas `tenant` baru beserta satu akun pengguna yang langsung diberikan hak akses sebagai **Admin**. Jika berhasil, sistem akan mengembalikan `accessToken` dan menyetel `refreshToken` secara aman ke dalam cookie."
    }
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
    cookie: schemaCookie,
    response: {
      200: schemaResponseRefresh,
      401: schemaResponseError,
      500: schemaResponseError
    },
    detail: {
      summary: "Perbarui Access Token (Silent Refresh)",
      description: "Mengeluarkan `accessToken` baru ketika token lama sudah kedaluwarsa. Endpoint ini membaca `refreshToken` secara otomatis dari **HttpOnly Cookie** klien. Mekanisme ini memastikan sesi operasional kasir tetap berjalan lancar tanpa perlu login ulang berulang kali."
    }
  })
  .use(authPlugin)
  .post("/logout", async ({ userId, cookie: { refreshToken } }) => {
    await updateRefreshToken(userId, null);

    refreshToken?.remove();
    return {
      success: true,
      message: "Logout success, session ended!"
    }
  }, {
    cookie: schemaCookie,
    response: {
      200: schemaResponseSuccess
    },
    detail: {
      summary: "Logout / Akhiri Sesi",
      description: "Mengakhiri sesi pengguna secara permanen. Endpoint ini akan menghapus jejak `refreshToken` yang ada di database demi keamanan, sekaligus memberikan instruksi kepada browser untuk memusnahkan cookie sesi pengguna tersebut."
    }
  })
  .use(adminGuard)


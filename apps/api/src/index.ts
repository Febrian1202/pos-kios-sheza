import { Elysia } from "elysia";
import cors from "@elysia/cors";
import { authRoutes, categoriesRoutes, productRoutes } from "@modules/index.routes";
import { ConflictError } from "./plugins/error";

const app = new Elysia()
  .use(cors({ origin: Bun.env.WEB_URL }))
  .error({
    "CONFLICT": ConflictError,
  })
  .onError(({ code, set, error }) => {
    if (code === "CONFLICT") {
      set.status = 409;
      return { success: false, message: error.message }
    }

    if (code === "UNKNOWN") {
      set.status = 500;
      return { success: false, message: "Something wrong with the server" }
    }
  })
  .get("/health", () => ({ status: 'ok', ts: Date.now() }))
  .use(authRoutes)
  .use(productRoutes)
  .use(categoriesRoutes)
  .listen(Bun.env.PORT ?? 3000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);

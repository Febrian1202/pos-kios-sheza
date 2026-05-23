import { Elysia } from "elysia";
import {
  authRoutes,
  categoriesRoutes,
  productRoutes,
  transactionRoutes
} from "@modules/index.routes";
import { ConflictError } from "@plugin";
import { corsPlugin } from "@plugin";

const app = new Elysia()
  .use(corsPlugin)
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
  .use(transactionRoutes)
  .listen(Bun.env.PORT ?? 3000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);

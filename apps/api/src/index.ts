import { Elysia } from "elysia";
import {
  authRoutes,
  brilinkRoutes,
  categoriesRoutes,
  productRoutes,
  transactionRoutes,
  reportRoutes
} from "@modules/index.routes";
import { ConflictError } from "@plugin";
import { corsPlugin } from "@plugin";
import { startDailySummaryJob } from "@jobs"

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
  .use(brilinkRoutes)
  .use(reportRoutes)
  .listen(Bun.env.PORT ?? 3000);

startDailySummaryJob()

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);

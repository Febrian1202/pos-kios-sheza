import { Elysia } from "elysia";
import cors from "@elysia/cors";
import { authRoutes, productRoutes } from "@modules/index.routes";

const app = new Elysia()
  .use(cors({ origin: Bun.env.WEB_URL }))
  .get("/health", () => ({ status: 'ok', ts: Date.now() }))
  .use(authRoutes)
  .use(productRoutes)
  .listen(Bun.env.PORT ?? 3000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);

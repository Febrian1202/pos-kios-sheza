import { Elysia } from "elysia";
import cors from "@elysia/cors";
import { authRoutes } from "@modules/auth/route";

const app = new Elysia()
  .use(cors({ origin: Bun.env.WEB_URL }))
  .get("/health", () => ({ status: 'ok', ts: Date.now() }))
  .use(authRoutes)
  .listen(Bun.env.PORT ?? 3000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);

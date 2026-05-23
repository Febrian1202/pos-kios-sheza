import cors from "@elysia/cors";
import Elysia from "elysia";

export const corsPlugin = new Elysia()
  .use(cors({
    origin: Bun.env.WEB_URL || "*",
    methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  }))

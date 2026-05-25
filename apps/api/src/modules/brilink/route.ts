import { authPlugin } from "@/plugins";
import Elysia from "elysia";
import { schemaBodyBrilink } from "./schema";
import { createBrilinkTransaction } from "./service";

export const brilinkRoutes = new Elysia({ prefix: "/brilink", name: "Brilink Routes" })
  .use(authPlugin)
  .post("/", async ({ body, tenantId, userId, set }) => {
    const result = await createBrilinkTransaction(tenantId, userId, body);

    set.status = 201;
    return {
      success: true,
      message: "Creating Brilink Transaction success!",
      data: result
    }
  }, {
    body: schemaBodyBrilink
  })

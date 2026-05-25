import { authPlugin } from "@/plugins";
import Elysia from "elysia";
import { schemaBodyBrilink, schemaQueryBrilink } from "./schema";
import { createBrilinkTransaction, getBrilinkTransaction } from "./service";

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
  .get("/", async ({ query, tenantId }) => {
    const result = await getBrilinkTransaction(tenantId, query);

    return {
      success: true,
      message: "Get Brilink Transaction data success",
      data: result
    }
  }, {
    query: schemaQueryBrilink
  })

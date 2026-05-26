import { authPlugin, adminGuard } from "@/plugins";
import Elysia from "elysia";
import {
  schemaBodyBrilink,
  schemaParamsDetailBrilink,
  schemaQueryBrilink,
  schemaQuerySummaryBrilink
} from "./schema";
import {
  createBrilinkTransaction,
  getBrilinkSummary,
  getBrilinkTransaction,
  getBrilinkTransactionDetail,
  voidBrilink
} from "./service";

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
  .get("/summary", async ({ tenantId, query }) => {
    const result = await getBrilinkSummary(tenantId, query);

    return {
      success: true,
      message: "Get summary brilink success",
      data: result
    }
  }, {
    query: schemaQuerySummaryBrilink,
  })
  .get("/:id", async ({ tenantId, params }) => {
    const result = await getBrilinkTransactionDetail(tenantId, params);

    return {
      success: true,
      message: "Get Brilink transaction detail success",
      data: result
    }
  }, {
    params: schemaParamsDetailBrilink
  })
  .use(adminGuard)
  .post("/:id/void", async ({ tenantId, params }) => {
    const result = await voidBrilink(tenantId, params);

    return {
      success: true,
      message: `Brilink transaction ${result?.referenceNumber} void success!`,
      data: result
    }
  }, {
    params: schemaParamsDetailBrilink
  })


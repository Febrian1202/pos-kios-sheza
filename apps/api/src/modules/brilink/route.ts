import { authPlugin, adminGuard } from "@/plugins";
import Elysia from "elysia";
import { rateLimit } from "elysia-rate-limit";
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
import { BrilinkNotFoundError } from "./error";

export const brilinkRoutes = new Elysia({ prefix: "/brilink", name: "Brilink Routes", tags: ["Brilink Routes"] })
  .error({
    "NOT_FOUND": BrilinkNotFoundError
  })
  .onError(({ code, set, error }) => {
    if (code === "NOT_FOUND") {
      set.status = 404;
      return { success: false, message: error.message }
    }
  })
  .use(authPlugin)
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
  .use(rateLimit({
    duration: 10000,
    max: 2,
    errorResponse: new Response(
      JSON.stringify({
        success: false,
        message: "The transaction is being processed. Please wait a moment to avoid duplicate data."
      }),
      { status: 429, headers: { 'Content-Type': 'application/json' } }
    )
  }))
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


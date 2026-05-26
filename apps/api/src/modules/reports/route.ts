import { adminGuard, authPlugin } from "@/plugins";
import Elysia from "elysia";
import { SummaryNotFoundError } from "./error";
import { schemaQueryDailySummary } from "./schema";
import { getDailySummary } from "./service";

export const reportRoutes = new Elysia({ prefix: "/reports", name: "Report Routes" })
  .error({
    "NOT_FOUND": SummaryNotFoundError
  })
  .onError(({ code, set, error }) => {
    if (code === "NOT_FOUND") {
      set.status = 404;
      return { success: false, message: error.message }
    }
  })
  .use(authPlugin)
  .use(adminGuard)
  .get("/daily", async ({ tenantId, query }) => {
    const result = await getDailySummary(tenantId, query);

    return {
      success: true,
      message: "Get daily summary data success!",
      data: result
    }
  }, {
    query: schemaQueryDailySummary
  })


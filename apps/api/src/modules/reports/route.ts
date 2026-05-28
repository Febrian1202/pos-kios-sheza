import { adminGuard, authPlugin } from "@/plugins";
import Elysia from "elysia";
import { SummaryNotFoundError } from "./error";
import { schemaQueryDailySummary, schemaQueryMonthlySummary } from "./schema";
import { getDailySummary, getMonthlySummary } from "./service";

export const reportRoutes = new Elysia({ prefix: "/reports", name: "Report Routes", tags: ["Report Routes"] })
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
    query: schemaQueryDailySummary,
    detail: {
      summary: "Laporan Harian",
      description: "Endpoint digunakan untuk mendapatkan laporan harian.",
      responses: {
        200: { description: "Laporan harian berhasil didapatkan" },
        404: { description: "Laporan harian tidak ditemukan" }
      }
    }
  })
  .get("/monthly", async ({ tenantId, query }) => {
    const result = await getMonthlySummary(tenantId, query);

    return {
      success: true,
      message: `Get monthly summary for ${query.month} success`,
      data: result
    }
  }, {
    query: schemaQueryMonthlySummary
  })


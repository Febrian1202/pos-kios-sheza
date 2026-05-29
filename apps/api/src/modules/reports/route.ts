import { adminGuard, authPlugin } from "@/plugins";
import Elysia from "elysia";
import { SummaryNotFoundError } from "./error";
import {
  schemaQueryDailySummary,
  schemaQueryMonthlySummary,
  schemaResponseDaily,
  schemaResponseMonthly
} from "./schema";
import { getDailySummary, getMonthlySummary } from "./service";
import { schemaResponseError } from "@/shared";

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
    response: {
      200: schemaResponseDaily,
      404: schemaResponseError
    },
    detail: {
      summary: "Laporan Harian",
      description: "Mendapatkan ringkasan performa toko untuk hari tertentu. Mencakup total pendapatan ritel, komisi Brilink, dan laba kotor. Jika data belum tersedia, sistem akan mencoba men-generate-nya secara otomatis."
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
    query: schemaQueryMonthlySummary,
    response: {
      200: schemaResponseMonthly,
      404: schemaResponseError
    },
    detail: {
      summary: "Laporan Bulanan",
      description: "Mendapatkan ringkasan performa toko untuk bulan tertentu berdasarkan agregasi laporan harian."
    }
  })


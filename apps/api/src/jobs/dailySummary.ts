import { db } from "@/db";
import { Cron } from "croner"
import { eq } from "drizzle-orm";
import { tenants } from "@/db/schema";
import { getDailySummary } from "@/modules/reports/service";

export const startDailySummaryJob = () => {
  // Jalankan setiap tengah malam 
  new Cron("0 0 * * *", { timezone: "Asia/Makassar" }, async () => {
    console.log("[CRON] Starting daily summaries automatic...");

    try {
      // Dapatkan tanggal kemarin 
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const dateString = yesterday.toISOString().split("T")[0]!;

      // Ambil semua tenant 
      const activeTenants = await db.query.tenants.findMany({
        where: eq(tenants.isActive, true),
        columns: { id: true, name: true },
      });

      // Eksekusi perhitungan untuk masing masing tenant 
      for (const tenant of activeTenants) {
        try {
          await getDailySummary(tenant.id, { date: dateString });
          console.log(`[CRON] Daily recap for ${tenant.name} ${dateString} success!`);
        } catch (e) {
          console.error(`[CRON] Failed processing recap ${tenant.name}`, e)
        }
      }

      console.log("[CRON] All daily recap process complete!")
    } catch (e) {
      console.error("[CRON] Something wrong with the job", e);
    }
  });
};

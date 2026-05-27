import { and, count, eq, gte, lte, sum } from "drizzle-orm";
import type { ArgsQueryDailySummary, ArgsQueryMonthlySummary } from "./schema";
import { db } from "@db";
import { brilinkTransactions, dailySummaries, transactions } from "@/db/schema";
import { ConflictError } from "@/plugins";

export const getDailySummary = async (tenantId: string, query: ArgsQueryDailySummary) => {
  const { date } = query;

  // Cek cache 
  const cache = await db.query.dailySummaries.findFirst({
    where: and(
      eq(dailySummaries.tenantId, tenantId),
      eq(dailySummaries.summaryDate, date),
    )
  })

  if (cache) return cache;

  // Siapkan batas waktu
  const startDate = new Date(`${date}T00:00:00.000Z`);
  const endDate = new Date(`${date}T23:59:59.999Z`);

  // Transaksi ritel 
  const retailResult = await db.select({
    totalRevenue: sum(transactions.totalAmount),
    totalTrx: count()
  })
    .from(transactions)
    .where(
      and(
        eq(transactions.tenantId, tenantId),
        eq(transactions.status, "success"),
        gte(transactions.createdAt, startDate),
        lte(transactions.createdAt, endDate),
      )
    );

  // Transaksi Brilink
  const brilinkResult = await db.select({
    totalCommission: sum(brilinkTransactions.agentCommission),
    totalTrx: count()
  })
    .from(brilinkTransactions)
    .where(
      and(
        eq(brilinkTransactions.tenantId, tenantId),
        eq(brilinkTransactions.status, "success"),
        gte(brilinkTransactions.createdAt, startDate),
        lte(brilinkTransactions.createdAt, endDate)
      )
    );

  // Kalkulasi
  const retailRevenue = Number(retailResult[0]?.totalRevenue || 0);
  const retailTrxCount = Number(retailResult[0]?.totalTrx || 0);

  const brilinkCommission = Number(brilinkResult[0]?.totalCommission || 0);
  const brilinkTrxCount = Number(brilinkResult[0]?.totalTrx || 0);

  // Kalkulasi total 
  const totalRevenue = retailRevenue + brilinkCommission;
  const trxCount = retailTrxCount + brilinkTrxCount;

  const retailCogs = 0
  const grossProfit = totalRevenue - retailCogs;

  // Simpan ke cache dan return 
  try {
    const [newSummary] = await db.insert(dailySummaries).values({
      tenantId: tenantId,
      summaryDate: date,
      retailRevenue: retailRevenue.toString(),
      retailCogs: retailCogs.toString(),
      brilinkCommission: brilinkCommission.toString(),
      totalRevenue: totalRevenue.toString(),
      grossProfit: grossProfit.toString(),
      trxCount: trxCount
    }).returning()

    return newSummary;

  } catch (e: any) {
    if (e.code === '23505') {
      const retrySummary = await db.query.dailySummaries.findFirst({
        where: and(
          eq(dailySummaries.tenantId, tenantId),
          eq(dailySummaries.summaryDate, date),
        )
      });

      return retrySummary;
    }

    throw new ConflictError("Failed to generate daily summary");
  }
}

export const getMonthlySummary = async (tenantId: string, query: ArgsQueryMonthlySummary) => {
  const { month } = query;

  // Siapkan start date dan end date
  const startDate = `${month}-01`;
  const endDate = `${month}-31`;

  const result = await db.select({
    totalRetailRevenue: sum(dailySummaries.retailRevenue),
    totalRetailCogs: sum(dailySummaries.retailCogs),
    totalBrilinkCommission: sum(dailySummaries.brilinkCommission),
    grandTotalRevenue: sum(dailySummaries.totalRevenue),
    grandTotalProfit: sum(dailySummaries.grossProfit),
    totalTrxCount: sum(dailySummaries.trxCount),
  })
    .from(dailySummaries)
    .where(
      and(
        eq(dailySummaries.tenantId, tenantId),
        gte(dailySummaries.summaryDate, startDate),
        lte(dailySummaries.summaryDate, endDate)
      )
    );

  return {
    month: month,
    retailRevenue: Number(result[0]?.totalRetailRevenue || 0),
    retailCogs: Number(result[0]?.totalRetailCogs || 0),
    brilinkCommission: Number(result[0]?.totalBrilinkCommission || 0),
    totalRevenue: Number(result[0]?.grandTotalRevenue || 0),
    grossProfit: Number(result[0]?.grandTotalProfit || 0),
    trxCount: Number(result[0]?.totalTrxCount || 0),
  };
}

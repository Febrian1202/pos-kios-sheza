import { db } from "@db";
import type { ArgsBrilink, ArgsGetBrilink, ArgsGetBrilinkDetail, ArgsGetSummaryBrilink } from "./schema";
import { and, count, desc, eq, gte, lte, sum } from "drizzle-orm";
import { brilinkTransactions } from "@schema/index";
import { ConflictError } from "@plugin";
import { BrilinkNotFoundError } from "./error";

export const createBrilinkTransaction = async (tenantId: string, cashierId: string, body: ArgsBrilink) => {
  const existedTransaction = await db.query.brilinkTransactions.findFirst({
    where: and(eq(brilinkTransactions.tenantId, tenantId), eq(brilinkTransactions.referenceNumber, body.referenceNumber))
  });

  if (existedTransaction) throw new ConflictError("Brilink Transaction already exist!")

  const [result] = await db.insert(brilinkTransactions).values({
    tenantId: tenantId,
    cashierId: cashierId,
    trxType: body.trxType,
    customerAmount: body.customerAmount.toString(),
    adminFeeCharged: body.adminFeeCharged.toString(),
    agentCommission: body.agentCommission.toString(),
    referenceNumber: body.referenceNumber,
    notes: body.notes,
  }).returning({
    id: brilinkTransactions.id,
    trxType: brilinkTransactions.trxType,
    referenceNumber: brilinkTransactions.referenceNumber,
    customerAmount: brilinkTransactions.customerAmount,
    adminFeeCharged: brilinkTransactions.adminFeeCharged,
    agentCommission: brilinkTransactions.agentCommission,
    status: brilinkTransactions.status
  });

  if (!result) throw new ConflictError("Creating Brilink Transaction failed!");

  return result;
}

export const getBrilinkTransaction = async (tenantId: string, query: ArgsGetBrilink) => {
  const { date, type } = query;
  let filters = [eq(brilinkTransactions.tenantId, tenantId)];

  if (date) {
    const startDate = new Date(`${date}T00:00:00.000Z`);
    const endDate = new Date(`${date}T23:59:59.999Z`);

    filters.push(gte(brilinkTransactions.createdAt, startDate));
    filters.push(lte(brilinkTransactions.createdAt, endDate));
  }

  if (type) {
    filters.push(eq(brilinkTransactions.trxType, type))
  }

  const data = await db.query.brilinkTransactions.findMany({
    columns: {
      id: true,
      trxType: true,
      customerAmount: true,
      adminFeeCharged: true,
      agentCommission: true,
      referenceNumber: true,
      status: true,
      notes: true,
      createdAt: true
    },
    with: {
      cashier: {
        columns: {
          name: true
        }
      }
    },
    where: and(...filters),
    orderBy: desc(brilinkTransactions.createdAt)
  });

  return data;
}

export const getBrilinkSummary = async (tenantId: string, query: ArgsGetSummaryBrilink) => {
  const { date } = query;

  // Filter waktu
  const startDate = new Date(`${date}T00:00:00.000Z`);
  const endDate = new Date(`${date}T23:59:59.999Z`);

  // Query 
  const summary = await db.select({
    trxType: brilinkTransactions.trxType,
    totalTransaction: count(),
    totalCommission: sum(brilinkTransactions.agentCommission),
  })
    .from(brilinkTransactions)
    .where(
      and(
        eq(brilinkTransactions.tenantId, tenantId),
        eq(brilinkTransactions.status, "success"),
        gte(brilinkTransactions.createdAt, startDate),
        lte(brilinkTransactions.createdAt, endDate)
      )
    ).groupBy(brilinkTransactions.trxType);

  // Hitung grand total 
  let grandTotalCommission = 0;
  let grandTotalTransaction = 0;

  const breakdown = summary.map(item => {
    const commission = Number(item.totalCommission || 0);
    const transaction = Number(item.totalTransaction || 0);

    grandTotalCommission += commission;
    grandTotalTransaction += transaction;

    return {
      trxType: item.trxType,
      totalTransaction: transaction,
      totalCommission: commission,
    }
  })

  return {
    date: date,
    grandTotalCommission,
    grandTotalTransaction,
    breakdown
  }
}

export const getBrilinkTransactionDetail = async (tenantId: string, param: ArgsGetBrilinkDetail) => {
  const { id } = param;

  const data = await db.query.brilinkTransactions.findFirst({
    where: and(eq(brilinkTransactions.tenantId, tenantId), eq(brilinkTransactions.id, id))
  });

  if (!data) throw new BrilinkNotFoundError("Failed, Brilink transaction not found!");

  return data
}

export const voidBrilink = async (
  tenantId: string,
  params: ArgsGetBrilinkDetail
) => {
  const { id } = params
  // Cek exist 
  const transaction = await db.query.brilinkTransactions.findFirst({
    where: and(
      eq(brilinkTransactions.tenantId, tenantId),
      eq(brilinkTransactions.id, id)
    )
  });

  if (!transaction) throw new BrilinkNotFoundError("Brilink transaction not found!");

  if (transaction.status === "void" || transaction.status === "failed") {
    throw new ConflictError(`This transaction is already ${transaction.status}`);
  }

  // Ubah status menjadi void 
  const [updatedTransaction] = await db.update(brilinkTransactions)
    .set({
      status: "void"
    })
    .where(and(
      eq(brilinkTransactions.tenantId, tenantId),
      eq(brilinkTransactions.id, id)
    ))
    .returning({
      id: brilinkTransactions.id,
      referenceNumber: brilinkTransactions.referenceNumber,
      status: brilinkTransactions.status
    });

  return updatedTransaction;
}

import { db } from "@db";
import type { ArgsBrilink, ArgsGetBrilink } from "./schema";
import { and, desc, eq, gte, lte } from "drizzle-orm";
import { brilinkTransactions } from "@schema/index";
import { ConflictError } from "@plugin";

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

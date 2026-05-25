import { db } from "@db";
import type { ArgsBrilink } from "./schema";
import { and, eq } from "drizzle-orm";
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

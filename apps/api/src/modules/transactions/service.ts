import { ConflictError } from "@/plugins";
import type { ArgsTransaction } from "./schema";
import { db } from "@/db";
import { products, transactionItems, transactions } from "@/db/schema";
import { eq, sql } from "drizzle-orm";

export const createTransaction = async (tenantId: string, cashierId: string, args: ArgsTransaction) => {
  // Hitung total harga
  let totalAmount = 0;
  const itemsToInsert: Array<Object> = [];

  for (const item of args.items) {
    const subtotal = item.qty * item.unitPrice;
    totalAmount += subtotal;

    itemsToInsert.push({
      productId: item.productId,
      qty: item.qty,
      unitPrice: item.unitPrice.toString(),
      subtotal: subtotal.toString(),
    })
  }

  // validasi pembayaran
  if (args.amountPaid < totalAmount) throw new ConflictError(`Insufficient funds! Total amount ${totalAmount}, Amount paid ${args.amountPaid}`);
  const changeAmount = args.amountPaid - totalAmount;

  // generate trx number
  const randomChars = Math.random().toString(36).substring(2, 6).toUpperCase();
  const trxNumber = `TRX-${Date.now()}-${randomChars}`;

  // Mulai query
  const result = await db.transaction(async (tx) => {

    // buat header struk
    const [newTransaction] = await tx.insert(transactions).values({
      tenantId,
      cashierId,
      trxNumber: trxNumber,
      totalAmount: totalAmount.toString(),
      amountPaid: args.amountPaid.toString(),
      changeAmount: changeAmount.toString(),
      paymentMethod: args.paymentMethod,
    }).returning({
      id: transactions.id, trxNumber: transactions.trxNumber
    })

    if (!newTransaction) throw new ConflictError("Failed creating transaction");

    // Inject id transaction ke item
    const finalItemsToInsert = itemsToInsert.map(item => ({
      ...item,
      transactionId: newTransaction.id,
    }));

    await tx.insert(transactionItems).values(finalItemsToInsert);

    for (const item of args.items) {
      await tx.update(products)
        .set({
          stockQty: sql`${products.stockQty} - ${item.qty}`
        })
        .where(eq(products.id, item.productId));
    };

    return newTransaction;
  });

  return {
    trxNumber: result.trxNumber,
    totalAmount,
    changeAmount,
  }
}

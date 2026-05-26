import { ConflictError } from "@/plugins";
import type {
  ArgsTransaction,
  ArgsGetTransaction,
  ArgsGetTransactionDetail,
} from "./schema";
import { db } from "@/db";
import { products, transactionItems, transactions } from "@/db/schema";
import { and, count, desc, eq, gte, lte, sql } from "drizzle-orm";
import { TransactionNotFoundError } from "./error";

export const createTransaction = async (
  tenantId: string,
  cashierId: string,
  args: ArgsTransaction,
) => {
  // Hitung total harga
  let totalAmount = 0;
  const itemsToInsert: {
    productId: string;
    qty: number;
    unitPrice: string;
    subtotal: string;
  }[] = [];

  for (const item of args.items) {
    const subtotal = item.qty * item.unitPrice;
    totalAmount += subtotal;

    itemsToInsert.push({
      productId: item.productId,
      qty: item.qty,
      unitPrice: item.unitPrice.toString(),
      subtotal: subtotal.toString(),
    });
  }

  // validasi pembayaran
  if (args.amountPaid < totalAmount)
    throw new ConflictError(
      `Insufficient funds! Total amount ${totalAmount}, Amount paid ${args.amountPaid}`,
    );
  const changeAmount = args.amountPaid - totalAmount;

  // generate trx number
  const randomChars = Math.random().toString(36).substring(2, 6).toUpperCase();
  const trxNumber = `TRX-${Date.now()}-${randomChars}`;

  // Mulai query
  const result = await db.transaction(async (tx) => {
    // buat header struk
    const [newTransaction] = await tx
      .insert(transactions)
      .values({
        tenantId,
        cashierId,
        trxNumber: trxNumber,
        totalAmount: totalAmount.toString(),
        amountPaid: args.amountPaid.toString(),
        changeAmount: changeAmount.toString(),
        paymentMethod: args.paymentMethod,
      })
      .returning({
        id: transactions.id,
        trxNumber: transactions.trxNumber,
      });

    if (!newTransaction) throw new ConflictError("Failed creating transaction");

    // Inject id transaction ke item
    const finalItemsToInsert = itemsToInsert.map((item) => ({
      ...item,
      transactionId: newTransaction.id,
    }));

    await tx.insert(transactionItems).values(finalItemsToInsert);

    for (const item of args.items) {
      await tx
        .update(products)
        .set({
          stockQty: sql`${products.stockQty} - ${item.qty}`,
        })
        .where(eq(products.id, item.productId));
    }

    return newTransaction;
  });

  return {
    trxNumber: result.trxNumber,
    totalAmount,
    changeAmount,
  };
};

export const getTransactions = async (
  tenantId: string,
  query: ArgsGetTransaction,
) => {
  // Destructuring
  const { to, from, date, limit, page } = query;

  const filters = [eq(transactions.tenantId, tenantId)];

  // check query date
  if (date) {
    // cari transaksi dari jam 00:00 sampai 23:59
    const startDate = new Date(`${date}T00:00:00.000Z`);
    const endDate = new Date(`${date}T23:59:59.999Z`);

    // push ke daftar filters
    filters.push(gte(transactions.createdAt, startDate));
    filters.push(lte(transactions.createdAt, endDate));
  } else if (from && to) {
    // cari rentang hari
    const startDate = new Date(`${from}T00:00:00.000Z`);
    const endDate = new Date(`${to}T23:59:59.999Z`);

    // push ke daftar filters
    filters.push(gte(transactions.createdAt, startDate));
    filters.push(lte(transactions.createdAt, endDate));
  }

  // Rumus paginasi
  const offset = (page - 1) * limit;

  // Tarik data dari database sesuai offset
  const data = await db.query.transactions.findMany({
    where: and(...filters),
    limit: limit,
    offset: offset,
    orderBy: desc(transactions.createdAt),
    with: {
      cashier: {
        columns: { name: true },
      },
      items: {
        with: {
          product: {
            columns: { name: true },
          },
        },
      },
    },
  });

  // Hitung seluruh total data yang sesuai dengan filter (untuk pagination frontend)
  const countResult = await db
    .select({ totalData: count() })
    .from(transactions)
    .where(and(...filters));

  const totalData = countResult[0]?.totalData ?? 0;

  const totalPages = Math.ceil(totalData / limit);

  return {
    data: data,
    meta: {
      page: page,
      limit: limit,
      totalData: totalData,
      totalPages: totalPages,
    },
  };
};

export const getTransactionDetail = async (
  tenantId: string,
  params: ArgsGetTransactionDetail,
) => {
  const data = await db.query.transactions.findFirst({
    columns: {
      trxNumber: true,
      totalAmount: true,
      amountPaid: true,
      changeAmount: true,
      paymentMethod: true,
      createdAt: true,
    },
    with: {
      items: {
        with: {
          product: {
            columns: {
              id: true,
              name: true,
              createdAt: true,
            },
          },
        },
        columns: {
          id: true,
          qty: true,
          unitPrice: true,
          subtotal: true,
          createdAt: true,
        },
      },
    },
    where: and(
      eq(transactions.tenantId, tenantId),
      eq(transactions.id, params.id),
    ),
  });

  if (!data) throw new TransactionNotFoundError("Failed, data transaction doesn't exist");

  return data;
};

export const voidTransaction = async (
  tenantId: string,
  transactionId: string,
) => {
  return await db.transaction(async (tx) => {
    // Cari data transaksi beserta itemnya terlebih dahulu
    const transaction = await tx.query.transactions.findFirst({
      where: and(eq(transactions.tenantId, tenantId), eq(transactions.id, transactionId)),
      with: { items: true }
    });

    if (!transaction) throw new TransactionNotFoundError("Transaction not found!");
    if (transaction.status === "void") throw new ConflictError("This transaction already cancelled!");

    // Ubah status transaksi menjadi void 
    await tx.update(transactions).set({
      status: "void"
    }).where(eq(transactions.id, transactionId));

    // Kembalikan stock 
    for (const item of transaction.items) {
      await tx.update(products)
        .set({
          stockQty: sql`${products.stockQty} + ${item.qty}`
        }).where(eq(products.id, item.productId))
    }

    return { trxNumber: transaction.trxNumber };
  });
};

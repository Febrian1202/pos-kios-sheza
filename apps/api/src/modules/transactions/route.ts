import Elysia from "elysia";
import { bodySchemaTransaction, querySchemaTransaction, paramsSchemaTransaction } from "./schema";
import { authPlugin, adminGuard } from "@plugin";
import { createTransaction, getTransactionDetail, getTransactions, voidTransaction } from './service.ts';

export const transactionRoutes = new Elysia({ prefix: "/transactions", name: "Transaction Routes" })
  .use(authPlugin)
  .post('/', async ({ body, tenantId, userId, set }) => {
    const result = await createTransaction(tenantId, userId, body);
    set.status = 201;

    return {
      success: true,
      message: "Transaction process success!",
      data: result,
    }
  }, {
    body: bodySchemaTransaction
  })
  .get("/", async ({ tenantId, query }) => {
    const result = await getTransactions(tenantId, query);

    return {
      success: true,
      message: "Get transactions data success",
      data: result.data,
      meta: result.meta
    }
  }, {
    query: querySchemaTransaction
  })
  .get("/:id", async ({ params, tenantId }) => {
    const result = await getTransactionDetail(tenantId, params);

    return {
      success: true,
      message: "Get detail transaction success!",
      data: result
    }
  }, {
    params: paramsSchemaTransaction,
  })
  .use(adminGuard)
  .post("/:id/void", async ({ params: { id }, tenantId }) => {
    const result = await voidTransaction(tenantId, id);

    return {
      success: true,
      message: `Transaction ${result.trxNumber} void success! (stock restored)`,
      data: result
    }
  }, {
    params: paramsSchemaTransaction,
  })

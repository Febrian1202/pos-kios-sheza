import Elysia from "elysia";
import { bodySchemaTransaction, querySchemaTransaction } from "./schema";
import { authPlugin } from "@/plugins";
import { createTransaction, getTransactions } from './service.ts';

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

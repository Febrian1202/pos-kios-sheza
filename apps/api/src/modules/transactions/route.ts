import Elysia from "elysia";
import { bodySchemaTransaction } from "./schema";
import { authPlugin } from "@/plugins";
import { createTransaction } from './service.ts';

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

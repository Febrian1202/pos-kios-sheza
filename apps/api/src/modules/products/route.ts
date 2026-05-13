import { authPlugin } from "@/plugins/auth";
import Elysia from "elysia";
import { schemaQueryProduct } from "./schema";
import { getProduct } from "./service";

export const productRoutes = new Elysia({ prefix: "/products" })
  .use(authPlugin)
  .get("/", async ({ query: { search, barcode, category_id }, tenantId }) => {
    const result = await getProduct(tenantId, search, barcode, category_id);

    return {
      success: true,
      message: "Get products data success",
      data: result
    }
  }, {
    query: schemaQueryProduct,
  })

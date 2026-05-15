import { authPlugin, adminGuard } from "@plugin";
import Elysia from "elysia";
import { schemaQueryProduct, schemaQueryProductDetail, schemaBodyProduct, schemaBodyUpdateProduct, schemaQueryUpdateProduct } from "./schema";
import { getProduct, getProductDetail, postProduct, patchProduct, softDeleteProduct } from "./service";
import { ProductNotFoundError } from "./error";

export const productRoutes = new Elysia({ prefix: "/products", name: "Product Routes" })
  .use(authPlugin)
  .error({
    "PRODUCT_NOT_FOUND": ProductNotFoundError,
  })
  .onError(({ code, error, set }) => {
    if (code === "PRODUCT_NOT_FOUND") {
      set.status = 404;
      return { success: false, message: error.message }
    }
  })
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
  .get("/:id", async ({ params: { id }, tenantId }) => {
    const productDetail = await getProductDetail(id, tenantId)

    return {
      success: true,
      message: "Get product detail success",
      data: productDetail,
    }
  }, {
    params: schemaQueryProductDetail
  })
  .use(adminGuard)
  .post("/", async ({ body, tenantId, set }) => {
    const data = await postProduct({ ...body, tenantId })

    set.status = 201;

    return {
      success: true,
      message: "Creating product data success!",
      data: data,
    }
  }, {
    body: schemaBodyProduct
  })
  .patch("/:id", async ({ body, tenantId, params: { id } }) => {
    const data = await patchProduct(id, tenantId, body);

    return {
      success: true,
      message: "Patching product data success!",
      data: data
    }
  }, {
    body: schemaBodyUpdateProduct,
    params: schemaQueryUpdateProduct,
  })
  .delete("/:id", async ({ params: { id }, tenantId }) => {
    await softDeleteProduct(id, tenantId);

    return {
      success: true,
      message: "Success deleting data product!",
    }
  }, {
    params: schemaQueryUpdateProduct,
  });

import { authPlugin, adminGuard } from "@/plugins";
import Elysia from "elysia";
import { schemaParamsCategory, schemaQueryCategory, schemaBodyCategory, schemaBodyCategoryUpdate } from "./schema";
import { getCategory, getCategoryDetail, postCategory, updateCategory, deleteCategory } from "./service";

export const categoriesRoutes = new Elysia({ prefix: "/category", name: "Category Routes", tags: ["Category Routes"] })
  .use(authPlugin)
  .get("/", async ({ tenantId, query: { search } }) => {
    const result = await getCategory(tenantId, search);

    return {
      success: true,
      message: "Get categories data success",
      data: result,
    }
  }, {
    query: schemaQueryCategory,
  })
  .get("/:id", async ({ params: { id }, tenantId }) => {
    const result = await getCategoryDetail(id, tenantId);

    return {
      success: true,
      message: "Get category detail success",
      data: result,
    }
  }, {
    params: schemaParamsCategory,
  })
  .use(adminGuard)
  .post("/", async ({ body: { name }, tenantId, set }) => {
    const result = await postCategory(name, tenantId);

    set.status = 201;

    return {
      success: true,
      message: `Category ${result?.name} added success`,
      data: result
    }
  }, {
    body: schemaBodyCategory,
  })
  .patch("/:id", async ({ params: { id }, tenantId, body }) => {
    const result = await updateCategory(id, tenantId, body);

    return {
      success: true,
      message: "Update category success",
      data: result
    }
  }, {
    params: schemaParamsCategory,
    body: schemaBodyCategoryUpdate,
  })
  .delete("/:id", async ({ params: { id }, tenantId }) => {
    await deleteCategory(id, tenantId);

    return {
      success: true,
      message: "Deleting category success",
    }
  }, {
    params: schemaParamsCategory,
  });

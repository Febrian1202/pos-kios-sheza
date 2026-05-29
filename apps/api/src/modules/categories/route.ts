import { authPlugin, adminGuard } from "@/plugins";
import Elysia from "elysia";
import {
  schemaParamsCategory,
  schemaQueryCategory,
  schemaBodyCategory,
  schemaBodyCategoryUpdate,
  schemaResponseGet,
  schemaResponseGetDetail,
  schemaResponsePost,
  schemaResponsePatch,
  schemaResponseDelete
} from "./schema";
import { getCategory, getCategoryDetail, postCategory, updateCategory, deleteCategory } from "./service";
import { schemaResponseError } from "@/shared";

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
    response: {
      200: schemaResponseGet,
      400: schemaResponseError
    },
    detail: {
      summary: "Daftar Kategori Produk",
      description: "Mengambil daftar seluruh kategori produk yang terdaftar di toko. Endpoint ini sangat ringan dan mendukung pencarian nama kategori menggunakan parameter *query* `search`."
    }
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
    response: {
      200: schemaResponseGetDetail,
      400: schemaResponseError
    },
    detail: {
      summary: "Detail Kategori",
      description: "Mengambil informasi detail spesifik dari satu kategori berdasarkan ID (UUID). Berguna jika kamu perlu memvalidasi apakah sebuah kategori masih ada di database."
    }
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
    response: {
      201: schemaResponsePost,
      400: schemaResponseError
    },
    detail: {
      summary: "Tambah Kategori Baru",
      description: "Menambahkan kategori produk baru. Nama kategori harus unik di dalam satu toko.\n\n🚨 **Perhatian:** Hanya bisa diakses oleh **Admin**."
    }
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
    response: {
      200: schemaResponsePatch,
      400: schemaResponseError
    },
    detail: {
      summary: "Perbarui Kategori",
      description: "Mengubah informasi kategori yang sudah ada.\n\n🚨 **Perhatian:** Hanya bisa diakses oleh **Admin**."
    }
  })
  .delete("/:id", async ({ params: { id }, tenantId }) => {
    await deleteCategory(id, tenantId);

    return {
      success: true,
      message: "Deleting category success",
    }
  }, {
    params: schemaParamsCategory,
    response: {
      200: schemaResponseDelete,
      400: schemaResponseError
    },
    detail: {
      summary: "Hapus Kategori",
      description: "Menghapus kategori produk. Kategori tidak bisa dihapus jika masih ada produk yang menggunakannya.\n\n🚨 **Perhatian:** Hanya bisa diakses oleh **Admin**."
    }
  });

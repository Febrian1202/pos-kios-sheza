import { authPlugin, adminGuard } from "@plugin";
import Elysia from "elysia";
import {
  schemaQueryProduct,
  schemaQueryProductDetail,
  schemaBodyProduct,
  schemaBodyUpdateProduct,
  schemaQueryUpdateProduct,
  schemaResponseGet,
  schemaResponseGetDetail,
  schemaResponsePost,
  schemaResponsePatch,
  schemaResponseDelete
} from "./schema";
import { schemaResponseError } from "@/shared";
import { getProduct, getProductDetail, postProduct, patchProduct, softDeleteProduct } from "./service";
import { ProductNotFoundError } from "./error";

export const productRoutes = new Elysia({ prefix: "/products", name: "Product Routes", tags: ["Product Routes"] })
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
    response: {
      200: schemaResponseGet,
      400: schemaResponseError
    },
    detail: {
      summary: "Daftar Produk Aktif",
      description: "Mengambil daftar seluruh produk toko yang masih aktif (`isActive: true`). Endpoint ini mendukung pencarian parsial berdasarkan *query* `search` (nama), `barcode`, maupun pencarian spesifik berdasarkan `category_id`."
    }
  })
  .get("/:id", async ({ params: { id }, tenantId }) => {
    const productDetail = await getProductDetail(id, tenantId)

    return {
      success: true,
      message: "Get product detail success",
      data: productDetail,
    }
  }, {
    params: schemaQueryProductDetail,
    response: {
      200: schemaResponseGetDetail,
      400: schemaResponseError
    },
    detail: {
      summary: "Detail Produk",
      description: "Mengambil detail informasi spesifik dari satu produk berdasarkan ID (UUID). Endpoint ini akan mengembalikan data lengkap produk termasuk nama kategori (*join* dari tabel `categories`)."
    }
  })
  .use(adminGuard) // Middleware Admin
  .post("/", async ({ body, tenantId, set }) => {
    const data = await postProduct({ ...body, tenantId })

    set.status = 201;

    return {
      success: true,
      message: "Creating product data success!",
      data: data,
    }
  }, {
    body: schemaBodyProduct,
    response: {
      201: schemaResponsePost,
      400: schemaResponseError
    },
    detail: {
      summary: "Tambah Produk Baru",
      description: "Menambahkan data produk baru ke dalam katalog sistem. Endpoint ini akan secara otomatis melakukan validasi keunikan `barcode` (jika diisi) dan membuatkan *URL-friendly* `slug` dari nama produk.\n\n🚨 **Perhatian:** Endpoint ini dilindungi oleh `adminGuard` dan hanya bisa diakses oleh **Admin**."
    }
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
    response: {
      200: schemaResponsePatch,
      400: schemaResponseError
    },
    detail: {
      summary: "Perbarui Data Produk",
      description: "Memperbarui (*update*) informasi produk yang sudah ada secara parsial (tidak wajib mengirim semua *body*). Validasi keunikan `barcode` dan `slug` akan tetap berjalan untuk mencegah bentrok data.\n\n🚨 **Perhatian:** Endpoint ini dilindungi oleh `adminGuard` dan hanya bisa diakses oleh **Admin**."
    }
  })
  .delete("/:id", async ({ params: { id }, tenantId }) => {
    await softDeleteProduct(id, tenantId);

    return {
      success: true,
      message: "Success deleting data product!",
    }
  }, {
    params: schemaQueryUpdateProduct,
    response: {
      200: schemaResponseDelete,
      400: schemaResponseError,
      500: schemaResponseError,
    },
    detail: {
      summary: "Hapus Produk (Soft Delete)",
      description: "Menghapus produk dari daftar katalog secara *soft-delete*. Data fisik produk tidak akan dihapus dari *database* (hanya mengubah kolom `isActive` menjadi `false`), sehingga riwayat transaksi lama (struk kasir) yang menggunakan produk ini tidak akan rusak/hilang.\n\n🚨 **Perhatian:** Hanya bisa diakses oleh **Admin**."
    }
  });

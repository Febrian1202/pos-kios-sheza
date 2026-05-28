import Elysia from "elysia";
import { rateLimit } from "elysia-rate-limit";
import {
  bodySchemaTransaction,
  querySchemaTransaction,
  paramsSchemaTransaction,
  schemaResponseGet,
  schemaResponseGetDetail,
  schemaResponsePost,
  schemaResponsePostVoid
} from "./schema";
import { schemaResponseError } from "@shared";
import { authPlugin, adminGuard } from "@plugin";
import {
  createTransaction,
  getTransactionDetail,
  getTransactions,
  voidTransaction
} from './service.ts';
import { TransactionNotFoundError } from "./error.ts";

export const transactionRoutes = new Elysia({ prefix: "/transactions", name: "Transaction Routes", detail: { tags: ["Transaction Routes"] } })
  .error({
    "NOT_FOUND": TransactionNotFoundError
  })
  .onError(({ code, set, error }) => {
    if (code === "NOT_FOUND") {
      set.status = 404;
      return { success: false, message: error.message }
    }
  })
  .use(authPlugin)
  .get("/", async ({ tenantId, query }) => {
    const result = await getTransactions(tenantId, query);

    return {
      success: true,
      message: "Get transactions data success",
      data: result.data,
      meta: result.meta
    }
  }, {
    query: querySchemaTransaction,
    response: {
      200: schemaResponseGet,
      404: schemaResponseError
    },
    detail: {
      summary: "Daftar Riwayat Transaksi",
      description: "Mengambil daftar riwayat transaksi penjualan ritel toko. Endpoint ini biasanya digunakan pada halaman riwayat mesin kasir dan mendukung *pagination* serta pencarian data berdasarkan *query parameter*."
    }
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
    response: {
      200: schemaResponseGetDetail,
      404: schemaResponseError
    },
    detail: {
      summary: "Detail Transaksi Ritel",
      description: "Mengambil informasi detail dari satu transaksi spesifik berdasarkan ID (UUID). Endpoint ini akan mengembalikan data lengkap termasuk daftar barang (item) yang dibeli, harga satuan, dan total belanja untuk keperluan pencetakan struk ulang."
    }
  })
  .use(rateLimit({
    duration: 10000,
    max: 2,
    errorResponse: new Response(
      JSON.stringify({
        success: false,
        message: "The transaction is being processed. Please wait a moment to avoid duplicate data."
      }),
      { status: 429, headers: { 'Content-Type': 'application/json' } }
    )
  }))
  .post('/', async ({ body, tenantId, userId, set }) => {
    const result = await createTransaction(tenantId, userId, body);
    set.status = 201;

    return {
      success: true,
      message: "Transaction process success!",
      data: result,
    }
  }, {
    body: bodySchemaTransaction,
    response: {
      201: schemaResponsePost,
      409: schemaResponseError
    },
    detail: {
      summary: "Buat Transaksi Baru (Checkout)",
      description: "Memproses transaksi penjualan barang dari kasir. Endpoint ini akan menyimpan data pesanan dan secara otomatis **memotong stok barang** di *database*. Terdapat perlindungan *rate limit* (jendela waktu 10 detik) untuk mencegah data ganda (*double-submit*) akibat kasir mengklik tombol berulang kali saat jaringan lambat."
    }
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
    response: {
      200: schemaResponsePostVoid,
      400: schemaResponseError,
    },
    detail: {
      summary: "Batalkan Transaksi (Void)",
      description: "Membatalkan transaksi yang sudah terjadi (*void*). Endpoint ini akan mengubah status transaksi menjadi dibatalkan dan secara otomatis **mengembalikan stok barang** ke jumlah semula. \n\n🚨 **Perhatian:** Endpoint ini dilindungi oleh `adminGuard` dan hanya bisa diakses oleh *user* dengan *role* **Admin**."
    }
  })

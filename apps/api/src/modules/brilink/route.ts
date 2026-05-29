import { authPlugin, adminGuard } from "@/plugins";
import Elysia from "elysia";
import { rateLimit } from "elysia-rate-limit";
import {
  schemaBodyBrilink,
  schemaParamsDetailBrilink,
  schemaQueryBrilink,
  schemaQuerySummaryBrilink,
  schemaResponseGet,
  schemaResponseGetSummary,
  schemaResponsePost,
  schemaResponseGetDetail,
  schemaResponsePostVoid
} from "./schema";
import { schemaResponseError } from "@shared";
import {
  createBrilinkTransaction,
  getBrilinkSummary,
  getBrilinkTransaction,
  getBrilinkTransactionDetail,
  voidBrilink
} from "./service";
import { BrilinkNotFoundError } from "./error";

export const brilinkRoutes = new Elysia({ prefix: "/brilink", name: "Brilink Routes", tags: ["Brilink Routes"] })
  .error({
    "NOT_FOUND": BrilinkNotFoundError
  })
  .onError(({ code, set, error }) => {
    if (code === "NOT_FOUND") {
      set.status = 404;
      return { success: false, message: error.message }
    }
  })
  .use(authPlugin)
  .get("/", async ({ query, tenantId }) => {
    const result = await getBrilinkTransaction(tenantId, query);

    return {
      success: true,
      message: "Get Brilink Transaction data success",
      data: result
    }
  }, {
    query: schemaQueryBrilink,
    response: {
      200: schemaResponseGet,
      404: schemaResponseError
    },
    detail: {
      summary: "Daftar Riwayat Transaksi BRI Link",
      description: "Mengambil daftar riwayat transaksi agen BRI Link milik toko. Mendukung filter berdasarkan tanggal dan jenis transaksi (seperti transfer, tarik tunai, pembayaran, dll) untuk keperluan audit kasir."
    }
  })
  .get("/summary", async ({ tenantId, query }) => {
    const result = await getBrilinkSummary(tenantId, query);

    return {
      success: true,
      message: "Get summary brilink success",
      data: result
    }
  }, {
    query: schemaQuerySummaryBrilink,
    response: {
      200: schemaResponseGetSummary,
      400: schemaResponseError
    },
    detail: {
      summary: "Ringkasan Performa BRI Link",
      description: "Menampilkan ringkasan akumulasi transaksi BRI Link berdasarkan tanggal tertentu. Endpoint ini akan mengembalikan data total volume transaksi dan **total keuntungan (komisi agen)** yang dikelompokkan berdasarkan jenis transaksi."
    }
  })
  .get("/:id", async ({ tenantId, params }) => {
    const result = await getBrilinkTransactionDetail(tenantId, params);

    return {
      success: true,
      message: "Get Brilink transaction detail success",
      data: result
    }
  }, {
    params: schemaParamsDetailBrilink,
    response: {
      200: schemaResponseGetDetail,
      400: schemaResponseError
    },
    detail: {
      summary: "Detail Transaksi BRI Link",
      description: "Mengambil informasi spesifik dan lengkap dari satu transaksi BRI Link berdasarkan ID (UUID). Menampilkan rincian seperti nominal uang pelanggan, biaya admin bank, komisi agen bersih, dan nomor referensi struk."
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
  .post("/", async ({ body, tenantId, userId, set }) => {
    const result = await createBrilinkTransaction(tenantId, userId, body);

    set.status = 201;
    return {
      success: true,
      message: "Creating Brilink Transaction success!",
      data: result
    }
  }, {
    body: schemaBodyBrilink,
    response: {
      200: schemaResponsePost,
      400: schemaResponseError,
    },
    detail: {
      summary: "Catat Transaksi BRI Link Baru",
      description: "Mencatat transaksi agen BRI Link baru yang dilakukan oleh kasir. Endpoint ini memisahkan pencatatan antara uang pelanggan, biaya admin, dan komisi agen. Terdapat perlindungan *rate limit* (10 detik) untuk mencegah terjadinya pencatatan ganda akibat koneksi lambat."
    }
  })

  .use(adminGuard)
  .post("/:id/void", async ({ tenantId, params }) => {
    const result = await voidBrilink(tenantId, params);

    return {
      success: true,
      message: `Brilink transaction ${result?.referenceNumber} void success!`,
      data: result
    }
  }, {
    params: schemaParamsDetailBrilink,
    response: {
      200: schemaResponsePostVoid,
      400: schemaResponseError,
    },
    detail: {
      summary: "Batalkan Transaksi BRI Link (Void)",
      description: "Membatalkan pencatatan transaksi BRI Link jika terjadi kesalahan input oleh kasir atau transaksi gagal di mesin EDC. \n\n🚨 **Perhatian:** Endpoint ini dilindungi ketat oleh `adminGuard` dan **hanya bisa diakses oleh Admin**."
    }
  })


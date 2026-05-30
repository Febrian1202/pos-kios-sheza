import swagger from "@elysiajs/swagger";
import Elysia from "elysia";

export const swaggerPlugin = new Elysia()
  .use(Bun.env.NODE_ENV === "production" ? (app) => app : swagger({
    path: "/docs",
    documentation: {
      info: { title: "SaaS POS API", version: '1.0.0' },
      tags: [
        { name: "Auth Routes", description: "Endpoint untuk autentinkasi" },
        { name: "User Routes", description: "Endpoint untuk mengelola data user (cashier, Admin only)" },
        { name: "Transaction Routes", description: "Endpoint untuk transaksi retail" },
        { name: "Brilink Routes", description: "Endpoint untuk transaksi brilink" },
        { name: "Product Routes", description: "Endpoint untuk pengelolaan produk" },
        { name: "Category Routes", description: "Endpoint untuk pengelolaan kategori" },
        { name: "Report Routes", description: "Endpoint untuk laporan" },
      ]
    },
  }))

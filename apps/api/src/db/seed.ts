import { db } from "@db";
import { products, tenants, users, categories } from "@schema/index";

const main = async () => {
  console.log("Starting seeding data!");

  try {
    // Bersihkan dulu isi database
    await db.delete(products);
    await db.delete(categories);
    await db.delete(users);
    await db.delete(tenants);

    console.log("Seeding tenant data!")
    const [newTenant] = await db.insert(tenants).values({
      name: "Kios Sheza",
      slug: "kios-sheza",
      plan: "premium",
      isActive: true,
    }).returning({ id: tenants.id })

    if (!newTenant) {
      throw new Error("Failed creating tenant data, database didn't return the ID!")
    }
    console.log("Seeding tenant success!")

    console.log("Seeding users data!")
    await db.insert(users).values([
      {
        tenantId: newTenant.id,
        email: "admin@kiossheza.com",
        role: "admin",
        passwordHash: await Bun.password.hash("password", {
          algorithm: "bcrypt",
          cost: 10,
        })
      },
      {
        tenantId: newTenant.id,
        email: "kasir@kiossheza.com",
        role: "cashier",
        passwordHash: await Bun.password.hash("password", {
          algorithm: "bcrypt",
          cost: 10,
        })
      }
    ])
    console.log("Seeding users success!")

    const insertCategories = await db.insert(categories).values([
      {
        name: "Makanan",
        tenantId: newTenant.id,
        slug: "makanan",
      }, {
        name: "Minuman",
        tenantId: newTenant.id,
        slug: "minuman",
      }, {
        name: "Rokok",
        tenantId: newTenant.id,
        slug: "rokok",
      }, {
        name: "Kebersihan",
        tenantId: newTenant.id,
        slug: "kebersihan",
      }, {
        name: "Kebutuhan Rumah Tangga",
        tenantId: newTenant.id,
        slug: "kebutuhan-rumah-tangga",
      },
    ]).returning({ id: categories.id, slug: categories.slug })

    console.log(`Success create ${insertCategories.length} categories!`)

    const getCategoryId = (slug: string): string => {
      const category = insertCategories.find((c) => c.slug === slug)
      if (!category) {
        throw new Error(`Category ${slug} not found!`);
      }
      return category.id
    }

    console.log("Seeding product data!")
    await db.insert(products).values([
      // ================= MAKANAN =================
      {
        tenantId: newTenant.id,
        categoryId: getCategoryId("makanan"),
        name: "Indomie Goreng Original",
        barcode: "089686010839",
        sellingPrice: "3500",
        unit: "Bks",
        stockQty: 120,
      },
      {
        tenantId: newTenant.id,
        categoryId: getCategoryId("makanan"),
        name: "Beng-Beng Coklat 20g",
        barcode: "089960011402",
        sellingPrice: "2500",
        unit: "Pcs",
        stockQty: 60,
      },
      {
        tenantId: newTenant.id,
        categoryId: getCategoryId("makanan"),
        name: "Taro Net Rumput Laut 65g",
        barcode: "089686043210",
        sellingPrice: "5000",
        unit: "Bks",
        stockQty: 30,
      },
      {
        tenantId: newTenant.id,
        categoryId: getCategoryId("makanan"),
        name: "Roti Aoka Coklat",
        barcode: "089912345678",
        sellingPrice: "2500",
        unit: "Pcs",
        stockQty: 40,
      },

      // ================= MINUMAN =================
      {
        tenantId: newTenant.id,
        categoryId: getCategoryId("minuman"),
        name: "Aqua Botol 600ml",
        barcode: "089686054321",
        sellingPrice: "3500",
        unit: "Btl",
        stockQty: 100,
      },
      {
        tenantId: newTenant.id,
        categoryId: getCategoryId("minuman"),
        name: "Teh Pucuk Harum 350ml",
        barcode: "089987654321",
        sellingPrice: "4000",
        unit: "Btl",
        stockQty: 48,
      },
      {
        tenantId: newTenant.id,
        categoryId: getCategoryId("minuman"),
        name: "Kopi Kapal Api Mix (Sachet)",
        barcode: "089987651111",
        sellingPrice: "1500",
        unit: "Pcs",
        stockQty: 200, // Misal dijual ecer
      },
      {
        tenantId: newTenant.id,
        categoryId: getCategoryId("minuman"),
        name: "Le Minerale 1500ml",
        barcode: "089987652222",
        sellingPrice: "6500",
        unit: "Btl",
        stockQty: 24,
      },

      // ================= ROKOK =================
      {
        tenantId: newTenant.id,
        categoryId: getCategoryId("rokok"),
        name: "Sampoerna A Mild 16",
        barcode: "089987653333",
        sellingPrice: "32000",
        unit: "Bks",
        stockQty: 50,
      },
      {
        tenantId: newTenant.id,
        categoryId: getCategoryId("rokok"),
        name: "Gudang Garam Surya 16",
        barcode: "089987654444",
        sellingPrice: "34000",
        unit: "Bks",
        stockQty: 50,
      },
      {
        tenantId: newTenant.id,
        categoryId: getCategoryId("rokok"),
        name: "Dji Sam Soe Refill 12",
        barcode: "089987655555",
        sellingPrice: "21000",
        unit: "Bks",
        stockQty: 30,
      },
      {
        tenantId: newTenant.id,
        categoryId: getCategoryId("rokok"),
        name: "Marlboro Filter Black 20",
        barcode: "089987656666",
        sellingPrice: "40000",
        unit: "Bks",
        stockQty: 20,
      },

      // ================= KEBERSIHAN =================
      {
        tenantId: newTenant.id,
        categoryId: getCategoryId("kebersihan"),
        name: "Sabun Mandi Lifebuoy 110g",
        barcode: "089987657777",
        sellingPrice: "4500",
        unit: "Pcs",
        stockQty: 36,
      },
      {
        tenantId: newTenant.id,
        categoryId: getCategoryId("kebersihan"),
        name: "Pepsodent White 190g",
        barcode: "089987658888",
        sellingPrice: "12500",
        unit: "Tube",
        stockQty: 24,
      },
      {
        tenantId: newTenant.id,
        categoryId: getCategoryId("kebersihan"),
        name: "Shampo Clear Ice Cool (Renceng)",
        barcode: "089987659999",
        sellingPrice: "12000",
        unit: "Rtg",
        stockQty: 15,
      },
      {
        tenantId: newTenant.id,
        categoryId: getCategoryId("kebersihan"),
        name: "Sikat Gigi Formula Kuat",
        barcode: "089987650000",
        sellingPrice: "6000",
        unit: "Pcs",
        stockQty: 12,
      },

      // ========== KEBUTUHAN RUMAH TANGGA ==========
      {
        tenantId: newTenant.id,
        categoryId: getCategoryId("kebutuhan-rumah-tangga"),
        name: "Hit Aerosol Anti Nyamuk 600ml",
        barcode: "089911112222",
        sellingPrice: "38500",
        unit: "Klg",
        stockQty: 12,
      },
      {
        tenantId: newTenant.id,
        categoryId: getCategoryId("kebutuhan-rumah-tangga"),
        name: "Deterjen Daia Putih 850g",
        barcode: "089911113333",
        sellingPrice: "18500",
        unit: "Bks",
        stockQty: 20,
      },
      {
        tenantId: newTenant.id,
        categoryId: getCategoryId("kebutuhan-rumah-tangga"),
        name: "Sunlight Jeruk Nipis 400ml",
        barcode: "089911114444",
        sellingPrice: "10500",
        unit: "Pch", // Pouch
        stockQty: 24,
      },
      {
        tenantId: newTenant.id,
        categoryId: getCategoryId("kebutuhan-rumah-tangga"),
        name: "Tisu Paseo Soft 250s",
        barcode: "089911115555",
        sellingPrice: "19000",
        unit: "Pcs",
        stockQty: 15,
      }
    ])
    console.log("Seeding 20 product success!");

    console.log("Seeding data complete !");
  } catch (e) {
    console.log("Error while seeding the data : ", e);
  } finally {
    process.exit();
  }
}

main();

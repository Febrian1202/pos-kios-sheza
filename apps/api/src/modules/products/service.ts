import { and, desc, eq, ilike } from "drizzle-orm"
import { slugify } from "@helper";
import { products } from "@/db/schema"
import { db } from "@/db";
import { ProductNotFoundError } from "./error";
import { ConflictError } from "@/plugins/error";
import { type ArgsProduct, type ArgsProductUpdate } from "./schema";

export const getProduct = async (tenantId: string, search?: string, barcode?: string, categoryId?: string) => {
  const filters = [eq(products.tenantId, tenantId)];

  if (search) {
    filters.push(ilike(products.name, `%${search}%`));
  }

  if (barcode) filters.push(eq(products.barcode, barcode));

  if (categoryId) filters.push(eq(products.categoryId, categoryId));

  const result = await db.query.products.findMany({
    where: and(...filters),
    orderBy: desc(products.createdAt)
  })

  return result;
}

export const getProductDetail = async (id: string, tenantId: string) => {
  const product = await db.query.products.findFirst({
    columns: {
      name: true,
      barcode: true,
      sellingPrice: true,
      unit: true,
      stockQty: true,
      createdAt: true,
    },
    where: and(
      eq(products.tenantId, tenantId),
      eq(products.id, id),
      eq(products.isActive, true)
    ),
    with: {
      category: {
        columns: {
          name: true,
        }
      }
    }
  });

  if (!product) throw new ProductNotFoundError("Product detail not found!")

  return {
    name: product.name,
    category: product.category?.name,
    barcode: product.barcode,
    sellingPrice: product.sellingPrice,
    unit: product.unit,
    stockQty: product.stockQty,
    createdAt: product.createdAt,
  }
}

export const postProduct = async (args: ArgsProduct) => {
  if (args.barcode && args.barcode.trim() !== "") {
    const existingBarcode = await db.query.products.findFirst({
      where: and(
        eq(products.tenantId, args.tenantId),
        eq(products.barcode, args.barcode),
      )
    })

    if (existingBarcode) throw new ConflictError(`Failed, Barcode ${args.barcode} is taken by another product!`);
  }

  if (!args.name) throw new ConflictError("Failed, name cannot empty!")

  let slug = slugify(args.name);

  const existingSlug = await db.query.products.findFirst({
    where: and(eq(products.slug, slug), eq(products.tenantId, args.tenantId))
  })

  if (existingSlug) {
    slug = `${slug}-${Math.random().toString(36).substring(2, 6)}`;
  }

  const [newProduct] = await db.insert(products).values({
    name: args.name,
    categoryId: args.categoryId,
    tenantId: args.tenantId,
    barcode: args.barcode,
    sellingPrice: args.sellingPrice,
    unit: args.unit,
    stockQty: args.stockQty,
    slug: slug,
  }).returning({
    id: products.id,
    name: products.name,
    slug: products.slug,
  })

  return newProduct;
}

export const patchProduct = async (id: string, tenantId: string, args: ArgsProductUpdate) => {
  const currentProduct = await db.query.products.findFirst({
    columns: { name: true, barcode: true },
    where: and(
      eq(products.tenantId, tenantId),
      eq(products.id, id),
    )
  })

  if (!currentProduct) throw new ProductNotFoundError("Data product not found!");

  let newSlug: string | undefined = undefined;

  if (args.name && args.name !== currentProduct.name) {
    newSlug = slugify(args.name);

    const existingSlug = await db.query.products.findFirst({
      columns: { id: true },
      where: and(
        eq(products.tenantId, tenantId),
        eq(products.slug, newSlug),
      )
    })

    if (existingSlug && existingSlug.id !== id) {
      newSlug = `${newSlug}-${Math.random().toString(36).substring(2, 6)}`;
    }
  }

  if (args.barcode && args.barcode !== currentProduct.barcode) {
    const existingBarcode = await db.query.products.findFirst({
      columns: { id: true },
      where: and(
        eq(products.tenantId, tenantId),
        eq(products.barcode, args.barcode),
      )
    })

    if (existingBarcode && existingBarcode.id !== id) throw new ConflictError(`Barcode ${args.barcode} is used by another product!`)
  }

  const [updatedProduct] = await db.update(products).set({
    name: args.name,
    barcode: args.barcode,
    categoryId: args.categoryId,
    sellingPrice: args.sellingPrice,
    slug: newSlug,
    stockQty: args.stockQty,
    unit: args.unit,
  }).where(
    and(
      eq(products.tenantId, tenantId),
      eq(products.id, id)
    )
  ).returning();

  return updatedProduct;
}

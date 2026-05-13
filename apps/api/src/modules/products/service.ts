import { and, desc, eq, ilike } from "drizzle-orm"
import { products } from "@/db/schema"
import { db } from "@/db";

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

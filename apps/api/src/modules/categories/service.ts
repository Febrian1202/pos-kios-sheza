import { categories, products } from "@/db/schema"
import { and, desc, eq, ilike } from "drizzle-orm"
import { db } from "@/db"
import { CategoryNotFoundError } from "./error"
import { ConflictError } from "@/plugins"
import { slugify } from "@helper"
import type { ArgsUpdateCategory } from "./schema"

export const getCategory = async (tenantId: string, search?: string) => {
  const filters = [eq(categories.tenantId, tenantId)]

  if (search) filters.push(ilike(categories.name, `%${search}%`));

  const result = await db.query.categories.findMany({
    columns: {
      name: true,
      id: true,
      slug: true,
      createdAt: true,
      updatedAt: true,
    },
    where: and(...filters),
    orderBy: desc(categories.updatedAt)
  })

  return result;
}

export const getCategoryDetail = async (id: string, tenantId: string) => {
  const result = await db.query.categories.findFirst({
    where: and(
      eq(categories.tenantId, tenantId),
      eq(categories.id, id),
    ),
    orderBy: desc(categories.updatedAt),
  });

  if (!result) throw new CategoryNotFoundError("Category not found!");

  return result;
}

export const postCategory = async (name: string, tenantId: string) => {

  const exist = await existingCategory(name, tenantId);

  if (exist) throw new ConflictError("Failed, category already exist!");

  const slug = slugify(name);

  const [newCategory] = await db.insert(categories).values({
    name: name,
    slug: slug,
    tenantId: tenantId,
  }).returning({
    id: categories.id,
    name: categories.name,
    slug: categories.slug,
  });

  return newCategory;
}

export const updateCategory = async (id: string, tenantId: string, params: ArgsUpdateCategory) => {

  const currentCategory = await db.query.categories.findFirst({
    columns: { name: true },
    where: and(
      eq(categories.tenantId, tenantId),
      eq(categories.id, id),
    )
  });

  if (!currentCategory) throw new CategoryNotFoundError(`Failed, category not found!`);

  let newSlug: string | undefined = undefined;

  if (params.name && params.name !== currentCategory.name) {
    const exist = await existingCategory(params.name, tenantId);

    if (exist) throw new ConflictError(`Category ${params.name} already exist!`);

    newSlug = slugify(params.name);
  }

  const [updatedCategory] = await db.update(categories).set({
    name: params.name,
    slug: newSlug,
  }).where(and(
    eq(categories.tenantId, tenantId),
    eq(categories.id, id),
  )).returning();

  return updatedCategory;
}

export const deleteCategory = async (id: string, tenantId: string) => {
  const existingCategory = await db.query.categories.findFirst({
    where: and(
      eq(categories.tenantId, tenantId),
      eq(categories.id, id),
    )
  });

  if (!existingCategory) throw new CategoryNotFoundError("Category not found!");

  const existingProduct = await db.query.products.findFirst({
    where: eq(products.categoryId, id),
  })

  if (existingProduct) throw new ConflictError(`Failed! category ${existingCategory.name} is still used by another product and cannot be deleted!`);

  await db.delete(categories).where(and(
    eq(categories.tenantId, tenantId),
    eq(categories.id, id),
  ))

  return;
}

const existingCategory = async (name: string, tenantId: string) => {
  const result = await db.query.categories.findFirst({
    columns: {
      name: true,
    },
    where: and(
      eq(categories.tenantId, tenantId),
      eq(categories.name, name),
    )
  });

  return result;
}


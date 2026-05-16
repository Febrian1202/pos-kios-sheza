ALTER TABLE "categories" DROP CONSTRAINT "unique_tenant_category_slug";--> statement-breakpoint
ALTER TABLE "categories" ADD CONSTRAINT "unique_tenant_category_slug" UNIQUE("tenant_id","slug");
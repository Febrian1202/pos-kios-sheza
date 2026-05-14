ALTER TABLE "products" ADD COLUMN "slug" varchar;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_slug_unique" UNIQUE("slug");
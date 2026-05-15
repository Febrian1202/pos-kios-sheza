ALTER TABLE "categories" DROP CONSTRAINT "categories_slug_unique";--> statement-breakpoint
ALTER TABLE "products" DROP CONSTRAINT "products_slug_unique";--> statement-breakpoint
ALTER TABLE "products" DROP CONSTRAINT "products_barcode_unique";--> statement-breakpoint
ALTER TABLE "transactions" DROP CONSTRAINT "transactions_trx_number_unique";--> statement-breakpoint
ALTER TABLE "multi-tenant" ALTER COLUMN "is_active" SET DEFAULT true;--> statement-breakpoint
ALTER TABLE "categories" ADD CONSTRAINT "unique_tenant_category_name" UNIQUE("tenant_id","name");--> statement-breakpoint
ALTER TABLE "categories" ADD CONSTRAINT "unique_tenant_category_slug" UNIQUE("tenant_id","name");--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "unique_tenant_product_slug" UNIQUE("tenant_id","slug");--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "unique_tenant_product_barcode" UNIQUE("tenant_id","barcode");--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "unique_tenant_transaction_trx_number" UNIQUE("tenant_id","trx_number");
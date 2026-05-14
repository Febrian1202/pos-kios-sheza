ALTER TABLE "brilink_transactions" ALTER COLUMN "trx_type" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "brilink_transactions" ALTER COLUMN "customer_amount" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "brilink_transactions" ALTER COLUMN "admin_fee_charged" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "brilink_transactions" ALTER COLUMN "agent_commission" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "brilink_transactions" ALTER COLUMN "reference_number" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "brilink_transactions" ALTER COLUMN "status" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "categories" ALTER COLUMN "name" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "categories" ALTER COLUMN "slug" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "multi-tenant" ALTER COLUMN "name" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "multi-tenant" ALTER COLUMN "slug" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "multi-tenant" ALTER COLUMN "plan" SET DEFAULT 'free';--> statement-breakpoint
ALTER TABLE "multi-tenant" ALTER COLUMN "plan" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "products" ALTER COLUMN "name" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "products" ALTER COLUMN "slug" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "products" ALTER COLUMN "selling_price" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "transactions" ALTER COLUMN "total_amount" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "transactions" ALTER COLUMN "amount_paid" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "transactions" ALTER COLUMN "change_amount" SET NOT NULL;
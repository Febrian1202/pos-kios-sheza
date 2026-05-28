ALTER TABLE "transactions" ALTER COLUMN "trx_number" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "transaction_items" ALTER COLUMN "qty" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "transaction_items" ALTER COLUMN "unit_price" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "transaction_items" ALTER COLUMN "subtotal" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "transaction_items" ALTER COLUMN "created_at" SET NOT NULL;
CREATE TABLE "brilink_transactions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid,
	"cashier_id" uuid,
	"trx_type" varchar(255),
	"customer_amount" numeric,
	"admin_fee_charged" numeric,
	"agent_commission" numeric,
	"reference_number" varchar(255),
	"status" varchar(255),
	"notes" varchar(255),
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "categories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid,
	"name" varchar(255),
	"slug" varchar(255),
	CONSTRAINT "categories_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "daily_summaries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid,
	"summary_date" date NOT NULL,
	"retail_revenue" numeric,
	"retail_cogs" numeric,
	"brilink_commission" numeric,
	"total_revenue" numeric,
	"gross_profit" numeric,
	"trx_count" integer,
	"generated_at" timestamp DEFAULT now(),
	CONSTRAINT "unique_tenant_date" UNIQUE("tenant_id","summary_date")
);
--> statement-breakpoint
CREATE TABLE "multi-tenant" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text,
	"slug" varchar(255),
	"plan" varchar(255),
	"is_active" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "multi-tenant_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid,
	"name" varchar(255),
	"email" varchar(255),
	"role" varchar(255),
	"password_hash" text,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "products" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid,
	"category_id" uuid,
	"name" varchar(255),
	"barcode" varchar(255),
	"selling_price" numeric,
	"unit" varchar(255),
	"stock_qty" integer,
	"is_active" boolean DEFAULT true,
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "transactions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid,
	"cashier_id" uuid,
	"trx_number" varchar(255),
	"total_amount" numeric,
	"amount_paid" numeric,
	"change_amount" numeric,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "transactions_trx_number_unique" UNIQUE("trx_number")
);
--> statement-breakpoint
CREATE TABLE "transaction_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"transaction_id" uuid,
	"product_id" uuid,
	"qty" integer,
	"unit_price" numeric,
	"subtotal" numeric
);
--> statement-breakpoint
ALTER TABLE "brilink_transactions" ADD CONSTRAINT "brilink_transactions_tenant_id_multi-tenant_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."multi-tenant"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "brilink_transactions" ADD CONSTRAINT "brilink_transactions_cashier_id_users_id_fk" FOREIGN KEY ("cashier_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "categories" ADD CONSTRAINT "categories_tenant_id_multi-tenant_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."multi-tenant"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "daily_summaries" ADD CONSTRAINT "daily_summaries_tenant_id_multi-tenant_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."multi-tenant"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_tenant_id_multi-tenant_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."multi-tenant"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_tenant_id_multi-tenant_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."multi-tenant"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_tenant_id_multi-tenant_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."multi-tenant"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_cashier_id_users_id_fk" FOREIGN KEY ("cashier_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transaction_items" ADD CONSTRAINT "transaction_items_transaction_id_transactions_id_fk" FOREIGN KEY ("transaction_id") REFERENCES "public"."transactions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transaction_items" ADD CONSTRAINT "transaction_items_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
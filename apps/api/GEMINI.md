# Project Overview

This is the backend API for **Kios Sheza**, a multi-tenant Point of Sale (POS) and inventory management system. It provides RESTful endpoints for managing authentication, products, categories, transactions (retail and Brilink), and generating reports.

**Core Technologies:**
*   **Runtime:** [Bun](https://bun.sh/)
*   **Framework:** [ElysiaJS](https://elysiajs.com/) (TypeScript)
*   **Database ORM:** [Drizzle ORM](https://orm.drizzle.team/)
*   **Database Engine:** PostgreSQL (via `pg`/`postgres` driver)
*   **Validation & Schemas:** TypeBox (via `elysia` and `drizzle-typebox`)
*   **Documentation:** Swagger / OpenAPI (via `@elysiajs/swagger`)

---

# Building and Running

The project relies on Bun for dependency management and task execution.

### Dependencies
```bash
bun install
```

### Starting the Server
*   **Development (Watch Mode):**
    ```bash
    bun run dev
    ```
*   **Production:**
    ```bash
    bun run start
    ```

### Database Management (Drizzle Kit)
*   **Generate Migrations:** `bun run db:generate`
*   **Run Migrations:** `bun run db:migrate`
*   **Reset & Migrate:** `bun run db:fresh`
*   **Seed Database:** `bun run db:seed`
*   **Open Drizzle Studio:** `bun run db:studio`

---

# Development Conventions

When modifying or adding features to this codebase, adhere strictly to the following conventions:

## 1. Architecture & Modularity
The application follows a highly modular structure inside the `src/` directory. Features are grouped by domain under `src/modules/<domain>/`.
Each module MUST contain:
*   `route.ts`: Defines the Elysia endpoints, request validation, and Swagger documentation.
*   `service.ts`: Contains the core business logic and database queries.
*   `schema.ts`: Defines TypeBox schemas for Request (body, query, params) and Response structures.
*   `error.ts`: Defines custom error classes (e.g., `NotFoundError`, `ConflictError`).

## 2. Schema and Validation (`schema.ts`)
*   **Constants First:** Define regular expressions, constants, and enums at the top of the file using `UPPER_SNAKE_CASE`.
*   **Drizzle-Typebox:** Use `createInsertSchema` and `createSelectSchema` from `drizzle-typebox` to generate base schemas directly from the database schema.
*   **Validation:** Use Elysia's `t` and `validationDetail` to provide human-readable, grammatically correct error messages.
*   **Response Formatting:** All successful API responses MUST be wrapped using the `withSuccess` or `withSuccessMeta` helpers from `@/shared`.
*   **Grouping:** Clearly separate `// --- Request Schemas ---` and `// --- Response Schemas ---`.

## 3. Routing & Swagger Documentation (`route.ts`)
*   **Type Safety:** Bind the schemas defined in `schema.ts` to the route's `body`, `query`, `params`, and `response` properties.
*   **Swagger Details:** EVERY endpoint MUST have a `detail` block containing a `summary` and `description` to automatically generate high-quality Swagger/OpenAPI documentation.
*   **Guards:** Apply `authPlugin` for routes requiring login. Apply `adminGuard` for sensitive operations (e.g., creating users, modifying settings, voiding transactions).

## 4. Service Layer & Database (`service.ts`)
*   **Tenant Isolation:** This is a multi-tenant system. Almost every database query MUST include a filter on `tenantId` (e.g., `eq(table.tenantId, tenantId)`) to ensure data is strictly isolated between tenants/stores.
*   **Error Handling:** Do NOT throw generic HTTP errors in the service. Throw custom domain errors defined in `error.ts` (e.g., `ProductNotFoundError`). These are mapped to proper HTTP status codes in the route's `.onError` handler.
*   **Soft Deletes:** Never delete master data (like products) physically if they are referenced by transactions. Update the `isActive` flag to `false` instead.

## 5. Security Practices
*   Passwords must be hashed using `Bun.password.hash(..., { algorithm: "bcrypt" })`.
*   Sensitive tokens (`refreshToken`) must be stored in `HttpOnly`, `secure`, and `sameSite: 'strict'` cookies.
*   Sensitive operations must be protected with appropriate Rate Limiting (`elysia-rate-limit`).

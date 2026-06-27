<div align="center">

# 🪑 Furniture Store - AI-Powered Ecommerce Platform

**Tell the AI what you're furnishing. Get in-stock, on-budget recommendations in seconds.**

[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-149ECA?logo=react&logoColor=white)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-Strict-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Sanity](https://img.shields.io/badge/Sanity-CMS-F03E2F?logo=sanity&logoColor=white)](https://www.sanity.io/)
[![Clerk](https://img.shields.io/badge/Clerk-Auth-6C47FF?logo=clerk&logoColor=white)](https://clerk.com/)
[![Stripe](https://img.shields.io/badge/Stripe-Payments-635BFF?logo=stripe&logoColor=white)](https://stripe.com/)
[![Google Gemini](https://img.shields.io/badge/Google_Gemini-AI_Agent-8E75B2?logo=googlegemini&logoColor=white)](https://ai.google.dev/)

</div>

---

## 📖 Overview

**Furniture Store** is an AI-native ecommerce platform that pairs a conventional, conversion-optimized storefront with an autonomous **tool-calling shopping agent** — built to demonstrate how generative AI can sit inside real commerce infrastructure instead of bolted on top of it.

The application combines:

- A natural-language shopping assistant that queries live inventory instead of guessing from training data
- Identity-aware AI tooling that changes its own capabilities based on whether a shopper is signed in
- Server-validated cart and checkout, re-priced against the database at the moment of purchase
- Idempotent, signature-verified Stripe webhook fulfillment
- A headless Sanity CMS content layer shared by the storefront, the AI agent, and the admin Studio
- Per-request-scoped client state, avoiding the cross-user state leakage common in naive Next.js + Zustand setups

### 🎯 Problem Statement

| Problem                                                                                      | Furniture Store's Solution                                                                                                                                  |
| -------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Filter checkboxes can't express vague intent ("something cozy for a small reading corner")   | An AI agent maps natural language to structured category/material/color/price filters and runs them against the live catalog                                |
| Most "AI shopping assistant" demos can't see real inventory and recommend out-of-stock items | The agent's tools run the exact same Sanity queries and client the storefront uses — one source of truth, always                                            |
| A chat assistant could leak one user's order history to another                              | The order-lookup tool is only registered on the agent when a valid, server-resolved Clerk session exists — it's absent from the toolset entirely for guests |
| Client-held cart prices/stock can be stale or tampered with                                  | `createCheckoutSession` re-fetches authoritative price and stock from Sanity immediately before creating a Stripe session                                   |
| Stripe webhook retries can double-fulfill an order and double-decrement stock                | An idempotency check against `stripePaymentId` runs before any order is written                                                                             |

---

## ✨ Key Features

### 🤖 AI Shopping Assistant

- **Tool-Calling Agent** — A `ToolLoopAgent` (Vercel AI SDK) running Google's Gemini 2.5 Flash, with two Zod-validated tools (`searchProducts`, `getMyOrders`) and tightly scoped system instructions defining exact category/material/color enums and a one-call-per-query discipline.
- **Conversational Commerce UI** — Tool results render as the same `ProductCardWidget` / `OrderCardWidget` components used on the storefront, not raw text or markdown tables, so AI-sourced results feel native to the app.
- **Contextual Cross-Sell** — An "Ask AI for similar products" button on every product page pre-loads the chat with a prompt instructing the agent to search the same category/material while explicitly excluding the current item.
- **Streamed Responses** — Replies render token-by-token via the AI SDK's UI message stream, instead of waiting for a full completion.

### 🛍️ Storefront & Product Discovery

- Server-rendered catalog with faceted filtering — category, material, color, price range, and in-stock-only — resolved entirely in GROQ on the server.
- Dedicated relevance-scoring query (`score()`/`boost()`) that weights free-text matches in a product's **name** above matches in its **description**.
- Featured products carousel, category tiles, and a dedicated product detail page with a media gallery.

### 🛒 Cart & Checkout

- Persistent cart with quantity merging for duplicate items and live stock re-validation against the cart (`useCartStock`) before checkout.
- Stripe Checkout Sessions with shipping-address collection across 50+ supported countries.
- Cart contents are independently re-validated against live Sanity price and stock — server-side — immediately before a session is created.

### 📦 Order Management

- Authenticated order history and detail pages, scoped per Clerk user.
- Idempotent, signature-verified Stripe webhook that creates the order record and atomically decrements stock for every line item in a single Sanity transaction.
- Status lifecycle (`paid` → `shipped` → `delivered`/`cancelled`) with a centralized config driving badges, emoji, and icon styling everywhere it's displayed.

### 🔐 Auth & Access Control

- Full authentication lifecycle via **Clerk** — sign in/up, session management, and a `UserButton` with custom menu items.
- Edge-level route protection (`proxy.ts` + `createRouteMatcher`) guarding `/checkout`, `/checkout/success`, and `/orders/*` before any page code executes.
- Server-resolved identity passed into the AI agent factory — the client cannot influence which user's orders the agent is permitted to query.

### 🧩 Content Management (Sanity Studio)

- An embedded Sanity Studio at `/studio` — no separate deployment — for managing products, categories, orders, and customers.
- Grouped, validated content schemas (required fields, positive-price rules, non-negative integer stock) enforced at the schema level, not just in application code.
- Real-time content sync to the storefront via Sanity's Live Content API.

---

## 🌍 Real-World Use Cases

- **Natural-language product discovery** — a shopper describes what they want instead of hunting through filter menus, and the AI translates intent into a structured catalog query.
- **Inventory-aware recommendations** — every AI-suggested product reflects current stock, so the assistant never recommends something that's unavailable.
- **Guided cross-selling** — a shopper on a product page gets one-click access to genuinely different alternatives in the same category, not the item they're already looking at.
- **Self-service order tracking** — signed-in users can ask the assistant about their orders conversationally instead of navigating to an orders page.
- **Headless commerce case study** — a working example of a single content lake (Sanity) safely shared between a public storefront, an authenticated checkout flow, and an LLM tool layer.

---

## 🏗️ Tech Stack

### Application — `ai-ecommerce-furniture-store`

| Technology                       | Purpose                                                                                |
| -------------------------------- | -------------------------------------------------------------------------------------- |
| ⚡ **Next.js 16 (App Router)**   | Server Components, Server Actions, route groups, route handlers, edge proxy middleware |
| ⚛️ **React 19**                  | Component model, Suspense-driven loading states                                        |
| 🟦 **TypeScript (strict mode)**  | End-to-end type safety, including types generated directly from the Sanity schema      |
| 🎨 **Tailwind CSS v4**           | Utility-first, mobile-first styling with dark-mode variants throughout                 |
| 🧩 **shadcn/ui + Radix UI**      | Accessible, composable, unstyled primitives (Sheet, Dialog, Select, Tabs…)             |
| 🎯 **lucide-react**              | Consistent SVG icon set across storefront and Studio                                   |
| 🐻 **Zustand**                   | Per-request-scoped cart and chat UI stores via React Context                           |
| 🎞️ **Embla Carousel + Autoplay** | Featured products carousel                                                             |
| 📝 **react-markdown**            | Safely renders the AI agent's streamed markdown responses                              |
| 🔔 **sonner**                    | Toast feedback for cart and checkout actions                                           |

### AI & Agent Layer

| Technology                                        | Purpose                                                                           |
| ------------------------------------------------- | --------------------------------------------------------------------------------- |
| 🧠 **Vercel AI SDK v6** (`ai`, `@ai-sdk/react`)   | `ToolLoopAgent` orchestration, streaming UI message protocol, tool-call lifecycle |
| 🤖 **Google Gemini 2.5 Flash** (`@ai-sdk/google`) | Low-latency tool-calling model powering the shopping agent                        |
| ✅ **Zod**                                        | Runtime-validated schemas for every AI tool's input parameters                    |

### Commerce, Identity & Content Services

| Service                            | Role                                                                                 |
| ---------------------------------- | ------------------------------------------------------------------------------------ |
| **Sanity** (Content Lake + Studio) | Structured content store, GROQ query language, generated types, embedded admin UI    |
| **Clerk**                          | Authentication, session management, route protection, user identity for the AI agent |
| **Stripe**                         | Checkout Sessions, signed webhook events, customer record management                 |

---

## 📁 Folder Structure

```text
.
├── app/
│   ├── (store)/                 # Storefront route group (shared layout & providers)
│   │   ├── page.tsx              # Home — server-rendered catalog + filters
│   │   ├── products/[slug]/      # Product detail (dynamic route)
│   │   ├── checkout/             # Checkout + success flow
│   │   └── orders/[id]/          # Order history & detail (auth-protected)
│   ├── api/
│   │   ├── chat/route.ts         # AI agent streaming endpoint
│   │   └── webhooks/stripe/      # Signed Stripe webhook handler
│   └── studio/[[...tool]]/       # Embedded Sanity Studio
├── actions/                       # "use server" Server Actions (checkout, customers)
├── components/
│   ├── store/                    # Storefront UI (cards, cart, header, skeletons)
│   │   └── chat/                  # Chat-specific UI (bubbles, tool widgets)
│   └── ui/                       # shadcn/ui primitives (button, sheet, dialog...)
├── hooks/
│   └── useCartStock.ts            # Live stock re-validation for cart items
├── lib/
│   ├── ai/                        # Agent definition, tool implementations, types
│   ├── constants/                 # Stock thresholds, order status config, filters
│   ├── store/                     # Zustand store factories + context providers
│   └── utils.ts                    # Formatting + AI message-part helpers
├── sanity/
│   ├── schemaTypes/                # Typed content models (product, order, customer…)
│   ├── queries/                    # Centralized, typed GROQ queries
│   └── lib/                        # Sanity client + Live Content API setup
├── proxy.ts                        # Edge middleware — Clerk route protection
└── sanity.config.ts                 # Studio configuration
```

---

## 🗄️ Database Schema

This project uses **Sanity** as a structured content database, with content modeled declaratively as TypeScript schema definitions (`defineType`/`defineField`) rather than hand-written SQL migrations. Every document automatically receives an `_id`, `_type`, `_createdAt`, `_updatedAt`, and `_rev` (revision) field; the tables below list only the custom fields defined per content type.

### Products

| Field                  | Type           | Description                                                |
| ---------------------- | -------------- | ---------------------------------------------------------- |
| **`name`**             | string         | Product name, required                                     |
| **`slug`**             | slug           | URL-safe identifier, auto-derived from `name`, required    |
| **`description`**      | text           | Product description                                        |
| **`price`**            | number         | Price in GBP, required, must be positive                   |
| **`category`**         | reference      | **Foreign key** → **Categories**, required                 |
| **`material`**         | string (enum)  | Filterable material (wood, metal, fabric, leather, glass)  |
| **`color`**            | string (enum)  | Filterable color                                           |
| **`dimensions`**       | string         | Free-text dimensions, e.g. `"180cm x 90cm x 75cm"`         |
| **`images`**           | array of image | At least one required; supports hotspot cropping           |
| **`stock`**            | number         | Units in stock, non-negative integer, defaults to `0`      |
| **`featured`**         | boolean        | Shown on the homepage carousel; defaults to `false`        |
| **`assemblyRequired`** | boolean        | Whether the product requires assembly; defaults to `false` |

### Categories

| Field       | Type   | Description                                              |
| ----------- | ------ | -------------------------------------------------------- |
| **`title`** | string | Category name, required                                  |
| **`slug`**  | slug   | URL-safe identifier, auto-derived from `title`, required |
| **`image`** | image  | Category thumbnail, with hotspot cropping                |

### Orders

| Field                 | Type            | Description                                                                         |
| --------------------- | --------------- | ----------------------------------------------------------------------------------- |
| **`orderNumber`**     | string          | Human-readable order reference, read-only, required                                 |
| **`items`**           | array of object | Each item holds a **product reference**, `quantity`, and `priceAtPurchase` snapshot |
| **`total`**           | number          | Order total in GBP, read-only                                                       |
| **`status`**          | string (enum)   | `paid` / `shipped` / `delivered` / `cancelled`                                      |
| **`customer`**        | reference       | **Foreign key** → **Customers**                                                     |
| **`clerkUserId`**     | string          | Denormalized Clerk user ID, read-only — enables direct order lookup without a join  |
| **`email`**           | string          | Customer email at time of order, read-only                                          |
| **`address`**         | object          | Shipping address (`name`, `line1`, `line2`, `city`, `postcode`, `country`)          |
| **`stripePaymentId`** | string          | Stripe payment intent ID, read-only — the idempotency key for webhook processing    |
| **`createdAt`**       | datetime        | Order creation timestamp, read-only                                                 |

### Customers

| Field                  | Type     | Description                                                                  |
| ---------------------- | -------- | ---------------------------------------------------------------------------- |
| **`email`**            | string   | Required                                                                     |
| **`name`**             | string   | Customer's full name                                                         |
| **`clerkUserId`**      | string   | Bridges this record to the corresponding Clerk user                          |
| **`stripeCustomerId`** | string   | Stripe customer ID, read-only, required — links to the Stripe billing system |
| **`createdAt`**        | datetime | Record creation timestamp, read-only                                         |

#### Relationships Overview

- **Products → Categories**: many-to-one (`category`) — every product belongs to exactly one category.
- **Orders → Products**: one-to-many via `items[].product` — each order line item references one product, with quantity and a price snapshot frozen at purchase time.
- **Orders → Customers**: many-to-one (`customer`) — an order optionally links to a customer record.
- **Customers ↔ Clerk**: bridged via `clerkUserId`, a plain string field rather than a database-level relation, since Clerk is an external identity provider.
- **Orders ↔ Clerk**: orders _also_ store `clerkUserId` directly (denormalized), so the `getMyOrders` AI tool and the orders page can query by user without joining through Customers.

---

## 🔐 Authentication & Security

| Layer                              | Implementation                                                                                                                                                                                                                   |
| ---------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Identity**                       | Clerk handles sign-up, sign-in, and session management, exposed to the app via `auth()`/`currentUser()` and the `<UserButton>` component.                                                                                        |
| **Route Protection**               | `clerkMiddleware` + `createRouteMatcher` in `proxy.ts` (Next.js 16's renamed middleware entry point) protects `/checkout`, `/checkout/success`, and `/orders/*` before any page code executes.                                   |
| **AI Agent Identity Scoping**      | The chat route resolves `userId` server-side via Clerk's `auth()` and passes it into the agent factory — the client cannot influence which user's data the agent is allowed to access.                                           |
| **Conditional Tool Registration**  | `createGetMyOrdersTool` returns `null` for unauthenticated requests, and the agent's tool registry simply omits the order-lookup capability — the model never has access to it, rather than being instructed to refuse using it. |
| **Per-User Query Isolation**       | `getMyOrders` filters by `clerkUserId` _inside_ the GROQ query itself, not by post-filtering a broader result set.                                                                                                               |
| **Webhook Integrity**              | The Stripe webhook handler rejects any request without a valid `stripe-signature` header, verified against `STRIPE_WEBHOOK_SECRET`, before the event body is ever processed.                                                     |
| **Session Ownership Verification** | `getCheckoutSession` cross-checks the Stripe session's `clerkUserId` metadata against the currently authenticated user before returning order details.                                                                           |
| **Privileged Write Isolation**     | A token-less, read-only `client` handles all public reads; a separate `writeClient` (scoped to `SANITY_API_WRITE_TOKEN`) is only ever used in Server Actions and the webhook handler — never exposed to the browser.             |
| **Authoritative Pricing**          | Checkout line items are built from prices fetched fresh from Sanity at submission time, not from client-supplied cart values, closing a common price-tampering vector.                                                           |

---

## 🔌 API & Integration Layer

Furniture Store doesn't expose a hand-rolled public REST API for its own frontend — Server Actions and a small set of Route Handlers form the entire integration surface, all talking to the same Sanity client and GROQ query layer.

| Module                             | Responsibilities                                                                                                                                           |
| ---------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `app/api/chat/route.ts`            | Streams the AI agent's response; resolves the caller's Clerk session and builds a `ToolLoopAgent` with a conditionally-populated tool registry.            |
| `app/api/webhooks/stripe/route.ts` | Verifies the Stripe signature, handles `checkout.session.completed`, creates the order, and decrements stock — idempotently.                               |
| `actions/checkout.ts`              | `createCheckoutSession` (cart re-validation against live price/stock + Stripe session creation), `getCheckoutSession` (ownership-checked order retrieval). |
| `actions/customer.ts`              | `getOrCreateStripeCustomer` — keeps Stripe and Sanity customer records in sync, avoiding duplicate Stripe customers for returning users.                   |
| `lib/ai/tools/search-products.ts`  | `searchProducts` AI tool — Zod-validated input, GROQ-backed search with category/material/color/price filtering and relevance scoring.                     |
| `lib/ai/tools/get-my-orders.ts`    | `getMyOrders` AI tool — Zod-validated optional status filter; only registered on the agent when a valid `userId` is present.                               |

**GROQ conventions used throughout:** parameterized filter expressions (`$categorySlug`, `$minPrice`, `$maxPrice`), dereferenced relations (`category->{...}`), free-text prefix matching (`match $searchQuery + "*"`), and weighted relevance scoring (`score(boost(...))`) for the AI search tool.

---

## ⚙️ State Management

Furniture Store deliberately keeps client state **narrow and scoped**, rather than reaching for one global store for everything:

- **Server state** (catalog, categories, orders, customers) lives in Sanity and is fetched fresh on every server render via `sanityFetch` — there is no client-side cache to invalidate.
- **Cart state** is a **Zustand** store created per-request inside a `CartStoreProvider` (a `useRef` factory wrapped in React Context), persisted to `localStorage` under `cart-storage` with `skipHydration` plus an explicit `rehydrate()` call to avoid SSR/client hydration mismatches.
- **Chat UI state** (sheet open/closed, a queued "pending message" from the "Ask AI for similar" button) is a separate, non-persisted Zustand store — intentionally decoupled from the AI conversation itself.
- **AI conversation state** (streaming status, message parts, tool-call lifecycle) is owned entirely by the Vercel AI SDK's `useChat` hook; the app composes on top of it rather than reimplementing message state.

This separation means a cart update never re-renders the chat panel, and clearing a conversation never touches the cart — each store has exactly one reason to change.

---

## 🧠 Business Logic Highlights

| Logic                                 | Implementation Detail                                                                                                                                                                                   |
| ------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Idempotent order fulfillment**      | The Stripe webhook queries Sanity for an existing order by `stripePaymentId` _before_ writing anything, short-circuiting on retried webhook deliveries.                                                 |
| **Atomic inventory decrement**        | Stock for every line item in an order is decremented inside a single `writeClient.transaction()...commit()`, preventing partial-stock-update races.                                                     |
| **Conditional AI capability scoping** | `createGetMyOrdersTool(userId)` returns `null` for guests, and the agent only adds `getMyOrders` to its tool map when the result isn't `null` — a structural guarantee, not a prompt-level instruction. |
| **Authoritative checkout re-pricing** | `createCheckoutSession` re-fetches every cart item from Sanity by ID and validates stock/price before building Stripe line items, rejecting stale or tampered cart state with a precise per-item error. |
| **Relevance-ranked search**           | `AI_SEARCH_PRODUCTS_QUERY` and the storefront's relevance sort both use GROQ's `score()`/`boost()` to weight name matches 3× over description matches.                                                  |
| **Contextual cross-sell prompting**   | `AskAISimilarButton` calls `openChatWithMessage()` to pre-load a prompt that instructs the agent to search the same category/material _and explicitly exclude_ the product currently being viewed.      |
| **Customer identity reconciliation**  | `getOrCreateStripeCustomer` checks Sanity by email first, then Stripe, before creating a new customer in either system — preventing duplicate Stripe customers for returning shoppers.                  |

---

## 🚀 Deployment Strategy

The codebase is structured as a single deployable Next.js application:

| Service                                               | Recommended Target                                                     | Why                                                                                                                                               |
| ----------------------------------------------------- | ---------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| Next.js app (storefront, API routes, embedded Studio) | **Vercel**                                                             | First-class App Router + Server Actions support, automatic edge deployment of `proxy.ts`, and built-in image optimization for Sanity-hosted media |
| Sanity Content Lake & Studio                          | **Sanity's managed infrastructure** (no separate deploy)               | The Studio is mounted inside the same Next.js app at `/studio`; the content lake itself is fully hosted by Sanity                                 |
| Stripe webhook endpoint                               | **Registered against the deployed Vercel URL** in the Stripe Dashboard | Must point at a publicly reachable HTTPS URL; the Stripe CLI is used to forward events during local development                                   |

---

## 🔧 Environment Setup

### `.env.local`

```env
# Sanity
NEXT_PUBLIC_SANITY_PROJECT_ID=your_sanity_project_id
NEXT_PUBLIC_SANITY_DATASET=production
NEXT_PUBLIC_SANITY_API_VERSION=2026-06-16
SANITY_API_WRITE_TOKEN=your_sanity_write_token   # used only in Server Actions & the webhook handler

# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key

# Stripe
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret

# Google Gemini (AI shopping agent)
GOOGLE_GENERATIVE_AI_API_KEY=your_gemini_api_key

# App
NEXT_PUBLIC_BASE_URL=http://localhost:3000   # optional locally; auto-resolved from VERCEL_URL on Vercel
```

> Keys prefixed `NEXT_PUBLIC_` are exposed to the browser by Next.js convention — never place secrets behind that prefix.

---

## 💻 Getting Started

### Prerequisites

- Node.js `>=20.x`
- npm
- A Sanity project (create one at [sanity.io](https://www.sanity.io/) or via `npx sanity init`)
- API keys for Clerk, Stripe, and Google Gemini

### Installation

```bash
# 1. Clone the repository
git clone <repository-url>
cd ai-ecommerce-furniture-store

# 2. Install dependencies
npm install

# 3. Configure environment variables
# create .env.local using the template above

# 4. Generate Sanity types (regenerates sanity.types.ts from the schema + queries)
npm run typegen

# 5. Run the development server
npm run dev   # App available at http://localhost:3000
```

### First-Run Setup (Sanity Studio)

1. Visit `http://localhost:3000/studio` and sign in with your Sanity account.
2. Create at least one **Category** document, then a few **Product** documents referencing it (a product requires a name, slug, price, category, and at least one image).
3. In the [Sanity dashboard](https://www.sanity.io/manage), generate an API token with write access and place it in `.env.local` as `SANITY_API_WRITE_TOKEN`.
4. In the Stripe Dashboard (or via the Stripe CLI for local development), register a webhook endpoint pointing at `/api/webhooks/stripe` and copy the signing secret into `STRIPE_WEBHOOK_SECRET`.

---

## 📜 Available Scripts

| Command           | Description                                                                       |
| ----------------- | --------------------------------------------------------------------------------- |
| `npm run dev`     | Start the Next.js development server                                              |
| `npm run build`   | Create an optimized production build                                              |
| `npm run start`   | Run the production build                                                          |
| `npm run lint`    | Run ESLint (Next.js core-web-vitals + TypeScript ruleset) across the codebase     |
| `npm run typegen` | Extract the Sanity schema and generate typed query results into `sanity.types.ts` |

---

## 📚 Learning Outcomes

Building Furniture Store involved hands-on, production-style experience with:

- Designing and constraining an **LLM tool-calling agent** for a real backend — writing tool schemas and system instructions precise enough to prevent malformed queries or repeated tool calls.
- Structurally scoping AI capabilities by authentication state, rather than relying on the model to follow a permission instruction.
- Working with the **Next.js App Router's** Server Component / Server Action model end-to-end, including the v16 `proxy.ts` middleware convention.
- Modeling a **headless commerce schema** in Sanity and generating type-safe query results directly from that schema.
- Implementing **idempotent, signature-verified webhook processing** for real payment infrastructure.
- Correctly scoping **client state in a server-rendered React architecture** to avoid cross-request/cross-user leakage in a Zustand store.

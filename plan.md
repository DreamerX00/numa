Great—let’s lock in a crisp, practical plan to get Razorpay integrated end-to-end and production-ready. We’ll move in small, verifiable steps with clear acceptance criteria.

## Razorpay Integration Plan (phased, actionable)

Phase 1 — Environment, SDK, and API basics

* Goal: Have a secure server-side order creation endpoint and signature-verified webhook ready.
* Steps:
  * Add env vars locally (and note staging/prod): RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET, RAZORPAY_WEBHOOK_SECRET.
  * Verify the existing endpoints:
    * POST /api/razorpay/order returns { id, amount, currency, key_id } for a given amount.
    * POST /api/razorpay/webhook verifies signature and returns 200 on valid signatures.
* Acceptance:
  * Calling the order endpoint with amount returns a valid Razorpay order_id.
  * Webhook route rejects missing/invalid signatures and accepts valid ones.

Phase 2 — Database persistence (Prisma)

* Goal: Persist orders and payments so the system is auditable and reliable.
* Steps:
  * Initialize Prisma (mongodb) if not yet:
    * schema: Order (userId?, amount, currency, status, razorpayOrderId, createdAt), Payment (orderId, razorpayPaymentId, status, capturedAt?).
  * Update /api/razorpay/order to:
    * Create DB Order record with status “CREATED”.
    * Store mapping order.id → razorpayOrderId.
* Acceptance:
  * Order document written on server order creation with correct totals and Razorpay order_id.

Phase 3 — Client Checkout integration

* Goal: Users can pay via Razorpay Checkout modal from your app.
* Steps:
  * Add a simple Checkout button (e.g., on a test page) that:
    * Calls /api/razorpay/order with the computed amount.
    * Loads Razorpay Checkout script.
    * Opens modal with key_id and order_id from server response.
    * Handles success/failure callbacks on client.
* Acceptance:
  * Checkout modal opens and returns success/failure in Razorpay test mode.

Phase 4 — Webhook processing and idempotency

* Goal: Webhook updates DB status and is safe to re-run.
* Steps:
  * In /api/razorpay/webhook:
    * Parse payment.captured/payment.failed events.
    * Locate Order by event.payload.payment.entity.order_id.
    * Upsert Payment with razorpayPaymentId; set Order status = PAID/FAILED.
    * Add idempotency guard (store processed event IDs).
* Acceptance:
  * Replaying the same webhook doesn’t duplicate or corrupt records.
  * Orders reflect final state, and payments are recorded accurately.

Phase 5 — Admin visibility

* Goal: Basic admin view to track orders and statuses.
* Steps:
  * Build minimal admin page listing orders (id, amount, status, createdAt) and a detail page (payments, notes).
* Acceptance:
  * Admin can see recent orders and their statuses.

Phase 6 — Tests and QA

* Goal: Confidence before staging and prod.
* Steps:
  * Unit tests: signature verification, amount conversions (paise), order math.
  * Integration tests: order endpoint returns valid shape; webhook signature path.
  * E2E: Simulate full flow (mock client open, call webhook with test payload).
* Acceptance:
  * Unit/integration tests pass locally and in CI.
  * E2E flow validates order status transitions.

Phase 7 — Staging and webhook wiring

* Goal: Realistic staging validation.
* Steps:
  * Deploy staging on Vercel, set env vars.
  * Configure Razorpay webhook to staging URL.
  * Run end-to-end test in test mode with small amounts.
* Acceptance:
  * Live test mode transaction transitions Order from CREATED → PAID via webhook.

Phase 8 — Production readiness

* Goal: Safe go-live with monitoring.
* Steps:
  * Add logging and error capture around payment flow (e.g., Sentry).
  * Ensure secrets are set in prod and not logged.
  * Update docs for runbooks: refunds, reconciliation, handling webhooks.
* Acceptance:
  * Production deploy checklists complete and verified.

## Commands you’ll use (PowerShell)

* Install SDK (done)
  * npm i razorpay
* Set env locally
  * Add to `.env`: RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET, RAZORPAY_WEBHOOK_SECRET
* Prisma init/generate (if not yet)
  * npx prisma init
  * npx prisma db push
  * npx prisma generate
* Run dev
  * npm run dev

## Acceptance checklist (for each phase)

* P1: Order endpoint works; webhook signature verify works.
* P2: Orders persist with razorpayOrderId; status CREATED.
* P3: Client opens Razorpay modal; returns success/failure.
* P4: Webhook updates Order and Payment correctly; idempotent.
* P5: Admin can list and view orders.
* P6: Tests pass locally and CI; coverage on core logic.
* P7: Staging webhook wired; test flow succeeds.
* P8: Monitoring and runbooks in place; prod secrets configured.

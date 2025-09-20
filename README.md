# Numa E-commerce (Next.js + Prisma + MongoDB + Firebase Auth)

A production-focused e-commerce stack for the Numa brand.

## Quickstart (Windows PowerShell)

1) Create project
```pwsh
npx create-next-app@latest numa --ts
cd numa
git init
git checkout -b develop
```

2) Install dependencies
```pwsh
npm i prisma @prisma/client mongodb
# Payments
npm i razorpay
# Auth
npm i firebase firebase-admin
# Tooling
npm i -D eslint prettier husky lint-staged jest @playwright/test
```

3) Configure Tailwind & shadcn
```pwsh
npx tailwindcss init -p
# Follow https://ui.shadcn.com/ for setup
```

4) Prisma + MongoDB Atlas
- Create a MongoDB Atlas cluster and a DB user.
- Copy the connection string into `.env`:
```
DATABASE_URL="mongodb+srv://<user>:<pass>@<cluster>/<db>?retryWrites=true&w=majority"
```
- Initialize Prisma and push schema:
```pwsh
npx prisma init
# in prisma/schema.prisma set provider = "mongodb"
npx prisma db push
npx prisma generate
```

5) Run the app
```pwsh
npm run dev
# open http://localhost:3000
```

## Scripts
- `npm run dev` — start dev server
- `npm run build` — build
- `npm run start` — start production server
- `npm run lint` — run ESLint
- `npm test` — run Jest

## Branching
- `main` — production (protected)
- `develop` — integration
- `feature/<name>` — feature branches

## CI/CD
- PRs to `develop` run lint, unit tests, and Playwright e2e.
- Pushes to `main` run checks and deploy via Vercel (if connected).

## Env Vars
- Copy `.env.example` to `.env` and fill values
- `DATABASE_URL` — MongoDB Atlas connection
- Razorpay:
	- `RAZORPAY_KEY_ID` — Public key ID for client-side initialization
	- `RAZORPAY_KEY_SECRET` — Secret key for server-side order creation
	- `RAZORPAY_WEBHOOK_SECRET` — Secret for verifying webhook signatures
- Firebase (Client SDK):
	- `NEXT_PUBLIC_FIREBASE_API_KEY`
	- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
	- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
	- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
	- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
	- `NEXT_PUBLIC_FIREBASE_APP_ID`
- Firebase (Admin SDK):
	- `FIREBASE_PROJECT_ID`
	- `FIREBASE_CLIENT_EMAIL`
	- `FIREBASE_PRIVATE_KEY` (replace newlines with \n in hosted envs)

## Firebase Authentication

We use Firebase Auth for user sessions with secure httpOnly cookies.

Endpoints:
- Login: `POST /api/auth/login`
	- Body: `{ idToken: string }` obtained after Firebase client login
	- Sets `__session` cookie (httpOnly, secure)
- Logout: `POST /api/auth/logout` — clears session cookie

Client flow (summary):
1) In your login page, use Firebase Client SDK (e.g., `signInWithEmailAndPassword`) to sign in.
2) Get the ID token: `const idToken = await auth.currentUser?.getIdToken()`.
3) `fetch('/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ idToken }) })`.
4) On success, subsequent requests include the session cookie.

Server protection:
- In route handlers or server components, call `getUserFromRequest(req)` from `src/lib/auth/session` to get the authenticated user (or `null`).
- Use this to protect admin routes and check roles.

## Razorpay Endpoints
- Create Order: `POST /api/razorpay/order`
	- Body: `{ amount: number, currency?: 'INR', receipt?: string, notes?: Record<string,string> }`
	- Response: `{ id, amount, currency, key_id }`
- Webhook: `POST /api/razorpay/webhook`
	- Set the webhook URL in Razorpay dashboard to this endpoint
	- Uses `x-razorpay-signature` header for verification

## Troubleshooting
- Prisma connection issues: verify IP allowlist in Atlas and `DATABASE_URL`.
- Playwright install on CI: include `npx playwright install --with-deps` if Linux runner.
- Windows PowerShell: use backticks for line continuations if needed.

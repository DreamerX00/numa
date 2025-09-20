import Image from "next/image";
import Link from "next/link";
import CheckoutButton from "../components/CheckoutButton";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <header className="relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.06] pointer-events-none bg-[radial-gradient(circle_at_30%_40%,var(--brand)_0%,transparent_70%)]" />
        <div className="mx-auto w-full max-w-7xl px-5 pt-20 pb-24 md:pt-28 md:pb-32">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-12">
            <div className="flex-1 max-w-2xl">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-white/70 dark:bg-white/10 px-4 py-1 text-xs font-medium shadow-sm ring-1 ring-black/5 dark:ring-white/10 backdrop-blur">
                <span className="inline-block w-2 h-2 rounded-full bg-[var(--brand)] animate-pulse" />
                Razorpay Integration Plan • Phase 1 Active
              </div>
              <h1 className="text-4xl/tight md:text-5xl/tight font-semibold tracking-tight text-balance">
                Production‑Ready <span className="text-[var(--brand)]">Razorpay</span> Payments for Modern Commerce
              </h1>
              <p className="mt-6 text-base md:text-lg text-neutral-700 dark:text-neutral-300 max-w-xl leading-relaxed">
                Secure server‑side order creation, verified webhooks, and a future‑proof architecture. Start testing the live checkout flow now and iterate toward full e‑commerce readiness.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-4">
                <CheckoutButton amount={199} label="Test Live Checkout (₹199)" />
                <Link href="#features" className="focus-ring inline-flex items-center justify-center rounded-md px-6 py-3 text-sm md:text-base font-medium bg-neutral-900 text-white hover:bg-neutral-800 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-white transition-colors shadow-sm">
                  Explore Features
                </Link>
              </div>
              <p className="mt-4 text-xs text-neutral-500 dark:text-neutral-500">
                Uses Razorpay test mode • No real charges • Amount selectable in future phase
              </p>
            </div>
            <div className="flex-1 w-full flex justify-center md:justify-end">
              <div className="relative w-full max-w-sm aspect-[4/5] rounded-xl border border-neutral-200 dark:border-neutral-800 shadow-md bg-white dark:bg-neutral-900 p-6 flex flex-col justify-between">
                <div>
                  <Image src="/NUMALOGO.jpg" alt="Numa Logo" width={200} height={60} className="w-40 mb-6" />
                  <h2 className="text-lg font-semibold mb-2">Checkout Preview</h2>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                    Instantly create an order server‑side and open the Razorpay modal with a single secure call.
                  </p>
                </div>
                <div className="mt-6">
                  <CheckoutButton amount={199} label="Pay ₹199" className="w-full" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Features */}
      <section id="features" className="py-20 md:py-28 bg-gradient-to-b from-transparent to-white/60 dark:to-neutral-950/40">
        <div className="mx-auto max-w-7xl px-5">
          <div className="max-w-2xl mb-14">
            <h2 className="text-3xl md:text-4xl font-semibold tracking-tight">Designed for Reliability & Growth</h2>
            <p className="mt-4 text-neutral-700 dark:text-neutral-300 leading-relaxed">
              Each phase builds a verifiable foundation—secure payments first, then persistence, idempotent webhooks, and operational visibility.
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                title: "Secure Order Creation",
                desc: "Server‑side signed orders prevent tampering and keep secrets safe.",
              },
              {
                title: "Webhook Integrity",
                desc: "Signature verification & idempotency guards ensure consistent payment state.",
              },
              {
                title: "Planned Persistence",
                desc: "Upcoming Prisma models for full auditability of orders & payments.",
              },
              {
                title: "Progressive Phases",
                desc: "A roadmap that reduces risk while delivering incremental value.",
              },
              {
                title: "Extensible Architecture",
                desc: "Clean separation: auth, payment flow, data, and admin visibility.",
              },
              {
                title: "Future Monitoring",
                desc: "Structured logging & runbooks targeted for production readiness.",
              },
            ].map((f) => (
              <div
                key={f.title}
                className="group relative rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white/80 dark:bg-neutral-900/60 p-6 shadow-sm hover:shadow-md transition-shadow overflow-hidden"
              >
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-[radial-gradient(circle_at_top_left,var(--brand)/15%,transparent_70%)]" />
                <h3 className="relative z-10 font-semibold mb-2 text-neutral-900 dark:text-neutral-100">{f.title}</h3>
                <p className="relative z-10 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 md:py-28">
        <div className="mx-auto max-w-5xl px-5">
          <div className="rounded-2xl p-[1px] bg-gradient-to-br from-[var(--brand)] via-[var(--brand-accent)] to-[var(--brand-dark)]">
            <div className="rounded-2xl bg-white dark:bg-neutral-950 px-8 py-14 md:px-14 md:py-16 flex flex-col md:flex-row gap-10 items-start md:items-center justify-between">
              <div className="max-w-xl">
                <h2 className="text-2xl md:text-3xl font-semibold tracking-tight mb-4">Start Testing the Flow</h2>
                <p className="text-sm md:text-base text-neutral-600 dark:text-neutral-400 leading-relaxed">
                  Trigger a real Razorpay test order and experience the modal. Next steps: persistence, admin views, and reconciliation tooling.
                </p>
              </div>
              <CheckoutButton amount={199} label="Run Test Payment" />
            </div>
          </div>
        </div>
      </section>

      <footer className="mt-auto border-t border-neutral-200 dark:border-neutral-800 bg-white/70 dark:bg-neutral-950/40 backdrop-blur py-8 text-sm">
        <div className="mx-auto max-w-7xl px-5 flex flex-col md:flex-row gap-4 items-center justify-between">
          <p className="text-neutral-500 dark:text-neutral-500">© {new Date().getFullYear()} Numa Payments Demo</p>
          <p className="text-neutral-500 dark:text-neutral-500">Phase 1 • Live Checkout Enabled</p>
        </div>
      </footer>
    </div>
  );
}

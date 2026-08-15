"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

export function HomeClient() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    country: "DK",
  });
  const [status, setStatus] = useState<string | null>(null);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotStatus, setForgotStatus] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleAuth(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setStatus(null);

    const endpoint = mode === "login" ? "/api/auth/login" : "/api/auth/register";
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(mode === "login" ? { email: form.email, password: form.password } : form),
    });

    const data = await response.json();
    setPending(false);

    if (!response.ok) {
      setStatus(data.error ?? "The request could not be completed.");
      return;
    }

    if (mode === "register") {
      setStatus(data.message ?? "Account created. Please verify your email.");
      setMode("login");
      setForm((value) => ({ ...value, password: "" }));
      return;
    }

    router.push("/dashboard");
  }

  async function handleForgotPassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setForgotStatus(null);
    const response = await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: forgotEmail }),
    });
    const data = await response.json();
    setForgotStatus(data.message ?? "Check your inbox for the reset link.");
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_#f7f2ea,_#f5f7fb_55%,_#eef2ff)] p-6 text-slate-900">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
        <section className="max-w-2xl rounded-3xl border border-slate-200 bg-white/80 p-8 shadow-[0_20px_80px_rgba(15,23,42,0.08)] backdrop-blur">
          <span className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-sm font-medium text-slate-600">
            Plan Human
          </span>
          <h1 className="mt-5 text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl">
            A calm, human-first space for personal wealth planning.
          </h1>
          <p className="mt-4 max-w-xl text-lg leading-8 text-slate-600">
            Track your assets, debts, income, goals, and cashflow in one calm dashboard built for everyday people rather than finance professionals.
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {[
              ["One page", "A single dashboard with your key wealth numbers at a glance."],
              ["Secure", "Each user keeps their own wealth record with email verification."],
              ["Free to use", "but donate to support this project and feel good projects."],
            ].map(([title, description]) => (
              <div key={title} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <h2 className="text-sm font-semibold text-slate-900">{title}</h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 space-y-5 rounded-2xl border border-slate-200 bg-slate-50 p-6">
            <div>
              <h2 className="text-base font-semibold text-slate-900">How Your Data Is Handled</h2>
              <p className="mt-2 text-sm leading-7 text-slate-600">
                Your data is securely hosted, and it belongs entirely to you. We do not sell, rent, or share your personal or financial information.
              </p>
              <p className="mt-3 text-sm leading-7 text-slate-600">
                In fact, we don&apos;t even need your real name&mdash;you are welcome to sign up using an alias and any of your email addresses.
              </p>
              <p className="mt-3 text-sm leading-7 text-slate-600">
                If you ever decide to leave, clicking &quot;Delete&quot; permanently removes all your data instantly. We also preserve the right to delete your data to protect your and other users data.
              </p>
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-900">The People Behind the Project</h2>
              <p className="mt-2 text-sm leading-7 text-slate-600">
                Many financial advisors push you toward expensive platforms, and similar tools often operate for profit or monetize your private information.
              </p>
              <p className="mt-3 text-sm leading-7 text-slate-600">We do things differently.</p>
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-900">Our Mission Is Simple</h2>
              <p className="mt-2 text-sm leading-7 text-slate-600">
                We want to give everyone access to free, straightforward tools to create a wealth plan and take control of their financial future.
              </p>
              <p className="mt-3 text-sm leading-7 text-slate-600">
                To keep this service free while protecting your privacy, we offer two simple options:
              </p>
              <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-600">
                <li><span className="font-medium text-slate-800">Free Plan:</span> Supported by discreet advertisements.</li>
                <li><span className="font-medium text-slate-800">Ad-Free Plan:</span> Donate via &quot;Buy Me a Coffee&quot; once a year to turn off all ads.</li>
              </ul>
              <p className="mt-3 text-sm leading-7 text-slate-600">
                Every donation goes directly toward hosting, security, and developing cool new features.
              </p>
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-900">Have a great idea for the app?</h2>
              <p className="mt-2 text-sm leading-7 text-slate-600">
                If you&apos;ve supported us with a coffee, we&apos;d love to hear your thoughts! Drop us an email anytime at{" "}
                <a href="mailto:people@planhuman.com" className="font-medium text-slate-900 underline">
                  people@planhuman.com
                </a>
                .
              </p>
            </div>
          </div>
        </section>

        <section className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-8 shadow-[0_20px_80px_rgba(15,23,42,0.08)]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-500">Access</p>
              <h2 className="text-2xl font-semibold text-slate-900">{mode === "login" ? "Sign in" : "Create account"}</h2>
            </div>
            <div className="rounded-full border border-slate-200 bg-slate-50 p-1">
              <button
                className={`rounded-full px-3 py-1.5 text-sm font-medium ${mode === "login" ? "bg-slate-900 text-white" : "text-slate-600"}`}
                type="button"
                onClick={() => setMode("login")}
              >
                Login
              </button>
              <button
                className={`rounded-full px-3 py-1.5 text-sm font-medium ${mode === "register" ? "bg-slate-900 text-white" : "text-slate-600"}`}
                type="button"
                onClick={() => setMode("register")}
              >
                Register
              </button>
            </div>
          </div>

          <form className="mt-6 space-y-4" onSubmit={handleAuth}>
            {mode === "register" && (
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="name">
                  Name
                </label>
                <input
                  id="name"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none ring-0"
                  value={form.name}
                  onChange={(event) => setForm((value) => ({ ...value, name: event.target.value }))}
                  placeholder="Your name"
                />
              </div>
            )}

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="email">
                Email address
              </label>
              <input
                id="email"
                type="email"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none ring-0"
                value={form.email}
                onChange={(event) => setForm((value) => ({ ...value, email: event.target.value }))}
                placeholder="you@example.com"
                required
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="password">
                Password
              </label>
              <input
                id="password"
                type="password"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none ring-0"
                value={form.password}
                onChange={(event) => setForm((value) => ({ ...value, password: event.target.value }))}
                placeholder="At least 8 characters"
                required
              />
            </div>

            {mode === "register" && (
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="country">
                  Country
                </label>
                <select
                  id="country"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none ring-0"
                  value={form.country}
                  onChange={(event) => setForm((value) => ({ ...value, country: event.target.value }))}
                >
                  <option value="DK">Denmark</option>
                  <option value="SE">Sweden</option>
                  <option value="NO">Norway</option>
                  <option value="FI">Finland</option>
                  <option value="UK">United Kingdom</option>
                </select>
              </div>
            )}

            {status && <p className="rounded-2xl bg-slate-100 px-4 py-3 text-sm text-slate-700">{status}</p>}

            <button className="w-full rounded-2xl bg-slate-900 px-4 py-3 font-semibold text-white transition hover:bg-slate-800" type="submit" disabled={pending}>
              {pending ? "Working..." : mode === "login" ? "Sign in" : "Create account"}
            </button>
          </form>

          <form className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4" onSubmit={handleForgotPassword}>
            <p className="text-sm font-semibold text-slate-900">Need a reminder?</p>
            <p className="mt-1 text-sm text-slate-600">We can email you a password reset link.</p>
            <div className="mt-3 flex flex-col gap-3 sm:flex-row">
              <input
                className="flex-1 rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none"
                value={forgotEmail}
                onChange={(event) => setForgotEmail(event.target.value)}
                placeholder="Email address"
                type="email"
              />
              <button className="rounded-2xl border border-slate-300 px-4 py-3 font-medium text-slate-700" type="submit">
                Send link
              </button>
            </div>
            {forgotStatus && <p className="mt-3 text-sm text-slate-700">{forgotStatus}</p>}
          </form>
        </section>
      </div>
    </main>
  );
}

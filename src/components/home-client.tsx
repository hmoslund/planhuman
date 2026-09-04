"use client";

import { useRouter } from "next/navigation";
import Script from "next/script";
import { FormEvent, useEffect, useState } from "react";

declare global {
  interface Window {
    onTurnstileVerified?: (token: string) => void;
  }
}

type Props = {
  formToken: string;
  turnstileSiteKey: string | null;
};

export function HomeClient({ formToken, turnstileSiteKey }: Props) {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "register">("login");

  const [loginForm, setLoginForm] = useState({ identifier: "", password: "" });
  const [registerForm, setRegisterForm] = useState({ alias: "", password: "", country: "DK" });
  const [honeypot, setHoneypot] = useState("");
  const [turnstileToken, setTurnstileToken] = useState("");

  const [status, setStatus] = useState<string | null>(null);
  const [aliasSuggestions, setAliasSuggestions] = useState<string[]>([]);
  const [pending, setPending] = useState(false);

  const [recoveryReveal, setRecoveryReveal] = useState<string | null>(null);
  const [recoverySaved, setRecoverySaved] = useState(false);

  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotStatus, setForgotStatus] = useState<string | null>(null);

  const [recoveryResetForm, setRecoveryResetForm] = useState({ alias: "", recoveryCode: "", password: "" });
  const [recoveryResetStatus, setRecoveryResetStatus] = useState<string | null>(null);
  const [recoveryResetReveal, setRecoveryResetReveal] = useState<string | null>(null);

  useEffect(() => {
    window.onTurnstileVerified = (token: string) => setTurnstileToken(token);
    return () => {
      delete window.onTurnstileVerified;
    };
  }, []);

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setStatus(null);

    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(loginForm),
    });

    const data = await response.json();
    setPending(false);

    if (!response.ok) {
      setStatus(data.error ?? "The request could not be completed.");
      return;
    }

    router.push("/dashboard");
  }

  async function handleRegister(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setStatus(null);
    setAliasSuggestions([]);

    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...registerForm, formToken, turnstileToken, website: honeypot }),
    });

    const data = await response.json();
    setPending(false);

    if (!response.ok) {
      setStatus(data.error ?? "The request could not be completed.");
      setAliasSuggestions(data.suggestions ?? []);
      return;
    }

    setRecoveryReveal(data.recoveryCode);
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

  async function handleRecoveryReset(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setRecoveryResetStatus(null);
    setRecoveryResetReveal(null);

    const response = await fetch("/api/auth/recovery-reset", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(recoveryResetForm),
    });
    const data = await response.json();

    if (!response.ok) {
      setRecoveryResetStatus(data.error ?? "The request could not be completed.");
      return;
    }

    setRecoveryResetStatus(data.message ?? "Password updated.");
    setRecoveryResetReveal(data.recoveryCode);
    setRecoveryResetForm({ alias: "", recoveryCode: "", password: "" });
  }

  async function copyToClipboard(value: string) {
    try {
      await navigator.clipboard.writeText(value);
    } catch {
      // Clipboard access can fail (permissions, insecure context) — the code is still on screen to copy by hand.
    }
  }

  if (recoveryReveal) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,_#f7f2ea,_#f5f7fb_55%,_#eef2ff)] p-6 text-slate-900">
        <div className="w-full max-w-lg rounded-3xl border border-amber-200 bg-white p-8 shadow-[0_20px_80px_rgba(15,23,42,0.08)]">
          <span className="inline-flex rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-sm font-medium text-amber-800">
            Save this now
          </span>
          <h1 className="mt-4 text-2xl font-semibold text-slate-900">Your recovery code</h1>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Your account is anonymous — we don&apos;t have an email for you. This code is the <strong>only</strong> way
            to reset your password if you forget it. We cannot show it to you again, and we cannot recover your
            account without it.
          </p>
          <div className="mt-6 flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
            <code className="break-all text-lg font-semibold tracking-wide text-slate-900">{recoveryReveal}</code>
            <button
              type="button"
              onClick={() => copyToClipboard(recoveryReveal)}
              className="shrink-0 rounded-full border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-100"
            >
              Copy
            </button>
          </div>
          <label className="mt-6 flex items-start gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={recoverySaved}
              onChange={(event) => setRecoverySaved(event.target.checked)}
              className="mt-1"
            />
            I have saved this recovery code somewhere safe.
          </label>
          <button
            type="button"
            disabled={!recoverySaved}
            onClick={() => router.push("/dashboard")}
            className="mt-6 w-full rounded-2xl bg-slate-900 px-4 py-3 font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Continue to dashboard
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_#f7f2ea,_#f5f7fb_55%,_#eef2ff)] p-6 text-slate-900">
      {turnstileSiteKey && <Script src="https://challenges.cloudflare.com/turnstile/v0/api.js" strategy="afterInteractive" async defer />}
      <div className="mx-auto flex max-w-6xl flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
        <section className="max-w-2xl rounded-3xl border border-slate-200 bg-white/80 p-8 shadow-[0_20px_80px_rgba(15,23,42,0.08)] backdrop-blur">
          <img
            src="/phlogo.png"
            alt="PlanHumans"
            className="mb-4 h-20 w-auto max-w-[240px] rounded-xl object-contain"
          />
          <span className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-sm font-medium text-slate-600">
            PlanHumans
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
              ["Secure", "Each user keeps their own private wealth record — no one else can see it."],
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
                New accounts are anonymous by design — we don&apos;t ask for your name or email, just an alias and a
                password. Because there&apos;s no email on file, a one-time recovery code shown right after signup is
                the only way back into your account if you forget your password, so save it somewhere safe.
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
                onClick={() => {
                  setMode("login");
                  setStatus(null);
                  setAliasSuggestions([]);
                }}
              >
                Login
              </button>
              <button
                className={`rounded-full px-3 py-1.5 text-sm font-medium ${mode === "register" ? "bg-slate-900 text-white" : "text-slate-600"}`}
                type="button"
                onClick={() => {
                  setMode("register");
                  setStatus(null);
                  setAliasSuggestions([]);
                }}
              >
                Register
              </button>
            </div>
          </div>

          {mode === "login" ? (
            <form className="mt-6 space-y-4" onSubmit={handleLogin}>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="identifier">
                  Alias or email
                </label>
                <input
                  id="identifier"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none ring-0"
                  value={loginForm.identifier}
                  onChange={(event) => setLoginForm((value) => ({ ...value, identifier: event.target.value }))}
                  placeholder="your-alias or you@example.com"
                  required
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="login-password">
                  Password
                </label>
                <input
                  id="login-password"
                  type="password"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none ring-0"
                  value={loginForm.password}
                  onChange={(event) => setLoginForm((value) => ({ ...value, password: event.target.value }))}
                  placeholder="Your password"
                  required
                />
              </div>

              {status && <p className="rounded-2xl bg-slate-100 px-4 py-3 text-sm text-slate-700">{status}</p>}

              <button className="w-full rounded-2xl bg-slate-900 px-4 py-3 font-semibold text-white transition hover:bg-slate-800" type="submit" disabled={pending}>
                {pending ? "Working..." : "Sign in"}
              </button>
            </form>
          ) : (
            <form className="mt-6 space-y-4" onSubmit={handleRegister}>
              <p className="text-sm leading-6 text-slate-600">
                This account is anonymous by design — pick an alias and a password. No email required.
              </p>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="alias">
                  Alias
                </label>
                <input
                  id="alias"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none ring-0"
                  value={registerForm.alias}
                  onChange={(event) => setRegisterForm((value) => ({ ...value, alias: event.target.value }))}
                  placeholder="e.g. quiet-otter"
                  required
                />
                <p className="mt-1 text-xs text-slate-500">
                  Lowercase letters, numbers, - or _ only — not an email address, so no @ or dots.
                </p>
                {aliasSuggestions.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {aliasSuggestions.map((suggestion) => (
                      <button
                        key={suggestion}
                        type="button"
                        onClick={() => setRegisterForm((value) => ({ ...value, alias: suggestion }))}
                        className="rounded-full border border-slate-300 px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-100"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="register-password">
                  Password
                </label>
                <input
                  id="register-password"
                  type="password"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none ring-0"
                  value={registerForm.password}
                  onChange={(event) => setRegisterForm((value) => ({ ...value, password: event.target.value }))}
                  placeholder="At least 8 characters"
                  required
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="country">
                  Country
                </label>
                <select
                  id="country"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none ring-0"
                  value={registerForm.country}
                  onChange={(event) => setRegisterForm((value) => ({ ...value, country: event.target.value }))}
                >
                  <option value="DK">Denmark</option>
                  <option value="SE">Sweden</option>
                  <option value="NO">Norway</option>
                  <option value="FI">Finland</option>
                  <option value="UK">United Kingdom</option>
                </select>
              </div>

              <input
                type="text"
                name="companyWebsite"
                value={honeypot}
                onChange={(event) => setHoneypot(event.target.value)}
                className="hidden"
                tabIndex={-1}
                autoComplete="off"
                aria-hidden="true"
              />

              {turnstileSiteKey && <div className="cf-turnstile" data-sitekey={turnstileSiteKey} data-callback="onTurnstileVerified" />}

              {status && <p className="rounded-2xl bg-slate-100 px-4 py-3 text-sm text-slate-700">{status}</p>}

              <button
                className="w-full rounded-2xl bg-slate-900 px-4 py-3 font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                type="submit"
                disabled={pending || (Boolean(turnstileSiteKey) && !turnstileToken)}
              >
                {pending ? "Working..." : "Create account"}
              </button>
            </form>
          )}

          <form className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4" onSubmit={handleForgotPassword}>
            <p className="text-sm font-semibold text-slate-900">Signed up with an email?</p>
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

          <form className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4" onSubmit={handleRecoveryReset}>
            <p className="text-sm font-semibold text-slate-900">Signed up with an alias?</p>
            <p className="mt-1 text-sm text-slate-600">
              Reset your password with the alias and recovery code from signup. This issues a new recovery code — save it, it replaces the old one.
            </p>
            <div className="mt-3 space-y-3">
              <input
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none"
                value={recoveryResetForm.alias}
                onChange={(event) => setRecoveryResetForm((value) => ({ ...value, alias: event.target.value }))}
                placeholder="Alias"
              />
              <input
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none"
                value={recoveryResetForm.recoveryCode}
                onChange={(event) => setRecoveryResetForm((value) => ({ ...value, recoveryCode: event.target.value }))}
                placeholder="Recovery code"
              />
              <input
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none"
                value={recoveryResetForm.password}
                onChange={(event) => setRecoveryResetForm((value) => ({ ...value, password: event.target.value }))}
                placeholder="New password"
                type="password"
              />
              <button className="w-full rounded-2xl border border-slate-300 px-4 py-3 font-medium text-slate-700" type="submit">
                Reset password
              </button>
            </div>
            {recoveryResetStatus && <p className="mt-3 text-sm text-slate-700">{recoveryResetStatus}</p>}
            {recoveryResetReveal && (
              <div className="mt-3 flex items-center justify-between gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3">
                <code className="break-all text-sm font-semibold tracking-wide text-slate-900">{recoveryResetReveal}</code>
                <button
                  type="button"
                  onClick={() => copyToClipboard(recoveryResetReveal)}
                  className="shrink-0 rounded-full border border-amber-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-amber-100"
                >
                  Copy
                </button>
              </div>
            )}
          </form>

          <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-4">
            <p className="text-sm font-semibold text-slate-900">Support the project</p>
            <p className="mt-1 text-sm leading-6 text-slate-600">
              PlanHumans is free to use. If you find it useful, consider buying us a coffee to support development.
            </p>
            <a
              href="https://buymeacoffee.com/planhumans"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 flex items-center gap-3 rounded-2xl border border-amber-200 bg-white px-4 py-3 shadow-sm"
            >
              <img
                src="/qrcode.png"
                alt="Buy us a coffee QR code"
                className="h-24 w-auto rounded-lg object-contain"
              />
              <span className="text-sm font-medium text-slate-800 underline">buymeacoffee.com/planhumans</span>
            </a>
          </div>
        </section>
      </div>
    </main>
  );
}

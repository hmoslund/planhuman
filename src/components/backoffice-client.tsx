"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { COUNTRY_CODES, CURRENCIES } from "@/lib/wealth";
import { isPremiumUser } from "@/lib/premium";

const MAX_LOGO_BYTES = 500 * 1024;

type SponsorDraft = { link: string; text: string; logoData: string | null };
const EMPTY_SPONSOR_DRAFT: SponsorDraft = { link: "", text: "", logoData: null };

type CountryFactsDraft = {
  inflationRate: string;
  pensionYieldPct: string;
  pensionAge: string;
  pensionTypeNames: string;
  factoids: string;
  housingMarketOutlook: string;
};
const EMPTY_COUNTRY_FACTS_DRAFT: CountryFactsDraft = {
  inflationRate: "",
  pensionYieldPct: "",
  pensionAge: "",
  pensionTypeNames: "",
  factoids: "",
  housingMarketOutlook: "",
};
type CountryFactsRow = {
  country: string;
  inflationRate: number | null;
  pensionYieldPct: number | null;
  pensionAge: number | null;
  pensionTypeNames: string | null;
  factoids: string | null;
  housingMarketOutlook: string | null;
  asOf: string | null;
  updatedBy: string | null;
  updatedAt: string | null;
};

type UserRow = {
  id: string;
  name: string | null;
  alias: string | null;
  country: string;
  emailVerified: boolean;
  userNumber: number | null;
  createdAt: string;
  isProtected: boolean;
  userType: string;
  donated: boolean;
  type: string | null;
  becameUserDate: string | null;
  rowCount: number;
};

function formatDate(value: string) {
  return new Date(value).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

// Renders as plain YYYY-MM-DD (not localized) since this also doubles as the value
// fed into the <input type="date"> below.
function formatBecameUserDate(value: string | null) {
  return value ? value.slice(0, 10) : "";
}

const MAX_ROWS = 400;

function currencyFor(country: string) {
  if (country === "UK") return "£";
  if (country === "US") return "$";
  if (country === "FI") return "€";
  if (country === "SE") return "kr";
  if (country === "NO") return "kr";
  return "DKR ";
}

export function BackofficeClient() {
  const router = useRouter();
  const [users, setUsers] = useState<UserRow[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [sponsorDrafts, setSponsorDrafts] = useState<Record<string, SponsorDraft>>({});
  const [sponsorMessage, setSponsorMessage] = useState<string | null>(null);
  const [savingSponsor, setSavingSponsor] = useState<string | null>(null);
  const [becameUserDrafts, setBecameUserDrafts] = useState<Record<string, string>>({});
  const [savingBecameUserDate, setSavingBecameUserDate] = useState<string | null>(null);
  const [countryFactsRows, setCountryFactsRows] = useState<Record<string, CountryFactsRow>>({});
  const [countryFactsDrafts, setCountryFactsDrafts] = useState<Record<string, CountryFactsDraft>>({});
  const [countryFactsMessage, setCountryFactsMessage] = useState<string | null>(null);
  const [savingCountryFacts, setSavingCountryFacts] = useState<string | null>(null);

  async function loadSponsors() {
    const response = await fetch("/api/backoffice/sponsors");
    if (!response.ok) return;
    const data = await response.json();
    const existing: Array<{ currency: string; link: string; text: string | null; logoData: string | null }> = data.sponsors ?? [];
    const drafts: Record<string, SponsorDraft> = {};
    for (const currency of CURRENCIES) {
      const match = existing.find((s) => s.currency === currency);
      drafts[currency] = match ? { link: match.link, text: match.text ?? "", logoData: match.logoData } : { ...EMPTY_SPONSOR_DRAFT };
    }
    setSponsorDrafts(drafts);
  }

  useEffect(() => {
    loadSponsors();
  }, []);

  async function loadCountryFacts() {
    const response = await fetch("/api/backoffice/country-facts");
    if (!response.ok) return;
    const data = await response.json();
    const rows: CountryFactsRow[] = data.countryFacts ?? [];
    const byCountry: Record<string, CountryFactsRow> = {};
    const drafts: Record<string, CountryFactsDraft> = {};
    for (const row of rows) {
      byCountry[row.country] = row;
      drafts[row.country] = {
        inflationRate: row.inflationRate != null ? String(row.inflationRate) : "",
        pensionYieldPct: row.pensionYieldPct != null ? String(row.pensionYieldPct) : "",
        pensionAge: row.pensionAge != null ? String(row.pensionAge) : "",
        pensionTypeNames: row.pensionTypeNames ?? "",
        factoids: row.factoids ?? "",
        housingMarketOutlook: row.housingMarketOutlook ?? "",
      };
    }
    setCountryFactsRows(byCountry);
    setCountryFactsDrafts(drafts);
  }

  useEffect(() => {
    loadCountryFacts();
  }, []);

  function updateCountryFactsDraft(country: string, patch: Partial<CountryFactsDraft>) {
    setCountryFactsDrafts((prev) => ({ ...prev, [country]: { ...(prev[country] ?? EMPTY_COUNTRY_FACTS_DRAFT), ...patch } }));
  }

  async function saveCountryFacts(country: string) {
    const draft = countryFactsDrafts[country] ?? EMPTY_COUNTRY_FACTS_DRAFT;
    setSavingCountryFacts(country);
    const response = await fetch("/api/backoffice/country-facts", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        country,
        inflationRate: draft.inflationRate.trim() ? Number(draft.inflationRate) : null,
        pensionYieldPct: draft.pensionYieldPct.trim() ? Number(draft.pensionYieldPct) : null,
        pensionAge: draft.pensionAge.trim() ? Number(draft.pensionAge) : null,
        pensionTypeNames: draft.pensionTypeNames,
        factoids: draft.factoids,
        housingMarketOutlook: draft.housingMarketOutlook,
      }),
    });
    const data = await response.json();
    setCountryFactsMessage(data.message ?? data.error ?? "Action complete.");
    setSavingCountryFacts(null);
    if (response.ok) await loadCountryFacts();
  }

  function updateSponsorDraft(currency: string, patch: Partial<SponsorDraft>) {
    setSponsorDrafts((prev) => ({ ...prev, [currency]: { ...(prev[currency] ?? EMPTY_SPONSOR_DRAFT), ...patch } }));
  }

  function handleLogoChange(currency: string, file: File | null) {
    if (!file) return;
    if (file.size > MAX_LOGO_BYTES) {
      setSponsorMessage(`Logo for ${currency} is too large (max 500KB).`);
      return;
    }
    const reader = new FileReader();
    reader.onload = () => updateSponsorDraft(currency, { logoData: String(reader.result) });
    reader.readAsDataURL(file);
  }

  async function saveSponsor(currency: string) {
    const draft = sponsorDrafts[currency] ?? EMPTY_SPONSOR_DRAFT;
    if (!draft.link.trim()) {
      setSponsorMessage("Add a sponsor link before saving.");
      return;
    }

    setSavingSponsor(currency);
    const response = await fetch("/api/backoffice/sponsors", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currency, link: draft.link, text: draft.text, logoData: draft.logoData }),
    });
    const data = await response.json();
    setSponsorMessage(data.message ?? data.error ?? "Action complete.");
    setSavingSponsor(null);
  }

  async function removeSponsor(currency: string) {
    if (!window.confirm(`Remove the sponsor for ${currency}?`)) return;
    const response = await fetch(`/api/backoffice/sponsors?currency=${currency}`, { method: "DELETE" });
    const data = await response.json();
    setSponsorMessage(data.message ?? data.error ?? "Action complete.");
    setSponsorDrafts((prev) => ({ ...prev, [currency]: { ...EMPTY_SPONSOR_DRAFT } }));
  }

  async function loadUsers() {
    const response = await fetch("/api/backoffice");
    if (response.status === 403) {
      router.replace("/dashboard");
      return;
    }

    const data = await response.json();
    setUsers(data.users ?? []);
  }

  useEffect(() => {
    loadUsers();
  }, [router]);

  async function toggleDonated(userId: string, current: boolean) {
    const response = await fetch(`/api/backoffice?userId=${userId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ donated: !current }),
    });
    const data = await response.json();
    setMessage(data.message ?? data.error ?? "Action complete.");
    await loadUsers();
  }

  function becameUserDraft(user: UserRow) {
    return becameUserDrafts[user.id] ?? formatBecameUserDate(user.becameUserDate);
  }

  async function saveBecameUserDate(userId: string) {
    const draft = becameUserDrafts[userId] ?? formatBecameUserDate(users.find((u) => u.id === userId)?.becameUserDate ?? null);
    setSavingBecameUserDate(userId);
    try {
      const response = await fetch("/api/backoffice/became-user-date", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, becameUserDate: draft || null }),
      });
      const data = await response.json();
      setMessage(data.message ?? data.error ?? "Action complete.");
      if (response.ok) {
        setBecameUserDrafts((prev) => {
          const next = { ...prev };
          delete next[userId];
          return next;
        });
        await loadUsers();
      }
    } finally {
      setSavingBecameUserDate(null);
    }
  }

  async function deleteUser(userId: string) {
    if (!window.confirm("Delete this user and all of their data? This cannot be undone.")) return;
    const response = await fetch(`/api/backoffice?userId=${userId}`, { method: "DELETE" });
    const data = await response.json();
    setMessage(data.message ?? data.error ?? "Action complete.");
    await loadUsers();
  }

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-6 text-slate-900 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.25em] text-slate-500">Back office</p>
            <h1 className="mt-2 text-3xl font-semibold text-slate-900">Manage users</h1>
            <p className="mt-2 text-sm text-slate-600">
              Donations from BuyMeACoffee are marked automatically via webhook; you can also toggle a donation manually.
            </p>
          </div>
          <button className="rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700" onClick={() => router.push("/dashboard")}>
            Return to dashboard
          </button>
        </div>

        {message && <p className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">{message}</p>}

        <div className="mt-6 overflow-x-auto rounded-2xl border border-slate-200">
          <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
            <thead className="bg-slate-50 text-slate-700">
              <tr>
                <th className="px-4 py-3 font-semibold">User #</th>
                <th className="px-4 py-3 font-semibold">Name</th>
                <th className="px-4 py-3 font-semibold">Alias</th>
                <th className="px-4 py-3 font-semibold">Created</th>
                <th className="px-4 py-3 font-semibold">Became user</th>
                <th className="px-4 py-3 font-semibold">Type</th>
                <th className="px-4 py-3 font-semibold">Donated</th>
                <th className="px-4 py-3 font-semibold">Premium</th>
                <th className="px-4 py-3 font-semibold">Rows</th>
                <th className="px-4 py-3 font-semibold">Verified</th>
                <th className="px-4 py-3 font-semibold">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {users.map((user) => (
                <tr key={user.id} className={user.isProtected ? "bg-sky-50/60" : ""}>
                  <td className="px-4 py-3">{user.userNumber ?? "—"}</td>
                  <td className="px-4 py-3">
                    {user.name || <span className="text-slate-400">—</span>}
                    {user.isProtected && (
                      <span className="ml-2 rounded-full bg-sky-100 px-2 py-0.5 text-xs font-medium text-sky-700">Admin</span>
                    )}
                  </td>
                  <td className="px-4 py-3">{user.alias || <span className="text-slate-400">—</span>}</td>
                  <td className="px-4 py-3">{formatDate(user.createdAt)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <input
                        type="date"
                        className="rounded-lg border border-slate-200 px-2 py-1 text-sm outline-none"
                        value={becameUserDraft(user)}
                        onChange={(event) =>
                          setBecameUserDrafts((prev) => ({ ...prev, [user.id]: event.target.value }))
                        }
                        aria-label={`Became user date for ${user.alias ?? user.name ?? user.userNumber ?? user.id}`}
                      />
                      <button
                        className="rounded-full border border-slate-200 px-3 py-1 text-xs font-medium disabled:cursor-not-allowed disabled:opacity-50"
                        disabled={savingBecameUserDate === user.id}
                        onClick={() => saveBecameUserDate(user.id)}
                      >
                        {savingBecameUserDate === user.id ? "Saving…" : "Save"}
                      </button>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${user.donated ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>
                      {user.userType}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      className="rounded-full border border-slate-200 px-3 py-1 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-50"
                      disabled={user.isProtected}
                      onClick={() => toggleDonated(user.id, user.donated)}
                    >
                      {user.donated ? "Yes" : "No"}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${isPremiumUser(user) ? "bg-amber-100 text-amber-800" : "bg-slate-100 text-slate-600"}`}>
                      {isPremiumUser(user) ? "Yes" : "No"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {user.rowCount}
                    <span className="text-slate-400"> / {MAX_ROWS}</span>
                  </td>
                  <td className="px-4 py-3">{user.emailVerified ? "Yes" : "No"}</td>
                  <td className="px-4 py-3">
                    {user.isProtected ? (
                      <span className="text-xs text-slate-400">Protected</span>
                    ) : (
                      <button
                        className="rounded-full border border-rose-200 px-3 py-1.5 text-sm font-medium text-rose-700 hover:bg-rose-50"
                        onClick={() => deleteUser(user.id)}
                      >
                        Delete user
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-8">
          <h2 className="text-xl font-semibold text-slate-900">Sponsors</h2>
          <p className="mt-1 text-sm text-slate-600">
            One sponsor slot per currency. Shown to non-donor users on the dashboard, next to the &quot;Support PlanHumans&quot; box.
          </p>
          {sponsorMessage && (
            <p className="mt-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">{sponsorMessage}</p>
          )}
          <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {CURRENCIES.map((currency) => {
              const draft = sponsorDrafts[currency] ?? EMPTY_SPONSOR_DRAFT;
              return (
                <div key={currency} className="rounded-2xl border border-slate-200 p-4">
                  <p className="text-sm font-semibold text-slate-900">{currency}</p>

                  <label className="mt-3 block text-xs font-medium text-slate-600">
                    Sponsor link
                    <input
                      className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none"
                      value={draft.link}
                      onChange={(event) => updateSponsorDraft(currency, { link: event.target.value })}
                      placeholder="https://sponsor.example.com"
                    />
                  </label>

                  <label className="mt-2 block text-xs font-medium text-slate-600">
                    Sponsor text
                    <input
                      className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none"
                      value={draft.text}
                      onChange={(event) => updateSponsorDraft(currency, { text: event.target.value })}
                      placeholder="Short sponsor message"
                    />
                  </label>

                  <label className="mt-2 block text-xs font-medium text-slate-600">
                    Logo
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/webp,image/svg+xml"
                      className="mt-1 block w-full text-xs"
                      onChange={(event) => handleLogoChange(currency, event.target.files?.[0] ?? null)}
                    />
                  </label>
                  {draft.logoData && (
                    <img
                      src={draft.logoData}
                      alt={`${currency} sponsor logo preview`}
                      className="mt-2 h-12 w-auto max-w-[140px] rounded-lg border border-slate-100 object-contain"
                    />
                  )}

                  <div className="mt-3 flex gap-2">
                    <button
                      type="button"
                      className="rounded-full bg-slate-900 px-3 py-1.5 text-xs font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
                      disabled={savingSponsor === currency}
                      onClick={() => saveSponsor(currency)}
                    >
                      {savingSponsor === currency ? "Saving..." : "Save"}
                    </button>
                    <button
                      type="button"
                      className="rounded-full border border-rose-200 px-3 py-1.5 text-xs font-medium text-rose-700 hover:bg-rose-50"
                      onClick={() => removeSponsor(currency)}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-8">
          <h2 className="text-xl font-semibold text-slate-900">Country facts</h2>
          <p className="mt-1 text-sm text-slate-600">
            Curated reference data folded into the AI-prompt&apos;s country context. Leave a field blank to fall back to the
            built-in structural facts for that country.
          </p>
          {countryFactsMessage && (
            <p className="mt-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">{countryFactsMessage}</p>
          )}
          <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {COUNTRY_CODES.map((country) => {
              const draft = countryFactsDrafts[country] ?? EMPTY_COUNTRY_FACTS_DRAFT;
              const row = countryFactsRows[country];
              return (
                <div key={country} className="rounded-2xl border border-slate-200 p-4">
                  <p className="text-sm font-semibold text-slate-900">{country}</p>

                  <label className="mt-3 block text-xs font-medium text-slate-600">
                    Inflation rate (%)
                    <input
                      className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none"
                      value={draft.inflationRate}
                      onChange={(event) => updateCountryFactsDraft(country, { inflationRate: event.target.value })}
                      placeholder="e.g. 2.3"
                      inputMode="decimal"
                    />
                  </label>

                  <label className="mt-2 block text-xs font-medium text-slate-600">
                    Typical pension fund yield (%)
                    <input
                      className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none"
                      value={draft.pensionYieldPct}
                      onChange={(event) => updateCountryFactsDraft(country, { pensionYieldPct: event.target.value })}
                      placeholder="e.g. 5"
                      inputMode="decimal"
                    />
                  </label>

                  <label className="mt-2 block text-xs font-medium text-slate-600">
                    Typical retirement age
                    <input
                      className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none"
                      value={draft.pensionAge}
                      onChange={(event) => updateCountryFactsDraft(country, { pensionAge: event.target.value })}
                      placeholder="e.g. 67"
                      inputMode="numeric"
                    />
                  </label>

                  <label className="mt-2 block text-xs font-medium text-slate-600">
                    Pension/account product names
                    <textarea
                      className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none"
                      rows={2}
                      value={draft.pensionTypeNames}
                      onChange={(event) => updateCountryFactsDraft(country, { pensionTypeNames: event.target.value })}
                      placeholder="e.g. Folkepension, ATP, Ratepension"
                    />
                  </label>

                  <label className="mt-2 block text-xs font-medium text-slate-600">
                    Factoids
                    <textarea
                      className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none"
                      rows={3}
                      value={draft.factoids}
                      onChange={(event) => updateCountryFactsDraft(country, { factoids: event.target.value })}
                      placeholder="Short bullet-style facts about pensions, tax, etc."
                    />
                  </label>

                  <label className="mt-2 block text-xs font-medium text-slate-600">
                    Housing market outlook
                    <textarea
                      className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none"
                      rows={2}
                      value={draft.housingMarketOutlook}
                      onChange={(event) => updateCountryFactsDraft(country, { housingMarketOutlook: event.target.value })}
                      placeholder="House / apartment / land / city development notes"
                    />
                  </label>

                  <p className="mt-3 text-xs text-slate-400">
                    {row?.asOf
                      ? `As of ${formatDate(row.asOf)} · updated by ${row.updatedBy ?? "—"}`
                      : "Not yet edited — using built-in fallback facts."}
                  </p>

                  <div className="mt-3 flex gap-2">
                    <button
                      type="button"
                      className="rounded-full bg-slate-900 px-3 py-1.5 text-xs font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
                      disabled={savingCountryFacts === country}
                      onClick={() => saveCountryFacts(country)}
                    >
                      {savingCountryFacts === country ? "Saving..." : "Save"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </main>
  );
}

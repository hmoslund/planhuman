"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { calculateWealth, toCurrency } from "@/lib/wealth";

type Row = { id: string; identifier: string; value: number; detail: string };
type Blocks = Record<string, Row[]>;

type UserProfile = {
  id: string;
  email: string;
  name: string | null;
  country: string;
  currency: string;
  emailVerified: boolean;
  isAdmin: boolean;
};

type LanguageCode = "US" | "UK" | "DK" | "SE" | "NO";

const blockMeta = [
  { key: "A", title: "Highly liquid assets", blurb: "Cash, savings and readily accessible assets" },
  { key: "A2", title: "Short term debt", blurb: "Short term borrowing and credit balance" },
  { key: "B", title: "Less liquid assets", blurb: "Assets less liquid and debtors" },
  { key: "B2", title: "Short term debt", blurb: "Personal debt and current obligations" },
  { key: "C", title: "Longer term investments", blurb: "Real estate and alternative assets" },
  { key: "C2", title: "Debt linked to long-term assets", blurb: "Long-term debt obligations" },
  { key: "H", title: "My notes", blurb: "Personal notes for the planner" },
  { key: "C3", title: "Potential tax liability", blurb: "Tax linked to long-term investments" },
  { key: "D", title: "Personal home and lifestyle assets", blurb: "Private home and personal assets" },
  { key: "D2", title: "Mortgage and personal debt", blurb: "Mortgage and debt linked to personal assets" },
  { key: "E", title: "Pension and reserves", blurb: "Retirement and precautionary reserves" },
  { key: "J", title: "Salary and income", blurb: "Monthly salary or income" },
  { key: "K", title: "Monthly expenses", blurb: "Regular household expenses" },
  { key: "G", title: "Goals", blurb: "Short and long-term ambitions with target values" },
  { key: "I", title: "My notes", blurb: "Personal notes for the planner" },
];

const blockTranslations: Record<LanguageCode, Record<string, { headline: string; subtitle: string }>> = {
  US: {
    A: { headline: "Highly liquid assets", subtitle: "Cash, savings and readily accessible assets" },
    A2: { headline: "Short-term debt", subtitle: "Short-term borrowing and credit balance" },
    B: { headline: "Short-term receivables & locked savings", subtitle: "Certificates of Deposit (CDs), money owed to you by friends/family/business, short-term private loans, pending payouts" },
    B2: { headline: "Personal debt & current obligations", subtitle: "Personal loans, outstanding medical bills, tax bills due this year, unpaid invoices" },
    C: { headline: "Longer-term investments", subtitle: "Stock portfolio (ETFs, index funds), brokerage accounts, rental properties, crypto, private equity, angel investments, gold/commodities" },
    C2: { headline: "Debt linked to long-term assets", subtitle: "Investment property mortgages, investment margin debt, commercial real estate loans" },
    C3: { headline: "Potential tax liability", subtitle: "Capital gains tax on unrealized stock gains, deferred taxes on property sales, exit taxes" },
    D: { headline: "Personal home & lifestyle assets", subtitle: "Primary residence valuation, cars/vehicles, jewelry, fine art, boats/RVs, collectibles" },
    D2: { headline: "Mortgage & personal debt", subtitle: "Primary residence mortgage, auto loans, boat/RV financing, home equity loans (HELOC)" },
    E: { headline: "Pension & reserves", subtitle: "Pension funds, corporate pensions, state pension estimates, locked funds" },
    J: { headline: "Salary & income", subtitle: "Monthly net salary, freelance/side-gig income, rental income, dividends, bonuses" },
    K: { headline: "Monthly expenses", subtitle: "Rent, grocery budget, utilities, subscriptions, insurance, dining out" },
    G: { headline: "Goals", subtitle: "Short and long-term ambitions with target values" },
    H: { headline: "My notes", subtitle: "Personal notes for the planner" },
    I: { headline: "My notes", subtitle: "Personal notes for the planner" },
  },
  UK: {
    A: { headline: "Highly Liquid Assets", subtitle: "Cash, savings and readily accessible assets" },
    A2: { headline: "Short-Term Debt", subtitle: "Short-term borrowing and credit balance" },
    B: { headline: "Short-Term Receivables & Locked Savings", subtitle: "Certificates of Deposit (CDs), money owed to you by friends/family/business, short-term private loans, pending payouts" },
    B2: { headline: "Personal Debt & Current Obligations", subtitle: "Personal loans, outstanding medical bills, tax bills due this year, unpaid invoices" },
    C: { headline: "Longer-Term Investments", subtitle: "Real estate, stocks and alternative assets" },
    C2: { headline: "Debt Linked to Long-Term Assets", subtitle: "Long-term debt obligations" },
    C3: { headline: "Potential Tax Liability", subtitle: "Tax linked to long-term investments" },
    D: { headline: "Personal Home & Lifestyle Assets", subtitle: "Private home and personal assets" },
    D2: { headline: "Mortgage & Personal Debt", subtitle: "Mortgage and debt linked to personal assets" },
    E: { headline: "Pension & Reserves", subtitle: "Retirement and precautionary reserves" },
    J: { headline: "Salary & Income", subtitle: "Monthly salary or income" },
    K: { headline: "Monthly Expenses", subtitle: "Regular household expenses" },
    G: { headline: "Goals", subtitle: "Short and long-term ambitions with target values" },
    H: { headline: "My notes", subtitle: "Personal notes for the planner" },
    I: { headline: "My notes", subtitle: "Personal notes for the planner" },
  },
  DK: {
    A: { headline: "Likvide midler", subtitle: "Kontanter, opsparing og lettilgængelige midler" },
    A2: { headline: "Kortfristet gæld", subtitle: "Kortfristede lån og kreditbalance" },
    B: { headline: "Tilgodehavender & kortfristet bundne midler", subtitle: "Mindre likvide aktiver og tilgodehavender" },
    B2: { headline: "Personlig gæld & løbende forpligtelser", subtitle: "Personlig gæld og kortfristede forpligtelser" },
    C: { headline: "Langsigtede investeringer", subtitle: "Investeringsejendomme, aktier og alternative aktiver" },
    C2: { headline: "Gæld knyttet til langsigtede investeringer", subtitle: "Langsigtede gældsforpligtelser" },
    C3: { headline: "Forventet skatteforpligtelse", subtitle: "Skat knyttet til langsigtede investeringer" },
    D: { headline: "Helårsbolig & livsstilsaktiver", subtitle: "Egen bolig og personlige aktiver" },
    D2: { headline: "Realkredit- & forbrugsgæld", subtitle: "Realkreditlån og gæld knyttet til personlige aktiver" },
    E: { headline: "Pension & reserver", subtitle: "Pensionsopsparing og forsigtighedsreserver" },
    J: { headline: "Løn & indkomst", subtitle: "Månedlig løn eller indtægt" },
    K: { headline: "Månedlige udgifter", subtitle: "Faste og variable husholdningsudgifter" },
    G: { headline: "Mål", subtitle: "Kort- og langsigtede ambitioner med målværdier" },
    H: { headline: "Mine noter", subtitle: "Personlige noter til planlæggeren" },
    I: { headline: "Mine noter", subtitle: "Personlige noter til planlæggeren" },
  },
  SE: {
    A: { headline: "Likvida medel", subtitle: "Kontanter, sparande och lättillgängliga tillgångar" },
    A2: { headline: "Kortfristiga skulder", subtitle: "Kortfristade lån och kreditbalanser" },
    B: { headline: "Kortfristiga fordringar & låst sparande", subtitle: "Mindre likvida tillgångar och fordringar" },
    B2: { headline: "Privatskulder & löpande förpliktelser", subtitle: "Personliga skulder och kortfristiga förpliktelser" },
    C: { headline: "Långsiktiga investeringar", subtitle: "Investeringsfastigheter, aktier och alternativa tillgångar" },
    C2: { headline: "Skulder kopplade till långsiktiga tillgångar", subtitle: "Långsiktiga skuldförpliktelser" },
    C3: { headline: "Potentiell skatteskuld", subtitle: "Skatt kopplad till långsiktiga investeringar" },
    D: { headline: "Bostad & livsstilstillgångar", subtitle: "Egen bostad och personliga tillgångar" },
    D2: { headline: "Bolån & privata fordringsskulder", subtitle: "Bolån och skulder kopplade till personliga tillgångar" },
    E: { headline: "Pension & reserver", subtitle: "Pensionssparande och trygghetsreserver" },
    J: { headline: "Lön & inkomster", subtitle: "Månatlig lön eller inkomst" },
    K: { headline: "Månadskostnader", subtitle: "Fasta och rörliga hushållskostnader" },
    G: { headline: "Mål", subtitle: "Kortsiktiga och långsiktiga ambitioner med målbelopp" },
    H: { headline: "Mina anteckningar", subtitle: "Personliga anteckningar för planen" },
    I: { headline: "Mina anteckningar", subtitle: "Personliga anteckningar för planen" },
  },
  NO: {
    A: { headline: "Likvide midler", subtitle: "Kontanter, sparing og lett tilgjengelige midler" },
    A2: { headline: "Kortsiktig gjeld", subtitle: "Kortsiktige lån og kredittbalanser" },
    B: { headline: "Kortsiktige fordringer & bundet sparing", subtitle: "Mindre likvide eiendeler og fordringer" },
    B2: { headline: "Personlig gjeld & løpende forpliktelser", subtitle: "Personlig gjeld og kortsiktige forpliktelser" },
    C: { headline: "Langsiktige investeringer", subtitle: "Investeringseiendom, aksjer og alternative eiendeler" },
    C2: { headline: "Gjeld knyttet til langsiktige eiendeler", subtitle: "Langsiktige gjeldsforpliktelser" },
    C3: { headline: "Forventet skatteforpliktelse", subtitle: "Skatt knyttet til langsiktige eiendeler" },
    D: { headline: "Primærbolig & livsstilseiendeler", subtitle: "Egen bolig og personlige eiendeler" },
    D2: { headline: "Boliglån & personlig gjeld", subtitle: "Boliglån og gjeld knyttet til personlige eiendeler" },
    E: { headline: "Pensjon & reserver", subtitle: "Pensjonssparing og trygghetsreserver" },
    J: { headline: "Lønn & inntekt", subtitle: "Månedlig lønn eller inntekt" },
    K: { headline: "Månedlige utgifter", subtitle: "Faste og variable husholdningsutgifter" },
    G: { headline: "Mål", subtitle: "Kort- og langsiktige ambisjoner med målverdier" },
    H: { headline: "Mine notater", subtitle: "Personlige notater for planleggeren" },
    I: { headline: "Mine notater", subtitle: "Personlige notater for planleggeren" },
  },
};

function getBlockCopy(key: string, language: LanguageCode) {
  const fallback = blockMeta.find((meta) => meta.key === key) ?? blockMeta[0];
  const translation = blockTranslations[language][key];
  return { title: translation?.headline ?? fallback.title, blurb: translation?.subtitle ?? fallback.blurb };
}

function sanitizeNumericInput(value: string) {
  return value.replace(/[^0-9-]/g, "").slice(0, 9);
}

function sanitizeNumericPercent(value: string) {
  return value.replace(/[^0-9]/g, "").slice(0, 2);
}

function createEmptyBlocks() {
  return {
    A: [],
    A2: [],
    B: [],
    B2: [],
    C: [],
    C2: [],
    C3: [],
    D: [],
    D2: [],
    E: [],
    G: [],
    H: [],
    I: [],
    J: [],
    K: [],
    L: [],
  };
}

export function DashboardClient() {
  const router = useRouter();
  const [blocks, setBlocks] = useState<Blocks>(createEmptyBlocks());
  const [user, setUser] = useState<UserProfile | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [language, setLanguage] = useState<LanguageCode>("US");
  const [showWealthPlanner, setShowWealthPlanner] = useState(true);
  const [showPensionPlanner, setShowPensionPlanner] = useState(true);
  const [birthYear, setBirthYear] = useState(1980);
  const [retirementAge, setRetirementAge] = useState(67);
  const [pensionYield, setPensionYield] = useState(5);
  const [illiquidYield, setIlliquidYield] = useState(4);
  const [inflationRate, setInflationRate] = useState(2);
  const [yearlyPensionSavings, setYearlyPensionSavings] = useState(10000);
  const [pensionTaxRate, setPensionTaxRate] = useState(25);
  const [projectionOverrides, setProjectionOverrides] = useState<Record<number, number>>({});
  const [assetProjectionOverrides, setAssetProjectionOverrides] = useState<Record<number, number>>({});

  useEffect(() => {
    async function loadData() {
      const response = await fetch("/api/wealth");
      if (response.status === 401) {
        router.replace("/");
        return;
      }

      const data = await response.json();
      setUser(data.user);
      setBlocks(data.record?.blocks ?? createEmptyBlocks());
    }

    loadData();
  }, [router]);

  const summary = useMemo(() => calculateWealth(blocks), [blocks]);
  const topGoals = useMemo(() => (blocks.G ?? []).slice(0, 5), [blocks]);

  const eValue = useMemo(() => (blocks.E ?? []).reduce((total, row) => total + Number(row.value || 0), 0), [blocks.E]);

  const trendData = useMemo(() => {
    return {
      years: Array.from({ length: 10 }, (_, index) => ({
        label: index === 0 ? "Current" : index === 9 ? "Age 82" : `Y${index}`,
        value: eValue * (1 + index * 0.04),
      })),
    };
  }, [eValue]);

  const translatedBlockMeta = useMemo(() => blockMeta.map((meta) => ({ ...meta, ...getBlockCopy(meta.key, language) })), [language]);

  const wealthBoxOverview = useMemo(() => {
    const items = [
      { key: "A", value: blocks.A?.reduce((sum, row) => sum + Number(row.value || 0), 0) ?? 0, color: "#2563eb" },
      { key: "A2", value: blocks.A2?.reduce((sum, row) => sum + Number(row.value || 0), 0) ?? 0, color: "#fecaca" },
      { key: "B", value: blocks.B?.reduce((sum, row) => sum + Number(row.value || 0), 0) ?? 0, color: "#2563eb" },
      { key: "B2", value: blocks.B2?.reduce((sum, row) => sum + Number(row.value || 0), 0) ?? 0, color: "#fecaca" },
      { key: "C", value: blocks.C?.reduce((sum, row) => sum + Number(row.value || 0), 0) ?? 0, color: "#2563eb" },
      { key: "C2", value: blocks.C2?.reduce((sum, row) => sum + Number(row.value || 0), 0) ?? 0, color: "#fecaca" },
      { key: "C3", value: blocks.C3?.reduce((sum, row) => sum + Number(row.value || 0), 0) ?? 0, color: "#fecaca" },
      { key: "D", value: blocks.D?.reduce((sum, row) => sum + Number(row.value || 0), 0) ?? 0, color: "#2563eb" },
      { key: "D2", value: blocks.D2?.reduce((sum, row) => sum + Number(row.value || 0), 0) ?? 0, color: "#fecaca" },
      { key: "E", value: blocks.E?.reduce((sum, row) => sum + Number(row.value || 0), 0) ?? 0, color: "#2563eb" },
    ].filter(({ key }) => key !== "H");
    const maxValue = Math.max(...items.map((item) => item.value), 1);
    return items.map((item) => ({
      ...item,
      label: `${item.key}. ${translatedBlockMeta.find((meta) => meta.key === item.key)?.title ?? item.key}`,
      width: Math.max(8, Math.round((item.value / maxValue) * 100)),
    }));
  }, [blocks, translatedBlockMeta]);

  const row1 = translatedBlockMeta.filter(({ key }) => ["A", "A2", "B", "B2", "C", "C2", "H", "C3"].includes(key));
  const row2 = translatedBlockMeta.filter(({ key }) => ["D", "D2"].includes(key));
  const row3 = translatedBlockMeta.filter(({ key }) => ["E"].includes(key));
  const row4 = translatedBlockMeta.filter(({ key }) => ["J", "K"].includes(key));
  const row5 = translatedBlockMeta.filter(({ key }) => ["G", "I"].includes(key));

  const updateRow = (blockKey: string, rowId: string, field: keyof Row, value: string) => {
    setBlocks((current) => ({
      ...current,
      [blockKey]: (current[blockKey] ?? []).map((row) => {
        if (row.id !== rowId) return row;
        if (field === "value") {
          const sanitized = sanitizeNumericInput(value);
          return { ...row, value: Number(sanitized || 0) };
        }
        return { ...row, [field]: value };
      }),
    }));
  };

  const retirementYear = birthYear + retirementAge;
  const monthlyExpenses = blocks.K?.reduce((sum, row) => sum + Number(row.value || 0), 0) ?? 0;
  const yearlyExpenses = monthlyExpenses * 12;

  const retirementProjections = useMemo(() => {
    const startYear = 2027;
    const endYear = birthYear + 82;
    const years = Array.from({ length: Math.max(endYear - startYear + 1, 0) }, (_, idx) => startYear + idx);
    const projections: Array<{ year: number; value: number }> = [];
    let currentValue = eValue;

    years.forEach((year, index) => {
      if (index === 0) {
        currentValue = eValue;
      } else {
        const growthValue = currentValue * (1 + pensionYield / 100);
        if (year <= retirementYear) {
          currentValue = growthValue + yearlyPensionSavings;
        } else {
          currentValue = growthValue - yearlyExpenses;
        }
      }

      const override = projectionOverrides[year];
      projections.push({ year, value: typeof override === "number" ? override : Math.round(currentValue) });
    });

    return projections;
  }, [birthYear, eValue, pensionYield, yearlyExpenses, retirementYear, yearlyPensionSavings, projectionOverrides]);

  const assetProjections = useMemo(() => {
    const startYear = 2027;
    const endYear = birthYear + 82;
    const years = Array.from({ length: Math.max(endYear - startYear + 1, 0) }, (_, idx) => startYear + idx);
    const projections: Array<{ year: number; value: number }> = [];
    let currentValue = summary.assets;

    years.forEach((year, index) => {
      if (index === 0) {
        currentValue = summary.assets;
      } else {
        const growthValue = currentValue * (1 + illiquidYield / 100);
        if (year <= retirementYear) {
          currentValue = growthValue + yearlyPensionSavings;
        } else {
          currentValue = growthValue - yearlyExpenses;
        }
      }

      const override = assetProjectionOverrides[year];
      projections.push({ year, value: typeof override === "number" ? override : Math.round(currentValue) });
    });

    return projections;
  }, [birthYear, summary.assets, illiquidYield, yearlyExpenses, retirementYear, yearlyPensionSavings, assetProjectionOverrides]);

  const addRow = (blockKey: string) => {
    setBlocks((current) => ({
      ...current,
      [blockKey]: [
        ...(current[blockKey] ?? []),
        blockKey === "G"
          ? { id: crypto.randomUUID(), identifier: "New goal", value: 0, detail: "0" }
          : ["H", "I"].includes(blockKey)
          ? { id: crypto.randomUUID(), identifier: "Note title", value: 0, detail: "Add a note here" }
          : { id: crypto.randomUUID(), identifier: "New row", value: 0, detail: "Added row" },
      ],
    }));
  };

  const deleteRow = (blockKey: string, rowId: string) => {
    setBlocks((current) => ({
      ...current,
      [blockKey]: (current[blockKey] ?? []).filter((row) => row.id !== rowId),
    }));
  };

  async function saveRecord() {
    setSaving(true);
    setMessage(null);
    const response = await fetch("/api/wealth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ blocks }),
    });
    const data = await response.json();
    setSaving(false);
    setMessage(data.message ?? data.error ?? "Saved.");
  }

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
  }

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-6 text-slate-900 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <header className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.25em] text-slate-500">Financial planner dashboard</p>
              <h1 className="mt-2 text-3xl font-semibold text-slate-900">{user?.name ?? "Your wealth planner"}</h1>
              <p className="mt-2 text-sm text-slate-600">
                {user?.country ?? "DK"} • {user?.currency ?? "kr"} • {user?.email ?? ""}
              </p>
            </div>
            <div className="flex gap-3">
              {user?.isAdmin && (
                <button className="rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700" onClick={() => router.push("/backoffice")}>
                  Back office
                </button>
              )}
              <button className="rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white" onClick={handleLogout}>
                Log out
              </button>
            </div>
          </div>
        </header>

        <section className="grid gap-4 lg:grid-cols-[2fr_1fr]">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[
              ["Net worth", summary.netWorth],
              ["Assets", summary.assets],
              ["Liabilities", summary.liabilities],
              ["Cashflow", summary.cashflow],
            ].map(([label, value]) => (
              <div key={label} className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-sm font-medium text-slate-500">{label}</p>
                <p className="mt-3 text-2xl font-semibold text-slate-900">{user ? toCurrency(value as number, user.currency) : "—"}</p>
              </div>
            ))}
          </div>

          <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">Goals</p>
                <h2 className="text-lg font-semibold text-slate-900">Top five goals</h2>
              </div>
              <div className="text-right text-sm text-slate-500">
                <div className="font-semibold text-slate-900">{topGoals.length}</div>
                <div>active goals</div>
              </div>
            </div>
            <div className="mt-5 grid gap-3">
              {topGoals.length > 0 ? (
                topGoals.map((goal) => {
                  const progress = goal.value > 0 ? Math.min(100, Math.round((Number(goal.detail || 0) / Number(goal.value)) * 100)) : 0;
                  return (
                    <div key={goal.id}>
                      <div className="mb-1 flex items-center justify-between text-sm text-slate-600">
                        <span>{goal.identifier}</span>
                        <span>{progress}%</span>
                      </div>
                      <div className="h-2 rounded-full bg-slate-100">
                        <div className="h-2 rounded-full bg-slate-900" style={{ width: `${progress}%` }} />
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-sm text-slate-600">Add a goal to start tracking progress.</p>
              )}
            </div>
          </div>
        </section>

        <section className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
          {showWealthPlanner && (
            <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">Planning view</p>
                  <h2 className="text-lg font-semibold text-slate-900">Wealth overview</h2>
                </div>
                <div className="text-sm text-slate-500">Brief overview</div>
              </div>
              <div className="mt-6 space-y-3">
                {wealthBoxOverview.map((item) => (
                  <div key={item.key} className="flex items-center gap-3">
                    <div className="h-10 w-2 rounded-full" style={{ backgroundColor: item.color }} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-3 text-sm text-slate-600">
                        <span className="truncate font-medium">{item.label}</span>
                        <span className="font-semibold text-slate-900">{user ? toCurrency(item.value, user.currency) : "—"}</span>
                      </div>
                      <div className="mt-2 h-2 rounded-full bg-slate-100">
                        <div className="h-2 rounded-full" style={{ width: `${item.width}%`, backgroundColor: item.color }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-slate-500">Planning focus</p>
            <p className="mt-2 text-lg font-semibold text-slate-900">Tailor the outlook to your life stage</p>
            <p className="mt-2 text-sm leading-6 text-slate-600">These assumptions help the planner reflect your personal retirement trajectory.</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <button className={`rounded-full px-4 py-2 text-sm font-medium ${showWealthPlanner ? "bg-slate-900 text-white" : "border border-slate-300 text-slate-700"}`} onClick={() => setShowWealthPlanner((value) => !value)}>
                Wealth Planner
              </button>
              <button className={`rounded-full px-4 py-2 text-sm font-medium ${showPensionPlanner ? "bg-slate-900 text-white" : "border border-slate-300 text-slate-700"}`} onClick={() => setShowPensionPlanner((value) => !value)}>
                Pension Planner
              </button>
            </div>
            <div className="mt-4 rounded-2xl border border-slate-200 p-3 text-sm text-slate-700">
              <span className="mb-2 block font-medium">Wealth block language</span>
              <select className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none" value={language} onChange={(event) => setLanguage(event.target.value as LanguageCode)}>
                <option value="US">US</option>
                <option value="UK">UK</option>
                <option value="DK">DK</option>
                <option value="SE">SE</option>
                <option value="NO">NO</option>
              </select>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <label className="rounded-2xl border border-slate-200 p-3 text-sm text-slate-700">
                <span className="mb-2 block font-medium">Birth year</span>
                <input className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none" type="number" value={birthYear} onChange={(event) => setBirthYear(Number(event.target.value || 1980))} />
              </label>
              <label className="rounded-2xl border border-slate-200 p-3 text-sm text-slate-700">
                <span className="mb-2 block font-medium">Retirement age</span>
                <input className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none" type="number" value={retirementAge} onChange={(event) => setRetirementAge(Number(event.target.value || 67))} />
              </label>
              <label className="rounded-2xl border border-slate-200 p-3 text-sm text-slate-700">
                <span className="mb-2 block font-medium">Average yield % pension funds</span>
                <input className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none" type="text" inputMode="numeric" value={pensionYield} onChange={(event) => setPensionYield(Number(sanitizeNumericPercent(event.target.value) || 0))} />
              </label>
              <label className="rounded-2xl border border-slate-200 p-3 text-sm text-slate-700">
                <span className="mb-2 block font-medium">Average yield % less liquid assets</span>
                <input className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none" type="text" inputMode="numeric" value={illiquidYield} onChange={(event) => setIlliquidYield(Number(sanitizeNumericPercent(event.target.value) || 0))} />
              </label>
              <label className="rounded-2xl border border-slate-200 p-3 text-sm text-slate-700">
                <span className="mb-2 block font-medium">Expected % inflation rate</span>
                <input className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none" type="text" inputMode="numeric" value={inflationRate} onChange={(event) => setInflationRate(Number(sanitizeNumericPercent(event.target.value) || 0))} />
              </label>
              <label className="rounded-2xl border border-slate-200 p-3 text-sm text-slate-700">
                <span className="mb-2 block font-medium">Yearly pension savings to retirement</span>
                <input className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none" type="number" value={yearlyPensionSavings} onChange={(event) => setYearlyPensionSavings(Number(event.target.value || 0))} />
              </label>
              <label className="rounded-2xl border border-slate-200 p-3 text-sm text-slate-700">
                <span className="mb-2 block font-medium">Expected tax rate pension funds</span>
                <input className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none" type="text" inputMode="numeric" value={pensionTaxRate} onChange={(event) => setPensionTaxRate(Number(sanitizeNumericPercent(event.target.value) || 0))} />
              </label>
            </div>
          </div>
        </section>

        <section className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Wealth blocks</p>
              <h2 className="text-xl font-semibold text-slate-900">Edit your record</h2>
            </div>
            <div className="flex gap-3">
              <button className="rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white" onClick={saveRecord} disabled={saving}>
                {saving ? "Saving..." : "Save record"}
              </button>
            </div>
          </div>

          {message && <p className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700">{message}</p>}

          <div className="flex flex-col gap-4">
            <div className="grid gap-4 xl:grid-cols-2">
              {row1.map((meta) => (
                <BlockCard key={meta.key} meta={meta} blocks={blocks} updateRow={updateRow} addRow={addRow} deleteRow={deleteRow} currency={user?.currency ?? "kr"} />
              ))}
            </div>
            <div className="grid gap-4 xl:grid-cols-2">
              {row2.map((meta) => (
                <BlockCard key={meta.key} meta={meta} blocks={blocks} updateRow={updateRow} addRow={addRow} deleteRow={deleteRow} currency={user?.currency ?? "kr"} />
              ))}
            </div>
            <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
              <div className="grid gap-4">
                {row3.map((meta) => (
                  <BlockCard key={meta.key} meta={meta} blocks={blocks} updateRow={updateRow} addRow={addRow} deleteRow={deleteRow} currency={user?.currency ?? "kr"} />
                ))}
              </div>
              <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-500">Assets / liabilities</p>
                    <h2 className="text-lg font-semibold text-slate-900">Balance overview</h2>
                  </div>
                  <div className="text-sm text-slate-500">Trend</div>
                </div>
                <div className="mt-5 rounded-2xl bg-slate-50 p-4">
                  <svg viewBox="0 0 320 180" className="h-44 w-full">
                    <line x1="24" y1="150" x2="300" y2="150" stroke="#cbd5e1" strokeWidth="1" />
                    <line x1="24" y1="20" x2="24" y2="150" stroke="#cbd5e1" strokeWidth="1" />
                    <path d={Array.from({ length: 10 }, (_, index) => `${index === 0 ? "M" : "L"} ${24 + (index / 9) * 276} ${150 - ((summary.assets - summary.liabilities) / Math.max(summary.assets, 1)) * 120}`).join(" ")} fill="none" stroke="#2563eb" strokeWidth="3" strokeLinecap="round" />
                    {Array.from({ length: 10 }, (_, index) => {
                      const x = 24 + (index / 9) * 276;
                      const y = 150 - ((summary.assets - summary.liabilities) / Math.max(summary.assets, 1)) * 120;
                      return <circle key={index} cx={x} cy={y} r="3" fill="#2563eb" />;
                    })}
                    <text x="24" y="16" fontSize="10" fill="#64748b">0</text>
                    <text x="24" y="170" fontSize="10" fill="#64748b">Now</text>
                    <text x="292" y="170" fontSize="10" fill="#64748b" textAnchor="end">Future</text>
                  </svg>
                </div>
              </div>
            </div>
            <div className="mt-4 rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">Wealth trend</p>
                  <h2 className="text-lg font-semibold text-slate-900">Pension outlook to age 82</h2>
                </div>
                <div className="text-sm text-slate-500">Timeline</div>
              </div>
              <div className="mt-5 rounded-2xl bg-slate-50 p-4">
                <svg viewBox="0 0 320 180" className="h-44 w-full">
                  <line x1="24" y1="150" x2="300" y2="150" stroke="#cbd5e1" strokeWidth="1" />
                  <line x1="24" y1="20" x2="24" y2="150" stroke="#cbd5e1" strokeWidth="1" />
                  <path
                    d={trendData.years
                      .map((point, index) => `${index === 0 ? "M" : "L"} ${24 + (index / 9) * 276} ${150 - (point.value / (eValue || 1)) * 120}`)
                      .join(" ")}
                    fill="none"
                    stroke="#1d4ed8"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                  {trendData.years.map((point, index) => {
                    const x = 24 + (index / 9) * 276;
                    const y = 150 - (point.value / (eValue || 1)) * 120;
                    return <circle key={index} cx={x} cy={y} r="3" fill="#1d4ed8" />;
                  })}
                  <text x="24" y="16" fontSize="10" fill="#64748b">0</text>
                  <text x="24" y="170" fontSize="10" fill="#64748b">Current</text>
                  <text x="292" y="170" fontSize="10" fill="#64748b" textAnchor="end">Age 82</text>
                </svg>
              </div>
            </div>
            <div className="grid gap-4 xl:grid-cols-2">
              {row4.map((meta) => (
                <BlockCard key={meta.key} meta={meta} blocks={blocks} updateRow={updateRow} addRow={addRow} deleteRow={deleteRow} currency={user?.currency ?? "kr"} />
              ))}
            </div>
            <div className="grid gap-4 xl:grid-cols-2">
              {row5.map((meta) => (
                <BlockCard key={meta.key} meta={meta} blocks={blocks} updateRow={updateRow} addRow={addRow} deleteRow={deleteRow} currency={user?.currency ?? "kr"} />
              ))}
            </div>
            <div className={`grid gap-4 ${showWealthPlanner && showPensionPlanner ? "xl:grid-cols-2" : ""}`}>
              {showPensionPlanner && (
                <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-500">Retirement table</p>
                      <h2 className="text-lg font-semibold text-slate-900">Pension projection</h2>
                    </div>
                    <div className="text-sm text-slate-500">Editable forecast</div>
                  </div>
                  <div className="mt-5 overflow-x-auto">
                    <table className="min-w-full text-left text-sm text-slate-700">
                      <thead>
                        <tr>
                          <th className="border-b border-slate-200 pb-3 font-medium">Year</th>
                          <th className="border-b border-slate-200 pb-3 font-medium">Pension and reserves</th>
                        </tr>
                      </thead>
                      <tbody>
                        {retirementProjections.map((projection) => (
                          <tr key={projection.year} className="border-b border-slate-200 last:border-none">
                            <td className="py-3 pr-4 font-medium text-slate-900">{projection.year}</td>
                            <td className="py-3">
                              <input
                                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none"
                                type="number"
                                value={projection.value}
                                onChange={(event) =>
                                  setProjectionOverrides((current) => ({
                                    ...current,
                                    [projection.year]: Number(event.target.value || 0),
                                  }))
                                }
                              />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {showWealthPlanner && (
                <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-500">Asset projection</p>
                      <h2 className="text-lg font-semibold text-slate-900">Assets and investments</h2>
                    </div>
                    <div className="text-sm text-slate-500">Editable forecast</div>
                  </div>
                  <div className="mt-5 overflow-x-auto">
                    <table className="min-w-full text-left text-sm text-slate-700">
                      <thead>
                        <tr>
                          <th className="border-b border-slate-200 pb-3 font-medium">Year</th>
                          <th className="border-b border-slate-200 pb-3 font-medium">Assets and investments</th>
                        </tr>
                      </thead>
                      <tbody>
                        {assetProjections.map((projection) => (
                          <tr key={projection.year} className="border-b border-slate-200 last:border-none">
                            <td className="py-3 pr-4 font-medium text-slate-900">{projection.year}</td>
                            <td className="py-3">
                              <input
                                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none"
                                type="number"
                                value={projection.value}
                                onChange={(event) => {
                                  const nextValue = Number(event.target.value || 0);
                                  setAssetProjectionOverrides((current) => ({
                                    ...current,
                                    [projection.year]: nextValue,
                                  }));
                                }}
                              />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

type BlockCardProps = {
  meta: { key: string; title: string; blurb: string };
  blocks: Blocks;
  updateRow: (blockKey: string, rowId: string, field: keyof Row, value: string) => void;
  addRow: (blockKey: string) => void;
  deleteRow: (blockKey: string, rowId: string) => void;
  currency: string;
};

function BlockCard({ meta, blocks, updateRow, addRow, deleteRow, currency }: BlockCardProps) {
  const rows = blocks[meta.key] ?? [];
  const isGoalBlock = meta.key === "G";
  const isLiabilityBlock = ["A2", "B2", "C2", "C3", "D2"].includes(meta.key);
  const isIncomeBlock = meta.key === "J";
  const isExpenseBlock = meta.key === "K";
  const isNoteBlock = ["H", "I"].includes(meta.key);
  const isGoalTheme = meta.key === "G";

  const cardClasses = isLiabilityBlock
    ? "border-rose-200 bg-rose-50/60"
    : isIncomeBlock
    ? "border-emerald-200 bg-emerald-50/70"
    : isExpenseBlock
    ? "border-amber-200 bg-amber-50/70"
    : isNoteBlock
    ? "border-slate-200 bg-slate-50"
    : isGoalTheme
    ? "border-sky-200 bg-sky-50/70"
    : "border-slate-200 bg-white";
  const badgeClasses = isLiabilityBlock
    ? "bg-rose-100 text-rose-700"
    : isIncomeBlock
    ? "bg-emerald-100 text-emerald-700"
    : isExpenseBlock
    ? "bg-amber-100 text-amber-700"
    : isNoteBlock
    ? "bg-slate-100 text-slate-700"
    : isGoalTheme
    ? "bg-sky-100 text-sky-700"
    : "bg-slate-100 text-slate-700";
  const titleClasses = isLiabilityBlock
    ? "text-rose-900"
    : isIncomeBlock
    ? "text-emerald-900"
    : isExpenseBlock
    ? "text-amber-900"
    : isNoteBlock
    ? "text-slate-900"
    : isGoalTheme
    ? "text-sky-900"
    : "text-slate-900";
  const labelClasses = isLiabilityBlock
    ? "text-rose-700"
    : isIncomeBlock
    ? "text-emerald-700"
    : isExpenseBlock
    ? "text-amber-700"
    : isNoteBlock
    ? "text-slate-700"
    : isGoalTheme
    ? "text-sky-700"
    : "text-slate-500";
  const blurbClasses = isLiabilityBlock
    ? "text-rose-700/80"
    : isIncomeBlock
    ? "text-emerald-700/80"
    : isExpenseBlock
    ? "text-amber-700/80"
    : isNoteBlock
    ? "text-slate-700/80"
    : isGoalTheme
    ? "text-sky-700/80"
    : "text-slate-600";

  return (
    <article className={`rounded-[24px] border p-5 shadow-sm ${cardClasses}`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className={`text-sm font-medium ${labelClasses}`}>{meta.key}</p>
          <h3 className={`mt-1 text-lg font-semibold ${titleClasses}`}>{meta.title}</h3>
          <p className={`mt-2 text-sm leading-6 ${blurbClasses}`}>{meta.blurb}</p>
        </div>
        {!isNoteBlock && (
          <div className={`rounded-full px-3 py-1 text-sm font-medium ${badgeClasses}`}>
            {toCurrency(rows.reduce((total, row) => total + Number(row.value ?? 0), 0), currency)}
          </div>
        )}
      </div>

      <div className="mt-5 space-y-3">
        {rows.map((row) => (
          <div key={row.id} className={`rounded-2xl border p-3 ${isLiabilityBlock ? "border-rose-200 bg-white/80" : "border-slate-200 bg-slate-50"}`}>
            {isNoteBlock ? (
              <div className="space-y-3">
                <input
                  className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none"
                  value={row.identifier}
                  onChange={(event) => updateRow(meta.key, row.id, "identifier", event.target.value)}
                  placeholder="Note title"
                />
                <textarea
                  className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none"
                  value={row.detail}
                  onChange={(event) => updateRow(meta.key, row.id, "detail", event.target.value)}
                  placeholder="Write your note here"
                  rows={3}
                />
                <button className="inline-flex items-center justify-center rounded-2xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700" onClick={() => deleteRow(meta.key, row.id)}>
                  <span aria-hidden="true">🗑</span>
                  <span className="sr-only">Delete note</span>
                </button>
              </div>
            ) : (
              <div className="grid gap-3 md:grid-cols-[1.3fr_0.55fr_auto]">
                <input
                  className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none"
                  value={row.identifier}
                  onChange={(event) => updateRow(meta.key, row.id, "identifier", event.target.value)}
                  placeholder={isGoalBlock ? "Goal" : "Identifier"}
                />
                <input
                  className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none max-w-[10rem]"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={9}
                  value={row.value}
                  onChange={(event) => updateRow(meta.key, row.id, "value", event.target.value)}
                  placeholder={isGoalBlock ? "Target" : "Value"}
                />
                <button className="inline-flex items-center justify-center rounded-2xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700" onClick={() => deleteRow(meta.key, row.id)}>
                  <span aria-hidden="true">🗑</span>
                  <span className="sr-only">Delete row</span>
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      <button className="mt-4 rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700" onClick={() => addRow(meta.key)}>
        {isGoalBlock ? "Add goal" : "Add row"}
      </button>
    </article>
  );
}

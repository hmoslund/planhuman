"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import * as am5 from "@amcharts/amcharts5";
import * as am5xy from "@amcharts/amcharts5/xy";
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";
import { curveMonotoneX } from "d3-shape";
import { calculateWealth, getCountryInfo, normalizeCurrency, CURRENCIES, toCurrency } from "@/lib/wealth";
import { blockTranslations, guideCopy, type BlockCopy, type CountryCode } from "@/lib/block-copy";

type Row = { id: string; identifier: string; value: number; detail: string; completed?: boolean };
type Blocks = Record<string, Row[]>;

type UserProfile = {
  id: string;
  email: string | null;
  alias: string | null;
  name: string | null;
  country: string;
  currency: string;
  emailVerified: boolean;
  isAdmin: boolean;
  donated: boolean;
  userNumber: number | null;
};

const MAX_ROWS = 400;

// Render order is defined by the row groups inside DashboardClient, not by this array.
// This is the key list plus an English fallback used only if a key is missing from block-copy.ts.
const blockMeta = [
  { key: "A", title: "Cash & instant-access savings", blurb: "Money you could spend this week." },
  { key: "A2", title: "Credit cards & short-term debt", blurb: "Balances on cards and flexible credit." },
  { key: "B", title: "Locked savings & money owed to you, and expected extraordinary earnings / payments", blurb: "Yours, but weeks or months away." },
  { key: "B2", title: "Loans & bills you owe", blurb: "Money you already owe someone." },
  { key: "C", title: "Investments", blurb: "Money invested to grow over years." },
  { key: "C2", title: "Debt and potential tax against investments", blurb: "Borrowing secured on your investments." },
  { key: "D", title: "Your home & belongings", blurb: "What they would realistically sell for today." },
  { key: "D2", title: "Mortgage & loans on what you own", blurb: "Balance outstanding, not the payment." },
  { key: "E", title: "Pensions", blurb: "Retirement pots with a balance." },
  { key: "J", title: "Monthly income", blurb: "What lands in your account each month." },
  { key: "K", title: "Monthly outgoings", blurb: "What leaves your account each month." },
  { key: "G", title: "Goals and Goal status", blurb: "What you are saving towards." },
  { key: "H", title: "My notes", blurb: "Anything the numbers do not capture." },
  { key: "I", title: "My notes", blurb: "Anything the numbers do not capture." },
];

function getBlockCopy(key: string, language: CountryCode) {
  const fallback = blockMeta.find((meta) => meta.key === key) ?? blockMeta[0];
  const translation: BlockCopy | undefined = blockTranslations[language]?.[key] ?? blockTranslations.UK?.[key];
  return {
    title: translation?.headline ?? fallback.title,
    blurb: translation?.subtitle ?? fallback.blurb,
    examples: translation?.examples,
    notHere: translation?.notHere,
    tip: translation?.tip,
    placeholder: translation?.placeholder,
  };
}

function getGuideCopy(language: CountryCode) {
  return { ...guideCopy.UK, ...(guideCopy[language] ?? {}) };
}

function sanitizeNumericInput(value: string) {
  // Digits only, with an optional single leading minus. Keeping "-" anywhere in the
  // string produced values like "12-000" -> Number(...) -> NaN, which then spread
  // through every total on the dashboard.
  const negative = value.trim().startsWith("-");
  const digits = value.replace(/[^0-9]/g, "").slice(0, 9);
  if (!digits) return "";
  return negative ? `-${digits}` : digits;
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
  const [aiPrompt, setAiPrompt] = useState("");
  const [selectedCountry, setSelectedCountry] = useState<CountryCode>("US");
  const [currency, setCurrency] = useState<string>("DKK");
  const [showWealthPlanner, setShowWealthPlanner] = useState(true);
  const [showPensionPlanner, setShowPensionPlanner] = useState(true);
  const [birthYear, setBirthYear] = useState(1980);
  const [retirementAge, setRetirementAge] = useState(67);
  const [pensionYield, setPensionYield] = useState(5);
  const [illiquidYield, setIlliquidYield] = useState(4);
  const [inflationRate, setInflationRate] = useState(2);
  const [yearlyPensionSavings, setYearlyPensionSavings] = useState(10000);
  const [showGuide, setShowGuide] = useState(true);
  const [savedSignature, setSavedSignature] = useState<string | null>(null);
  const [projectionOverrides, setProjectionOverrides] = useState<Record<number, number>>({});
  const [assetProjectionOverrides, setAssetProjectionOverrides] = useState<Record<number, number>>({});
  const [smoothingHorizontal, setSmoothingHorizontal] = useState(0.5);
  const [smoothingVertical, setSmoothingVertical] = useState(0.5);
  const [strokeWidth, setStrokeWidth] = useState(3);
  const [sponsors, setSponsors] = useState<Record<string, { link: string; logoData: string | null; text: string | null }>>({});
  const retirementChartRef = useRef<HTMLDivElement | null>(null);
  const assetChartRef = useRef<HTMLDivElement | null>(null);

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
      if (data.user?.currency) setCurrency(normalizeCurrency(data.user.currency));

      const s = data.record?.settings ?? {};
      if (typeof s.birthYear === "number") setBirthYear(s.birthYear);
      if (typeof s.retirementAge === "number") setRetirementAge(s.retirementAge);
      if (typeof s.pensionYield === "number") setPensionYield(s.pensionYield);
      if (typeof s.illiquidYield === "number") setIlliquidYield(s.illiquidYield);
      if (typeof s.inflationRate === "number") setInflationRate(s.inflationRate);
      if (typeof s.yearlyPensionSavings === "number") setYearlyPensionSavings(s.yearlyPensionSavings);
      if (typeof s.smoothingHorizontal === "number") setSmoothingHorizontal(s.smoothingHorizontal);
      if (typeof s.smoothingVertical === "number") setSmoothingVertical(s.smoothingVertical);
      if (typeof s.strokeWidth === "number") setStrokeWidth(s.strokeWidth);
      if (typeof s.showWealthPlanner === "boolean") setShowWealthPlanner(s.showWealthPlanner);
      if (typeof s.showPensionPlanner === "boolean") setShowPensionPlanner(s.showPensionPlanner);
    }

    loadData();
  }, [router]);

  useEffect(() => {
    async function loadSponsors() {
      const response = await fetch("/api/sponsors");
      if (!response.ok) return;
      const data = await response.json();
      setSponsors(data.sponsors ?? {});
    }

    loadSponsors();
  }, []);

  const sponsor = sponsors[currency] ?? null;

  const summary = useMemo(() => calculateWealth(blocks), [blocks]);

  // Nothing persists until "Save record", so warn before the tab closes with work in it.
  const stateSignature = useMemo(
    () =>
      JSON.stringify({
        blocks,
        currency,
        birthYear,
        retirementAge,
        pensionYield,
        illiquidYield,
        inflationRate,
        yearlyPensionSavings,
        showWealthPlanner,
        showPensionPlanner,
      }),
    [
      blocks,
      currency,
      birthYear,
      retirementAge,
      pensionYield,
      illiquidYield,
      inflationRate,
      yearlyPensionSavings,
      showWealthPlanner,
      showPensionPlanner,
    ]
  );
  const dirty = savedSignature !== null && savedSignature !== stateSignature;

  useEffect(() => {
    if (user && savedSignature === null) setSavedSignature(stateSignature);
  }, [user, savedSignature, stateSignature]);

  useEffect(() => {
    if (!dirty) return;
    const handler = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [dirty]);
  const topGoals = useMemo(() => (blocks.G ?? []).slice(0, 5), [blocks]);

  const derived = useMemo(() => {
    const sum = (key: string) => (blocks[key] ?? []).reduce((total, row) => total + Number(row.value || 0), 0);
    const cash = sum("A");
    const shortTermDebt = sum("A2");
    const monthlyIncome = sum("J");
    const monthlyOutgoings = sum("K");
    // Financial net worth deliberately excludes D and D2 — the home you live in and
    // personal property are not part of anyone's investable wealth.
    const financialAssets = sum("A") + sum("B") + sum("C") + sum("E");
    const financialDebt = sum("A2") + sum("B2") + sum("C2");
    return {
      financialNetWorth: financialAssets - financialDebt,
      monthsCovered: monthlyOutgoings > 0 ? cash / monthlyOutgoings : null,
      savingsRate: monthlyIncome > 0 ? ((monthlyIncome - monthlyOutgoings) / monthlyIncome) * 100 : null,
      debtToAssets: summary.assets > 0 ? (summary.liabilities / summary.assets) * 100 : null,
      propertyEquity: sum("D") - sum("D2"),
      cash,
      shortTermDebt,
      expensiveDebtFlag:
        shortTermDebt > 0 && monthlyOutgoings > 0 && cash >= monthlyOutgoings * 3
          ? { debt: shortTermDebt, cash }
          : null,
    };
  }, [blocks, summary]);

  const eValue = useMemo(() => (blocks.E ?? []).reduce((total, row) => total + Number(row.value || 0), 0), [blocks.E]);
  const cValue = useMemo(() => (blocks.C ?? []).reduce((total, row) => total + Number(row.value || 0), 0), [blocks.C]);

  useEffect(() => {
    if (user && ["US", "UK", "DK", "SE", "NO", "FI"].includes(user.country) && user.country !== selectedCountry) {
      setSelectedCountry(user.country as CountryCode);
    }
  }, [user, selectedCountry]);

  const translatedBlockMeta = useMemo(
    () => blockMeta.map((meta) => ({ ...meta, ...getBlockCopy(meta.key, selectedCountry) })),
    [selectedCountry]
  );

  const wealthBoxOverview = useMemo(() => {
    const items = [
      { key: "A", value: blocks.A?.reduce((sum, row) => sum + Number(row.value || 0), 0) ?? 0, color: "#2563eb" },
      { key: "A2", value: blocks.A2?.reduce((sum, row) => sum + Number(row.value || 0), 0) ?? 0, color: "#fecaca" },
      { key: "B", value: blocks.B?.reduce((sum, row) => sum + Number(row.value || 0), 0) ?? 0, color: "#2563eb" },
      { key: "B2", value: blocks.B2?.reduce((sum, row) => sum + Number(row.value || 0), 0) ?? 0, color: "#fecaca" },
      { key: "C", value: blocks.C?.reduce((sum, row) => sum + Number(row.value || 0), 0) ?? 0, color: "#2563eb" },
      { key: "C2", value: blocks.C2?.reduce((sum, row) => sum + Number(row.value || 0), 0) ?? 0, color: "#fecaca" },
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

  const guide = useMemo(() => getGuideCopy(selectedCountry), [selectedCountry]);

  // Start with the two blocks every user can answer from memory, and which drive every
  // chart on the page. Then the balance sheet in liquidity order. Rarely-used blocks sit
  // behind a disclosure; pensions and notes sit together at the end.
  const pick = (keys: string[]) =>
    keys.map((key) => translatedBlockMeta.find((meta) => meta.key === key)).filter(Boolean) as typeof translatedBlockMeta;

  const rowStart = pick(["J", "K"]);
  const rowCash = pick(["A", "A2"]);
  const rowHome = pick(["D", "D2"]);
  const rowInvestments = pick(["C", "C2"]);
  const rowPension = pick(["E", "H"]);
  const rowAdvanced = pick(["B", "B2"]);
  const rowGoals = pick(["G"]);

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
  const toggleComplete = (blockKey: string, rowId: string) => {
    setBlocks((current) => ({
      ...current,
      [blockKey]: (current[blockKey] ?? []).map((row) => (row.id === rowId ? { ...row, completed: !row.completed } : row)),
    }));
  };


  const retirementYear = birthYear + retirementAge;
  const monthlyExpenses = blocks.K?.reduce((sum, row) => sum + Number(row.value || 0), 0) ?? 0;
  const yearlyExpenses = monthlyExpenses * 12;

  const retirementProjections = useMemo(() => {
    const startYear = 2027;
    const endYear = retirementYear;
    const years = Array.from({ length: Math.max(endYear - startYear + 1, 0) }, (_, idx) => startYear + idx);
    const projections: Array<{ year: number; balance: number; returns: number; savings: number; spend: number }> = [];
    let runningBalance = eValue;
    let previousSpend = 0;

    years.forEach((year) => {
      // Column C: estimated returns = pension balance x average yield % pension funds
      const returns = runningBalance * (pensionYield / 100);
      // Column D: yearly pension savings to retirement (shown until birth year + retirement age)
      const savings = year <= retirementYear ? yearlyPensionSavings : 0;

      // Column E: yearly spend after inflation (0 until retirement, then inflation-adjusted each year)
      let spend = 0;
      if (year === retirementYear) {
        spend = yearlyExpenses * (1 + inflationRate / 100);
      } else if (year > retirementYear) {
        spend = previousSpend * (1 + inflationRate / 100);
      }
      previousSpend = spend;

      const override = projectionOverrides[year];
      projections.push({
        year,
        balance: typeof override === "number" ? Math.round(override) : Math.round(runningBalance),
        returns: Math.round(returns),
        savings: Math.round(savings),
        spend: Math.round(spend),
      });

      // Column B: until retirement balance grows by returns + savings, from retirement by returns - spend
      if (year < retirementYear) {
        runningBalance = runningBalance + returns + savings;
      } else {
        runningBalance = runningBalance + returns - spend;
      }
    });

    return projections;
  }, [birthYear, eValue, pensionYield, yearlyExpenses, yearlyPensionSavings, retirementYear, inflationRate, projectionOverrides]);

  const assetProjections = useMemo(() => {
    const startYear = 2027;
    const endYear = retirementYear;
    const years = Array.from({ length: Math.max(endYear - startYear + 1, 0) }, (_, idx) => startYear + idx);
    const yearlyCashflow = summary.cashflow * 12;
    const projections: Array<{ year: number; balance: number; returns: number; cashflow: number }> = [];
    let runningBalance = cValue;

    years.forEach((year) => {
      // Column C: estimated returns = assets/investments x average yield % less liquid assets
      const returns = runningBalance * (illiquidYield / 100);

      const override = assetProjectionOverrides[year];
      projections.push({
        year,
        balance: typeof override === "number" ? Math.round(override) : Math.round(runningBalance),
        returns: Math.round(returns),
        cashflow: Math.round(yearlyCashflow),
      });

      // Column B: assets/investments grow by returns + yearly cashflow until retirement
      runningBalance = runningBalance + returns + yearlyCashflow;
    });

    return projections;
  }, [retirementYear, cValue, illiquidYield, summary.cashflow, assetProjectionOverrides]);

useEffect(() => {
    const buildChart = (root: am5.Root, data: Array<{ year: number; value: number }>, color: number) => {
      root.setThemes([am5themes_Animated.new(root)]);
      const chart = root.container.children.push(
        am5xy.XYChart.new(root, {
          panX: true,
          panY: true,
          wheelX: "panX",
          wheelY: "zoomX",
          pinchZoomX: true,
        })
      );

      chart.set("scrollbarX", am5.Scrollbar.new(root, { orientation: "horizontal" }));

      const xRenderer = am5xy.AxisRendererX.new(root, { minGridDistance: 20 });
      const xAxis = chart.xAxes.push(
        am5xy.CategoryAxis.new(root, {
          categoryField: "year",
          renderer: xRenderer,
        })
      );
      xAxis.get("renderer").labels.template.setAll({ rotation: -30, centerY: am5.p50, centerX: am5.p0, paddingTop: 10 });
      xAxis.data.setAll(data.map((item) => ({ year: String(item.year) })));

      const yAxis = chart.yAxes.push(am5xy.ValueAxis.new(root, { renderer: am5xy.AxisRendererY.new(root, {}) }));

      const series = chart.series.push(
        am5xy.LineSeries.new(root, {
          name: "Projection",
          xAxis,
          yAxis,
          valueYField: "value",
          categoryXField: "year",
          tooltip: am5.Tooltip.new(root, {
            labelText: "{name}: [bold]{valueY.formatNumber('#,###')}[/]",
          }),
        })
      );

      series.strokes.template.setAll({ stroke: am5.color(color), strokeWidth, lineCap: "round" });
      series.fills.template.setAll({ fill: am5.color(color), fillOpacity: 0.16 });
      series.set("curveFactory", curveMonotoneX);

      series.bullets.push(() =>
        am5.Bullet.new(root, {
          sprite: am5.Circle.new(root, {
            radius: 6,
            fill: am5.color(0xffffff),
            stroke: am5.color(color),
            strokeWidth: 2,
          }),
        })
      );

      series.data.setAll(data.map((item) => ({ year: String(item.year), value: item.value })));

      const cursor = chart.set("cursor", am5xy.XYCursor.new(root, { xAxis, yAxis, behavior: "none" }));
      cursor.lineY.set("visible", false);
      cursor.lineX.setAll({ strokeOpacity: 0.4, stroke: am5.color(0x94a3b8) });

      chart.appear(1000, 100);
      return root;
    };

    const roots: am5.Root[] = [];

    if (retirementChartRef.current) {
      const root = am5.Root.new(retirementChartRef.current);
      buildChart(root, retirementProjections.map((projection) => ({ year: projection.year, value: projection.balance })), 0x1d4ed8);
      roots.push(root);
    }
    if (assetChartRef.current) {
      const root = am5.Root.new(assetChartRef.current);
      buildChart(root, assetProjections.map((projection) => ({ year: projection.year, value: projection.balance })), 0x8b5cf6);
      roots.push(root);
    }

    return () => {
      roots.forEach((root) => root.dispose());
    };
  }, [retirementProjections, assetProjections, smoothingHorizontal, smoothingVertical, strokeWidth]);

  const addRow = (blockKey: string) => {
    setBlocks((current) => {
      const total = Object.values(current).reduce((n, rows) => n + (rows?.length ?? 0), 0);
      if (total >= MAX_ROWS) {
        setMessage(`Row limit reached (${MAX_ROWS}). Delete a row to add more.`);
        return current;
      }
      return {
        ...current,
        [blockKey]: [
          ...(current[blockKey] ?? []),
          blockKey === "G"
            ? { id: crypto.randomUUID(), identifier: "", value: 0, detail: "", completed: false }
            : { id: crypto.randomUUID(), identifier: "", value: 0, detail: "" },
        ],
      };
    });
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
      body: JSON.stringify({
        blocks,
        currency,
        settings: {
          birthYear,
          retirementAge,
          pensionYield,
          illiquidYield,
          inflationRate,
          yearlyPensionSavings,
          smoothingHorizontal,
          smoothingVertical,
          strokeWidth,
          showWealthPlanner,
          showPensionPlanner,
        },
      }),
    });
    const data = await response.json();
    setSaving(false);
    setMessage(data.message ?? data.error ?? "Saved.");
    if (response.ok) setSavedSignature(stateSignature);
    if (data.record) {
      setUser((prev) => (prev ? { ...prev, currency } : prev));
    }
  }

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
  }

  const buildAiPrompt = () => {
    const country = user?.country ?? selectedCountry;
    const { name, language } = getCountryInfo(country);
    const sym = (() => {
      switch (currency) {
        case "USD":
          return "$";
        case "GBP":
          return "£";
        case "EUR":
          return "€";
        case "DKK":
          return "DKK ";
        case "SEK":
          return "SEK ";
        case "NOK":
          return "NOK ";
        default:
          return `${currency} `;
      }
    })();

    const nowYear = new Date().getFullYear();
    const currentAge = Math.max(nowYear - (birthYear || nowYear), 0);
    const yearsToRetirement = Math.max(retirementAge - currentAge, 0);

    const assets = summary.assets;
    const liabilities = summary.liabilities;
    const netWorth = summary.netWorth;
    const debtToAssetRatio = assets > 0 ? Math.round((liabilities / assets) * 100) : 0;
    const monthlyIncome = (blocks.J ?? []).reduce((sum, row) => sum + Number(row.value || 0), 0);
    const monthlyExpenses = (blocks.K ?? []).reduce((sum, row) => sum + Number(row.value || 0), 0);
    const monthlySurplus = summary.cashflow;

    const metaByKey = Object.fromEntries(translatedBlockMeta.map((meta) => [meta.key, meta]));

    const goalsList =
      (blocks.G ?? []).length > 0
        ? (blocks.G ?? [])
            .map((goal) => {
              const completed = goal.completed ? " [COMPLETED]" : "";
              return `  - ${goal.identifier || "Untitled goal"} (Target: ${sym}${goal.value || 0} | Status: ${goal.detail || "in progress"})${completed}`;
            })
            .join("\n")
        : "  - No goals defined yet.";

    // Notes carry the context the numbers cannot ("changing jobs in spring", "inheritance
    // expected") and used to be dropped from the prompt entirely.
    const notesList = ["H", "I"]
      .flatMap((key) => blocks[key] ?? [])
      .map((row) => `${row.identifier || ""} ${row.detail || ""}`.trim())
      .filter((line) => line.length > 0)
      .map((line) => `  - ${line}`)
      .join("\n");

    const breakdownKeys = Object.keys(blocks).filter((key) => !["G", "H", "I", "L"].includes(key));
    const blocksBreakdown = breakdownKeys
      .map((key) => {
        const rows = blocks[key] ?? [];
        const title = metaByKey[key]?.title ?? key;
        const lines =
          rows.length > 0
            ? rows
                .map((row) => `  - ${row.identifier || "—"}: ${sym}${row.value || 0}${row.detail ? ` (${row.detail})` : ""}`)
                .join("\n")
            : "  - (empty)";
        return `### ${key} - ${title}\n${lines}`;
      })
      .join("\n\n") || "(no wealth data entered)";

    return `You are an elite, highly pragmatic personal financial advisor and wealth manager. Your single mission is to deliver an objective, deeply actionable, and personalized analysis of my financial situation based strictly on the data provided below.

Adopt a direct, encouraging, yet candid tone (like an experienced advisor speaking to a client). Focus on actionable strategy rather than generic advice.

LANGUAGE: The entire answer must be written in this language: ${language} (Country: ${name}). Please respond fully in ${language} and write all currencies, examples and recommendations in that language.

==================================================
1. CLIENT PROFILE & FINANCIAL DATA
==================================================
• Demographics:
  - Birth Year: ${birthYear} (Current Age: ~${currentAge})
  - Country / Location: ${country}
  - Target Retirement Age: ${retirementAge} (Years to Horizon: ~${yearsToRetirement})
• Financial Position Snapshot:
  - Total Net Worth: ${sym}${netWorth}
  - Total Debt: ${sym}${liabilities} (Debt-to-Asset Ratio: ${debtToAssetRatio}%)
  - Net Monthly Cash Flow: ${sym}${monthlySurplus} (Income: ${sym}${monthlyIncome} | Expenses: ${sym}${monthlyExpenses})
• Key Life & Financial Goals:
${goalsList}
• Personal Context & Notes (written by me — weigh these heavily):
${notesList || "  - None provided."}

==================================================
2. DETAILED WEALTH BLOCKS & STRUCTURE
==================================================
${blocksBreakdown}

==================================================
3. REQUIRED ANALYSIS & REPORT STRUCTURE
==================================================
Please organize your advice into the following 5 distinct sections:

## 1. Executive Summary & Diagnosis
Provide a succinct overall diagnosis of my financial health. Highlight my current financial phase (e.g., wealth building, consolidation, high-leverage risk) and give a 1-sentence assessment of my trajectory.

## 2. Key Observations, Balance & Risk Profile (5–10 Bullet Points)
• Asset Allocation & Liquidity: Is my portfolio properly balanced for my age (${currentAge}) and horizon?
• Risk Exposure: Comment on my debt concentration, real estate vs. equity weighting, crypto, or single-asset concentration.
• Cash Flow Efficiency: Are my monthly savings/surplus sufficient to support my long-term goals?
• Regional & Tax Considerations: Note any specific leverage, tax, or pension opportunities relevant to operating in ${country}.

## 3. Reality Check on Key Goals
For each goal listed in my profile:
• Is it realistic given my net worth, cash flow, and timeline?
• What exact monthly contribution, return rate, or shift in assets is needed to achieve it?
• What trade-offs or adjustments (if any) do you recommend considering?

## 4. Action Plan: Priority Roadmap
Categorize recommendations into three clear phases:
• Immediate Actions (Next 30 Days): Critical fixes, emergency fund adjustments, high-interest debt payoffs, or immediate cash allocation.
• Medium-Term Strategy (1–3 Years): Rebalancing, tax-advantaged account optimization, or milestone prep.
• Long-Term Strategy (3+ Years to Retirement): Wealth accumulation, mortgage reduction, or pension structuring.

## 5. Next Steps & Professional Guidance
• Immediate Next Steps: Checklist of 3 specific tasks I should complete this week.
• Advisory Needs: Which local specialists (e.g., tax accountant, estate lawyer, independent mortgage broker) should I consult in ${country}?
• Learning & Sources: Recommend 2–3 high-quality, reputable local sources or framework concepts for further reading.

Begin your response with Section 1.

(END OF AI TEXT)`;
  };

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-6 text-slate-900 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <header className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div className="flex flex-col gap-3">
              <img
                src="/phlogo.png"
                alt="PlanHumans logo"
                className="h-14 w-auto max-w-[180px] rounded-xl object-contain"
              />
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.25em] text-slate-500">Financial planner dashboard</p>
              <h1 className="mt-2 text-3xl font-semibold text-slate-900">{user?.name ?? "Your wealth planner"}</h1>
              <p className="mt-2 text-sm text-slate-600">
                {user?.country ?? "DK"} • {currency} • User #{user?.userNumber ?? "—"} • {user?.email ?? user?.alias ?? ""}
              </p>
            </div>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <label className="flex items-center gap-2 rounded-full border border-slate-200 px-3 py-2 text-sm text-slate-700">
                <span className="font-medium">Currency</span>
                <select
                  className="bg-transparent outline-none"
                  value={currency}
                  onChange={(event) => setCurrency(event.target.value)}
                  aria-label="Currency"
                >
                  {CURRENCIES.map((code) => (
                    <option key={code} value={code}>
                      {code}
                    </option>
                  ))}
                </select>
              </label>
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

        {!user?.donated && (
          <div className={`grid gap-4 ${sponsor ? "md:grid-cols-2" : ""}`}>
            <div className="rounded-[24px] border border-amber-200 bg-amber-50 p-5 shadow-sm">
              <p className="text-sm font-medium text-amber-700">Support PlanHumans</p>
              <p className="mt-1 text-base font-semibold text-slate-900">
                You are a non paying user — consider to buy us a coffee to support.
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Your support keeps every part of this service free to use. Scan the QR code below or tap the image to buy us a coffee.
              </p>
              <a
                href="https://buymeacoffee.com/planhumans"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex items-center gap-3 rounded-2xl border border-amber-200 bg-white px-4 py-3 shadow-sm"
              >
                <img
                  src="/qrcode.png"
                  alt="Buy us a coffee QR code"
                  className="h-28 w-auto rounded-lg object-contain"
                />
                <span className="text-sm font-medium text-slate-800 underline">buymeacoffee.com/planhumans</span>
              </a>
            </div>

            {sponsor && (
              <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-sm font-medium text-slate-500">Sponsored by</p>
                <a
                  href={sponsor.link}
                  target="_blank"
                  rel="noopener noreferrer sponsored"
                  className="mt-3 flex items-center gap-3"
                >
                  {sponsor.logoData && (
                    <img
                      src={sponsor.logoData}
                      alt="Sponsor logo"
                      className="h-14 w-auto max-w-[180px] rounded-xl object-contain"
                    />
                  )}
                  <span className="text-sm font-medium text-slate-800 underline">{sponsor.link.replace(/^https?:\/\//, "")}</span>
                </a>
                {sponsor.text && <p className="mt-3 text-sm leading-6 text-slate-600">{sponsor.text}</p>}
              </div>
            )}
          </div>
        )}

        <section className="grid gap-4">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
{[
              ["Net worth", summary.netWorth],
              ["Assets", summary.assets],
              ["Liabilities", summary.liabilities],
              ["Cashflow", summary.cashflow],
            ].map(([label, value]) => (
              <div key={label} className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-sm font-medium text-slate-500">{label}</p>
                <p className="mt-3 text-2xl font-semibold text-slate-900">{toCurrency(value as number, currency)}</p>
              </div>
            ))}
          </div>

          {/* Derived figures — no new inputs, all computed from the blocks above. */}
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
            <div className="rounded-[20px] border border-slate-200 bg-white px-4 py-3 shadow-sm">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Financial net worth</p>
              <p className="mt-2 text-lg font-semibold tabular-nums text-slate-900">
                {toCurrency(derived.financialNetWorth, currency)}
              </p>
              <p className="mt-1 text-xs leading-5 text-slate-500">Excludes your home and personal property</p>
            </div>

            <div className="rounded-[20px] border border-slate-200 bg-white px-4 py-3 shadow-sm">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Months of outgoings covered</p>
              <p
                className={`mt-2 text-lg font-semibold tabular-nums ${
                  derived.monthsCovered === null
                    ? "text-slate-400"
                    : derived.monthsCovered < 3
                    ? "text-amber-700"
                    : "text-emerald-700"
                }`}
              >
                {derived.monthsCovered === null ? "—" : `${derived.monthsCovered.toFixed(1)} months`}
              </p>
              <p className="mt-1 text-xs leading-5 text-slate-500">Cash (A) ÷ outgoings (K) · aim for 3–6</p>
            </div>

            <div className="rounded-[20px] border border-slate-200 bg-white px-4 py-3 shadow-sm">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Savings rate</p>
              <p className="mt-2 text-lg font-semibold tabular-nums text-slate-900">
                {derived.savingsRate === null ? "—" : `${Math.round(derived.savingsRate)}%`}
              </p>
              <p className="mt-1 text-xs leading-5 text-slate-500">Of income left after outgoings</p>
            </div>

            <div className="rounded-[20px] border border-slate-200 bg-white px-4 py-3 shadow-sm">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Debt to assets</p>
              <p className="mt-2 text-lg font-semibold tabular-nums text-slate-900">
                {derived.debtToAssets === null ? "—" : `${Math.round(derived.debtToAssets)}%`}
              </p>
              <p className="mt-1 text-xs leading-5 text-slate-500">All liabilities ÷ all assets</p>
            </div>

            <div className="rounded-[20px] border border-slate-200 bg-white px-4 py-3 shadow-sm">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Property equity</p>
              <p className="mt-2 text-lg font-semibold tabular-nums text-slate-900">
                {toCurrency(derived.propertyEquity, currency)}
              </p>
              <p className="mt-1 text-xs leading-5 text-slate-500">Home and belongings (D) less loans (D2)</p>
            </div>
          </div>

        </section>

        <section className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
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
                      <span className="font-semibold text-slate-900">{toCurrency(item.value, currency)}</span>
                    </div>
                    <div className="mt-2 h-2 rounded-full bg-slate-100">
                      <div className="h-2 rounded-full" style={{ width: `${item.width}%`, backgroundColor: item.color }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">Goals</p>
                <h2 className="text-lg font-semibold text-slate-900">Goals</h2>
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

        <section className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Wealth blocks</p>
              <h2 className="text-xl font-semibold text-slate-900">Edit your record</h2>
            </div>
            <div className="flex items-center gap-3">
              {dirty && (
                <span className="rounded-full bg-amber-100 px-3 py-1 text-sm font-medium text-amber-800">
                  Unsaved changes
                </span>
              )}
              <button className="rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white" onClick={saveRecord} disabled={saving}>
                {saving ? "Saving..." : "Save record"}
              </button>
            </div>
          </div>

          {message && <p className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700">{message}</p>}

          <div className="rounded-[24px] border border-sky-200 bg-sky-50 p-5 shadow-sm">
            <p className="text-sm font-medium text-sky-700">{guide.headline}</p>
            <h2 className="mt-1 text-lg font-semibold text-slate-900">{guide.subtitle}</h2>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {[guide.step1, guide.step2, guide.step3, guide.step4, guide.step5].map((step, index) => (
                <p key={index} className="text-sm leading-6 text-slate-600">
                  <span className="mr-2 font-semibold text-sky-700">{index + 1}</span>
                  {step}
                </p>
              ))}
            </div>
            <p className="mt-4 border-t border-sky-200 pt-3 text-xs leading-5 text-slate-500">{guide.disclaimer}</p>
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm"
              onClick={() => setShowGuide((value) => !value)}
            >
              {showGuide ? "Turn off guide" : "Show guide"}
            </button>
          </div>

          <div className="flex flex-col gap-4">
            {/* Balance sheet, in liquidity order. */}
            <p className="mt-2 text-sm font-semibold uppercase tracking-wide text-slate-500">{guide.sectionBalance}</p>
            <div className="grid gap-4 xl:grid-cols-2">
              {rowCash.map((meta) => (
                <BlockCard key={meta.key} meta={meta} blocks={blocks} updateRow={updateRow} addRow={addRow} deleteRow={deleteRow} toggleComplete={toggleComplete} currency={currency} showGuide={showGuide} />
              ))}
            </div>
            <div className="grid gap-4 xl:grid-cols-2">
              {rowHome.map((meta) => (
                <BlockCard key={meta.key} meta={meta} blocks={blocks} updateRow={updateRow} addRow={addRow} deleteRow={deleteRow} toggleComplete={toggleComplete} currency={currency} showGuide={showGuide} />
              ))}
            </div>
            <div className="grid gap-4 xl:grid-cols-2">
              {rowInvestments.map((meta) => (
                <BlockCard key={meta.key} meta={meta} blocks={blocks} updateRow={updateRow} addRow={addRow} deleteRow={deleteRow} toggleComplete={toggleComplete} currency={currency} showGuide={showGuide} />
              ))}
            </div>
            <div className="grid gap-4 xl:grid-cols-2">
              {rowAdvanced.map((meta) => (
                <BlockCard key={meta.key} meta={meta} blocks={blocks} updateRow={updateRow} addRow={addRow} deleteRow={deleteRow} toggleComplete={toggleComplete} currency={currency} showGuide={showGuide} />
              ))}
            </div>
            <div className="grid gap-4 xl:grid-cols-2">
              {rowPension.map((meta) => (
                <BlockCard key={meta.key} meta={meta} blocks={blocks} updateRow={updateRow} addRow={addRow} deleteRow={deleteRow} toggleComplete={toggleComplete} currency={currency} showGuide={showGuide} />
              ))}
            </div>

            {/* Start here — income and outgoings drive every chart on the page. */}
            <p className="mt-2 text-sm font-semibold uppercase tracking-wide text-slate-500">{guide.sectionStart}</p>
            <div className="grid gap-4 xl:grid-cols-2">
              {rowStart.map((meta) => (
                <BlockCard key={meta.key} meta={meta} blocks={blocks} updateRow={updateRow} addRow={addRow} deleteRow={deleteRow} toggleComplete={toggleComplete} currency={currency} showGuide={showGuide} />
              ))}
            </div>

            <div className="grid gap-4">
              {rowGoals.map((meta) => (
                <BlockCard key={meta.key} meta={meta} blocks={blocks} updateRow={updateRow} addRow={addRow} deleteRow={deleteRow} toggleComplete={toggleComplete} currency={currency} showGuide={showGuide} />
              ))}
            </div>

            {/* AI guided advisory */}
            <div className="mt-2 rounded-[24px] border border-violet-200 bg-violet-50 p-5 shadow-sm">
              <p className="text-sm font-medium text-violet-500">AI</p>
              <h2 className="mt-1 text-lg font-semibold text-violet-900">AI guided advisory</h2>
              <p className="mt-2 text-sm leading-6 text-violet-700/80">
                Build your AI prompt. You can copy the ai-text and paste into ChatGpt.com or any other AI agents, and continue your dialogue with the AI agent of your choise. You can edit the text, and ask your burning questions; for example “When can I afford a second car, based on the information”
              </p>
              <textarea
                rows={8}
                className="mt-4 w-full rounded-2xl border border-violet-200 bg-white p-4 text-sm leading-6 text-slate-800 outline-none"
                placeholder="Your AI prompt will appear here. You can edit it freely before pasting it into an AI agent."
                value={aiPrompt}
                onChange={(event) => setAiPrompt(event.target.value)}
              />
              <div className="mt-4 flex flex-wrap gap-3">
                <button
                  className="rounded-full bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-700"
                  onClick={() => setAiPrompt(buildAiPrompt())}
                >
                  Build AI prompt
                </button>
                <button
                  className="rounded-full border border-violet-300 px-4 py-2 text-sm font-medium text-violet-700 hover:bg-violet-100"
                  onClick={() => navigator.clipboard?.writeText(aiPrompt)}
                >
                  Copy prompt
                </button>
              </div>
            </div>

            {showWealthPlanner && (
            <div className="mt-4 rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <div>
                  <p className="text-sm font-medium text-slate-500">Assets / liabilities balance overview</p>
                  <h2 className="text-lg font-semibold text-slate-900">Projection to retirement</h2>
                </div>
                <div className="max-w-[16rem] text-right text-sm text-slate-500">Grows from Investments (C) plus your monthly surplus</div>
              </div>
              <div className="mt-5">
                <div ref={assetChartRef} className="h-[320px]" />
              </div>
            </div>
            )}

            {showPensionPlanner && (
            <div className="mt-4 rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <div>
                  <p className="text-sm font-medium text-slate-500">Retirement funds</p>
                  <h2 className="text-lg font-semibold text-slate-900">Until retirement</h2>
                </div>
                <div className="max-w-[16rem] text-right text-sm text-slate-500">Pension pot only — other assets are not drawn down</div>
              </div>
              <div className="mt-5">
                <div ref={retirementChartRef} className="h-[320px]" />
              </div>
            </div>
            )}

            <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-sm font-medium text-slate-500">Planning focus</p>
              <p className="mt-2 text-lg font-semibold text-slate-900">Tailor the outlook to your life stage</p>
              <p className="mt-2 text-sm leading-6 text-slate-600">These assumptions help the planner reflect your personal retirement trajectory.</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  className={`rounded-full px-4 py-2 text-sm font-medium ${showWealthPlanner ? "bg-slate-900 text-white" : "border border-slate-300 text-slate-700"}`}
                  onClick={() => setShowWealthPlanner((value) => !value)}
                >
                  Wealth Planner
                </button>
                <button
                  className={`rounded-full px-4 py-2 text-sm font-medium ${showPensionPlanner ? "bg-slate-900 text-white" : "border border-slate-300 text-slate-700"}`}
                  onClick={() => setShowPensionPlanner((value) => !value)}
                >
                  Pension Planner
                </button>
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <label className="rounded-2xl border border-slate-200 p-3 text-sm text-slate-700">
                  <span className="mb-2 block font-medium">Birth year</span>
                  <input
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none"
                    type="number"
                    value={birthYear}
                    onChange={(event) => setBirthYear(Number(event.target.value || 1980))}
                  />
                </label>
                <label className="rounded-2xl border border-slate-200 p-3 text-sm text-slate-700">
                  <span className="mb-2 block font-medium">Retirement age</span>
                  <input
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none"
                    type="number"
                    value={retirementAge}
                    onChange={(event) => setRetirementAge(Number(event.target.value || 67))}
                  />
                </label>
                <label className="rounded-2xl border border-slate-200 p-3 text-sm text-slate-700">
                  <span className="mb-2 block font-medium">Average yield % pension funds</span>
                  <input
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none"
                    type="text"
                    inputMode="numeric"
                    value={pensionYield}
                    onChange={(event) => setPensionYield(Number(sanitizeNumericPercent(event.target.value) || 0))}
                  />
                </label>
                <label className="rounded-2xl border border-slate-200 p-3 text-sm text-slate-700">
                  <span className="mb-2 block font-medium">Average yield % less liquid assets</span>
                  <input
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none"
                    type="text"
                    inputMode="numeric"
                    value={illiquidYield}
                    onChange={(event) => setIlliquidYield(Number(sanitizeNumericPercent(event.target.value) || 0))}
                  />
                </label>
                <label className="rounded-2xl border border-slate-200 p-3 text-sm text-slate-700">
                  <span className="mb-2 block font-medium">Expected % inflation rate</span>
                  <input
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none"
                    type="text"
                    inputMode="numeric"
                    value={inflationRate}
                    onChange={(event) => setInflationRate(Number(sanitizeNumericPercent(event.target.value) || 0))}
                  />
                </label>
                <label className="rounded-2xl border border-slate-200 p-3 text-sm text-slate-700">
                  <span className="mb-2 block font-medium">Yearly pension savings to retirement</span>
                  <input
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none"
                    type="number"
                    value={yearlyPensionSavings}
                    onChange={(event) => setYearlyPensionSavings(Number(event.target.value || 0))}
                  />
                </label>
              </div>
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
                          <th className="border-b border-slate-200 pb-3 text-right font-medium">Estimated returns</th>
                          <th className="border-b border-slate-200 pb-3 text-right font-medium">Yearly pension savings</th>
                          <th className="border-b border-slate-200 pb-3 text-right font-medium">Yearly spend after inflation</th>
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
                                value={projection.balance}
                                onChange={(event) =>
                                  setProjectionOverrides((current) => ({
                                    ...current,
                                    [projection.year]: Number(event.target.value || 0),
                                  }))
                                }
                              />
                            </td>
                            <td className="py-3 text-right tabular-nums text-slate-900">{projection.returns.toLocaleString("en-US")}</td>
                            <td className="py-3 text-right tabular-nums text-slate-600">{projection.savings ? projection.savings.toLocaleString("en-US") : "—"}</td>
                            <td className="py-3 text-right tabular-nums text-slate-600">{projection.spend ? projection.spend.toLocaleString("en-US") : "—"}</td>
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
                          <th className="border-b border-slate-200 pb-3 text-right font-medium">Estimated returns</th>
                          <th className="border-b border-slate-200 pb-3 text-right font-medium">Cashflow</th>
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
                                value={projection.balance}
                                onChange={(event) => {
                                  const nextValue = Number(event.target.value || 0);
                                  setAssetProjectionOverrides((current) => ({
                                    ...current,
                                    [projection.year]: nextValue,
                                  }));
                                }}
                              />
                            </td>
                            <td className="py-3 text-right tabular-nums text-slate-900">{projection.returns.toLocaleString("en-US")}</td>
                            <td className="py-3 text-right tabular-nums text-slate-600">{projection.cashflow.toLocaleString("en-US")}</td>
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
  meta: {
    key: string;
    title: string;
    blurb: string;
    examples?: string;
    notHere?: string;
    tip?: string;
    placeholder?: string;
  };
  blocks: Blocks;
  updateRow: (blockKey: string, rowId: string, field: keyof Row, value: string) => void;
  addRow: (blockKey: string) => void;
  deleteRow: (blockKey: string, rowId: string) => void;
  toggleComplete: (blockKey: string, rowId: string) => void;
  currency: string;
  showGuide: boolean;
};

function BlockCard({ meta, blocks, updateRow, addRow, deleteRow, toggleComplete, currency, showGuide }: BlockCardProps) {
  const rows = blocks[meta.key] ?? [];
  const isGoalBlock = meta.key === "G";
  const isLiabilityBlock = ["A2", "B2", "C2", "D2"].includes(meta.key);
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
  // The "not here" rule is what turns fourteen categories into a decision tree —
  // give it its own surface so it reads as a rule, not as more description.
  const notHereClasses = isLiabilityBlock
    ? "bg-rose-100/70 text-rose-900"
    : isIncomeBlock
    ? "bg-emerald-100/70 text-emerald-900"
    : isExpenseBlock
    ? "bg-amber-100/70 text-amber-900"
    : isGoalTheme
    ? "bg-sky-100/70 text-sky-900"
    : "bg-slate-100 text-slate-700";

  return (
    <article className={`rounded-[24px] border p-5 shadow-sm ${cardClasses}`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className={`text-sm font-medium ${labelClasses}`}>{meta.key}</p>
          <h3 className={`mt-1 text-lg font-semibold ${titleClasses}`}>{meta.title}</h3>
          {showGuide && <p className={`mt-2 text-sm leading-6 ${blurbClasses}`}>{meta.blurb}</p>}
          {showGuide && meta.examples && (
            <p className="mt-2 text-sm leading-6 text-slate-500">{meta.examples}</p>
          )}
          {showGuide && meta.notHere && (
            <p className={`mt-3 rounded-xl px-3 py-2 text-sm leading-6 ${notHereClasses}`}>{meta.notHere}</p>
          )}
          {showGuide && meta.tip && (
            <p className="mt-2 text-sm italic leading-6 text-slate-500">{meta.tip}</p>
          )}
        </div>
        {!isNoteBlock && (
          <div className={`rounded-full px-3 py-1 text-sm font-medium ${badgeClasses}`}>
            {toCurrency(rows.reduce((total, row) => total + Number(row.value ?? 0), 0), currency)}
          </div>
        )}
      </div>

      <div className="mt-5 space-y-3">
        {rows.map((row) => (
          <div key={row.id} className={`rounded-2xl border p-3 ${isGoalBlock && row.completed ? "border-sky-200 bg-sky-50 opacity-70" : isLiabilityBlock ? "border-rose-200 bg-white/80" : "border-slate-200 bg-slate-50"}`}>
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
                  value={row.detail ?? ""}
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
              <div className={`grid gap-3 ${isGoalBlock ? "md:grid-cols-[auto_1.2fr_0.55fr_0.55fr_auto]" : "md:grid-cols-[1.2fr_0.5fr_auto]"}`}>
                {isGoalBlock && (
                  <label className="flex items-center justify-center">
                    <input
                      type="checkbox"
                      checked={!!row.completed}
                      onChange={() => toggleComplete(meta.key, row.id)}
                      className="h-5 w-5 rounded border-slate-300 accent-sky-600"
                      aria-label="Mark goal complete"
                    />
                  </label>
                )}
                <input
                  className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none"
                  value={row.identifier}
                  onChange={(event) => updateRow(meta.key, row.id, "identifier", event.target.value)}
                  placeholder={isGoalBlock ? "Goal" : meta.placeholder ?? "Identifier"}
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
                {isGoalBlock && (
                  <input
                    className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none max-w-[10rem]"
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={9}
                    value={row.detail ?? ""}
                    onChange={(event) => updateRow(meta.key, row.id, "detail", event.target.value)}
                    placeholder="Status"
                  />
                )}
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

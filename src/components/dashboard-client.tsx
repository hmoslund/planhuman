"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import * as am5 from "@amcharts/amcharts5";
import * as am5xy from "@amcharts/amcharts5/xy";
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";
import { curveMonotoneX } from "d3-shape";
import { calculateWealth, getCountryInfo, normalizeCurrency, CURRENCIES, toCurrency } from "@/lib/wealth";

type Row = { id: string; identifier: string; value: number; detail: string; completed?: boolean };
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

type CountryCode = "US" | "UK" | "DK" | "SE" | "NO" | "FI";

const MAX_ROWS = 400;

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

const blockTranslations: Record<CountryCode, Record<string, { headline: string; subtitle: string }>> = {
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
  FI: {
    A: { headline: "Likvidit varat", subtitle: "Käteinen, säästöt ja helposti käytettävät varat" },
    A2: { headline: "Lyhytaikainen velka", subtitle: "Lyhytaikaiset lainat ja luottotilit" },
    B: { headline: "Lyhytaikaiset saamiset & sidottu säästö", subtitle: "Talletukset, saatavat ja lyhytaikaiset yksityislainat" },
    B2: { headline: "Henkilökohtainen velka & juoksevat velvoitteet", subtitle: "Henkilökohtaiset lainat ja laskut ennen eräpäivää" },
    C: { headline: "Pitkäaikaiset sijoitukset", subtitle: "Osakesalkut, vuokra-asunnot ja vaihtoehtoiset sijoitukset" },
    C2: { headline: "Velka pitkän aikavälin varoihin", subtitle: "Asuntolainat, sijoituslainat ja muut pitkäaikaiset velat" },
    C3: { headline: "Mahdollinen verovelka", subtitle: "Sarakkaista myyntivoitoista syntyvät verovelat" },
    D: { headline: "Asuin- ja elämäntapayksiköt", subtitle: "Asuinrakennukset, autot, korut ja muut henkilökohtaiset varat" },
    D2: { headline: "Asuntolaina & henkilökohtainen velka", subtitle: "Asuntolainat, autolainat ja henkilökohtaiset velat" },
    E: { headline: "Eläke & varaukset", subtitle: "Eläkkeet, säästöt ja turvavaraukset" },
    J: { headline: "Palkka & tulot", subtitle: "Kuukausipalkka, lisätulot ja sijoitustuotot" },
    K: { headline: "Kuukausimenot", subtitle: "Vuokra, ruoka, laskut, vakuutukset ja vapaa-aika" },
    G: { headline: "Tavoitteet", subtitle: "Lyhyen ja pitkän aikavälin tavoitteet ja summat" },
    H: { headline: "Muistiinpanot", subtitle: "Henkilökohtaiset muistiinpanot suunnittelijalle" },
    I: { headline: "Muistiinpanot", subtitle: "Henkilökohtaiset muistiinpanot suunnittelijalle" },
  },
};

function getBlockCopy(key: string, language: CountryCode) {
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
  const [pensionTaxRate, setPensionTaxRate] = useState(25);
  const [projectionOverrides, setProjectionOverrides] = useState<Record<number, number>>({});
  const [assetProjectionOverrides, setAssetProjectionOverrides] = useState<Record<number, number>>({});
  const [smoothingHorizontal, setSmoothingHorizontal] = useState(0.5);
  const [smoothingVertical, setSmoothingVertical] = useState(0.5);
  const [strokeWidth, setStrokeWidth] = useState(3);
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
      if (typeof s.pensionTaxRate === "number") setPensionTaxRate(s.pensionTaxRate);
      if (typeof s.smoothingHorizontal === "number") setSmoothingHorizontal(s.smoothingHorizontal);
      if (typeof s.smoothingVertical === "number") setSmoothingVertical(s.smoothingVertical);
      if (typeof s.strokeWidth === "number") setStrokeWidth(s.strokeWidth);
      if (typeof s.showWealthPlanner === "boolean") setShowWealthPlanner(s.showWealthPlanner);
      if (typeof s.showPensionPlanner === "boolean") setShowPensionPlanner(s.showPensionPlanner);
    }

    loadData();
  }, [router]);

  const summary = useMemo(() => calculateWealth(blocks), [blocks]);
  const topGoals = useMemo(() => (blocks.G ?? []).slice(0, 5), [blocks]);

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
  const row5 = translatedBlockMeta.filter(({ key }) => ["G"].includes(key));

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
          pensionTaxRate,
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
                {user?.country ?? "DK"} • {currency} • {user?.email ?? ""}
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
            <div className="flex gap-3">
              <button className="rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white" onClick={saveRecord} disabled={saving}>
                {saving ? "Saving..." : "Save record"}
              </button>
            </div>
          </div>

          {message && <p className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700">{message}</p>}

          <div className="rounded-[24px] border border-sky-200 bg-sky-50 p-5 shadow-sm">
            <p className="text-sm font-medium text-sky-700">Wealth blocks guide</p>
            <h2 className="mt-1 text-lg font-semibold text-slate-900">How to fill in your wealth blocks</h2>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <p className="text-sm leading-6 text-slate-600">
                <span className="font-semibold text-slate-800">Assets (left blocks):</span> in each row, type the
                name of the asset on the first line and its value on the second. For a stock, for example, write{" "}
                <span className="font-medium text-slate-700">Apple Ltd.</span> as the name and what you own (shares,
                amount) as the value.
              </p>
              <p className="text-sm leading-6 text-slate-600">
                <span className="font-semibold text-slate-800">Debt blocks (right side):</span> type the name of the
                credit company on the first line and the amount owed plus its interest rate on the second. For example{" "}
                <span className="font-medium text-slate-700">Bank of America 4%</span>.
              </p>
              <p className="text-sm leading-6 text-slate-600">
                <span className="font-semibold text-slate-800">Income &amp; expenses:</span> use monthly amounts, for
                instance your net salary or rent. Goals can include a target value and a progress amount.
              </p>
              <p className="text-sm leading-6 text-slate-600">
                You can add as many rows as you need with the <span className="font-medium text-slate-700">Add row</span>{" "}
                button on each block. Nothing is kept until you press{" "}
                <span className="font-medium text-slate-700">Save record</span> at the top.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <div className="grid gap-4 xl:grid-cols-2">
              {row1.map((meta) => (
                <BlockCard key={meta.key} meta={meta} blocks={blocks} updateRow={updateRow} addRow={addRow} deleteRow={deleteRow} toggleComplete={toggleComplete} currency={currency} />
              ))}
            </div>
            <div className="grid gap-4 xl:grid-cols-2">
              {row2.map((meta) => (
                <BlockCard key={meta.key} meta={meta} blocks={blocks} updateRow={updateRow} addRow={addRow} deleteRow={deleteRow} toggleComplete={toggleComplete} currency={currency} />
              ))}
            </div>
            <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
              <div className="grid gap-4">
                {row3.map((meta) => (
                  <BlockCard key={meta.key} meta={meta} blocks={blocks} updateRow={updateRow} addRow={addRow} deleteRow={deleteRow} toggleComplete={toggleComplete} currency={currency} />
                ))}
              </div>
            </div>
            
            <div className="grid gap-4 xl:grid-cols-2">
              {row4.map((meta) => (
                <BlockCard key={meta.key} meta={meta} blocks={blocks} updateRow={updateRow} addRow={addRow} deleteRow={deleteRow} toggleComplete={toggleComplete} currency={currency} />
              ))}
            </div>
            <div className="grid gap-4">
              {row5.map((meta) => (
                <BlockCard key={meta.key} meta={meta} blocks={blocks} updateRow={updateRow} addRow={addRow} deleteRow={deleteRow} toggleComplete={toggleComplete} currency={currency} />
              ))}
            </div>

            {/* AI guided advisory */}
            <div className="mt-2 rounded-[24px] border border-violet-200 bg-violet-50 p-5 shadow-sm">
              <p className="text-sm font-medium text-violet-500">AI</p>
              <h2 className="mt-1 text-lg font-semibold text-violet-900">AI guided advisory</h2>
              <p className="mt-2 text-sm leading-6 text-violet-700/80">
                Build your AI prompt, copy the ai-text and paste into ChatGpt.com or any other AI agents.
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
                <div className="text-sm text-slate-500">Pension and reserves</div>
              </div>
              <div className="mt-5">
                <div ref={assetChartRef} className="h-[320px]" />
              </div>
              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                <label className="space-y-2 text-sm text-slate-600">
                  <span className="font-medium text-slate-900">Horizontal smoothing</span>
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.05}
                    value={smoothingHorizontal}
                    onChange={(event) => setSmoothingHorizontal(Number(event.target.value))}
                    className="w-full"
                  />
                </label>
                <label className="space-y-2 text-sm text-slate-600">
                  <span className="font-medium text-slate-900">Vertical smoothing</span>
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.05}
                    value={smoothingVertical}
                    onChange={(event) => setSmoothingVertical(Number(event.target.value))}
                    className="w-full"
                  />
                </label>
                <label className="space-y-2 text-sm text-slate-600">
                  <span className="font-medium text-slate-900">Stroke width</span>
                  <input
                    type="range"
                    min={1}
                    max={8}
                    step={1}
                    value={strokeWidth}
                    onChange={(event) => setStrokeWidth(Number(event.target.value))}
                    className="w-full"
                  />
                </label>
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
                <div className="text-sm text-slate-500">Pension and reserves</div>
              </div>
              <div className="mt-5">
                <div ref={retirementChartRef} className="h-[320px]" />
              </div>
              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                <label className="space-y-2 text-sm text-slate-600">
                  <span className="font-medium text-slate-900">Horizontal smoothing</span>
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.05}
                    value={smoothingHorizontal}
                    onChange={(event) => setSmoothingHorizontal(Number(event.target.value))}
                    className="w-full"
                  />
                </label>
                <label className="space-y-2 text-sm text-slate-600">
                  <span className="font-medium text-slate-900">Vertical smoothing</span>
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.05}
                    value={smoothingVertical}
                    onChange={(event) => setSmoothingVertical(Number(event.target.value))}
                    className="w-full"
                  />
                </label>
                <label className="space-y-2 text-sm text-slate-600">
                  <span className="font-medium text-slate-900">Stroke width</span>
                  <input
                    type="range"
                    min={1}
                    max={8}
                    step={1}
                    value={strokeWidth}
                    onChange={(event) => setStrokeWidth(Number(event.target.value))}
                    className="w-full"
                  />
                </label>
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
                <label className="rounded-2xl border border-slate-200 p-3 text-sm text-slate-700">
                  <span className="mb-2 block font-medium">Expected tax rate pension funds</span>
                  <input
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none"
                    type="text"
                    inputMode="numeric"
                    value={pensionTaxRate}
                    onChange={(event) => setPensionTaxRate(Number(sanitizeNumericPercent(event.target.value) || 0))}
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
  meta: { key: string; title: string; blurb: string };
  blocks: Blocks;
  updateRow: (blockKey: string, rowId: string, field: keyof Row, value: string) => void;
  addRow: (blockKey: string) => void;
  deleteRow: (blockKey: string, rowId: string) => void;
  toggleComplete: (blockKey: string, rowId: string) => void;
  currency: string;
};

function BlockCard({ meta, blocks, updateRow, addRow, deleteRow, toggleComplete, currency }: BlockCardProps) {
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
              <div className={`grid gap-3 ${isGoalBlock ? "md:grid-cols-[auto_1.2fr_0.55fr_0.55fr_auto]" : "md:grid-cols-[1.3fr_0.55fr_auto]"}`}>
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

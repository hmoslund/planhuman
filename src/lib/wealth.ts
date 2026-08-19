export function createDefaultBlocks() {
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
    J: [],
    K: [],
    L: [],
    G: [],
  };
}

export const DEFAULT_SETTINGS = {
  birthYear: 1980,
  retirementAge: 67,
  pensionYield: 5,
  illiquidYield: 4,
  inflationRate: 2,
  yearlyPensionSavings: 10000,
  pensionTaxRate: 25,
  smoothingHorizontal: 0.5,
  smoothingVertical: 0.5,
  strokeWidth: 3,
  showWealthPlanner: true,
  showPensionPlanner: true,
};

export type PlannerSettings = typeof DEFAULT_SETTINGS;

export const CURRENCIES = ["USD", "EUR", "GBP", "DKK", "SEK", "NOK"] as const;

export function normalizeBlockRows(blockRows: Array<{ value?: number | null }> = []) {
  return blockRows.map((row) => ({
    ...row,
    value: Math.round(Number(row.value ?? 0) / 100) * 100,
  }));
}

export function getCurrency(country: string) {
  if (country === "US") return "USD";
  if (country === "UK") return "GBP";
  if (country === "FI") return "EUR";
  if (country === "DK") return "DKK";
  if (country === "SE") return "SEK";
  if (country === "NO") return "NOK";
  return country.toUpperCase();
}

export function normalizeCurrency(currency: string) {
  const upper = String(currency || "").trim().toUpperCase();
  if ((CURRENCIES as readonly string[]).includes(upper)) return upper;
  // legacy values used before currency became user-selectable
  if (upper === "DKR" || upper === "KR") return "DKK";
  return "DKK";
}

export const COUNTRY_LANGUAGE: Record<string, { name: string; language: string }> = {
  US: { name: "United States", language: "English" },
  UK: { name: "United Kingdom", language: "English" },
  DK: { name: "Denmark", language: "Danish" },
  SE: { name: "Sweden", language: "Swedish" },
  NO: { name: "Norway", language: "Norwegian" },
  FI: { name: "Finland", language: "Finnish" },
};

export function getCountryInfo(country: string) {
  return (
    COUNTRY_LANGUAGE[String(country).toUpperCase()] ?? {
      name: String(country).toUpperCase(),
      language: "English",
    }
  );
}

export function calculateWealth(blocks: Record<string, Array<{ value?: number | null }>>) {
  const sum = (key: string) =>
    (blocks[key] ?? []).reduce((total, row) => total + Number(row.value ?? 0), 0);

  const assets = sum("A") + sum("B") + sum("C") + sum("D") + sum("E");
  const liabilities = sum("A2") + sum("B2") + sum("C2") + sum("C3") + sum("D2");
  const cashflow = sum("J") - sum("K");
  const netWorth = assets - liabilities;

  return {
    assets,
    liabilities,
    cashflow,
    netWorth,
  };
}

export function toCurrency(value: number, currency: string) {
  return `${currency}${value.toLocaleString("en-US")}`;
}

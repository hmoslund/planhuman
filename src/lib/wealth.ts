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
  if (country === "DK") return "DKR";
  if (country === "SE") return "SEK";
  if (country === "NO") return "NOK";
  return country.toUpperCase();
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

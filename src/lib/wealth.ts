export function createDefaultBlocks() {
  const makeId = () => globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`;

  return {
    A: [{ id: makeId(), identifier: "Example", value: 1000, detail: "Example text" }],
    A2: [{ id: makeId(), identifier: "Example", value: 1000, detail: "Example text" }],
    B: [{ id: makeId(), identifier: "Example", value: 1000, detail: "Example text" }],
    B2: [{ id: makeId(), identifier: "Example", value: 1000, detail: "Example text" }],
    C: [{ id: makeId(), identifier: "Example", value: 1000, detail: "Example text" }],
    C2: [{ id: makeId(), identifier: "Example", value: 1000, detail: "Example text" }],
    C3: [{ id: makeId(), identifier: "Example", value: 1000, detail: "Example text" }],
    D: [{ id: makeId(), identifier: "Example", value: 1000, detail: "Example text" }],
    D2: [{ id: makeId(), identifier: "Example", value: 1000, detail: "Example text" }],
    E: [{ id: makeId(), identifier: "Example", value: 1000, detail: "Example text" }],
    J: [{ id: makeId(), identifier: "Salary", value: 10000, detail: "Example income" }],
    K: [{ id: makeId(), identifier: "Expenses", value: 4000, detail: "Example expense" }],
    L: [{ id: makeId(), identifier: "Savings", value: 2000, detail: "Example savings" }],
    G: [{ id: makeId(), identifier: "Home upgrade", value: 500000, detail: "280000" }],
  };
}

export function normalizeBlockRows(blockRows: Array<{ value?: number | null }> = []) {
  return blockRows.map((row) => ({
    ...row,
    value: Math.round(Number(row.value ?? 0) / 100) * 100,
  }));
}

export function getCurrency(country: string) {
  if (country === "UK") return "£";
  if (country === "FI") return "€";
  return "kr";
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

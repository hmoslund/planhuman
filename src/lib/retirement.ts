// Pure, typed projections for retirement-income planning.
//
// Everything here is a plain function over plain data — no React, no amCharts —
// so the Retirement table and the "Retirement income vs. spending" chart can
// share exactly the same numbers.

/** First year the projection tables chart (kept hardcoded, as the tables have always done). */
export const PROJECTION_START_YEAR = 2027;

/** The retirement-income chart runs until the user turns this age. */
export const CHART_END_AGE = 85;

/** The pension rows of block E, described only by the fields income depends on. */
export type PensionPayoutRow = {
  value: number;
  pensionType?: "drawdown" | "annuity" | null;
  payoutStartAge?: number;
  payoutYears?: number | "lifelong";
  annualPayout?: number;
};

/**
 * Yearly spending in today's money, compounded from `fromYear` to `toYear`.
 * Used by the pension projection's post-retirement balance draw-down (base: block K
 * outgoings) and by the retirement-income chart's spending line (base: the PF Planning
 * focus retirement-spend assumption) — the same inflation maths over each caller's own
 * base amount.
 */
export function inflatedYearlySpend(
  baseYearlySpend: number,
  inflationRatePct: number,
  fromYear: number,
  toYear: number
): number {
  const years = Math.max(toYear - fromYear, 0);
  return baseYearlySpend * Math.pow(1 + inflationRatePct / 100, years);
}

/**
 * Grow a single pension pot from PROJECTION_START_YEAR to `targetYear` using the
 * pension yield, adding the yearly pension savings for every year through the
 * retirement year — the same rule the Retirement table uses for its savings
 * column (flat default, overridable per year). After retirement no savings are
 * added; the balance simply keeps compounding until the payout starts.
 * A target at or before PROJECTION_START_YEAR returns the balance untouched.
 */
export function projectPensionBalanceToYear(input: {
  balance: number;
  targetYear: number;
  pensionYieldPct: number;
  retirementYear: number;
  yearlyPensionSavings: number;
  pensionSavingsOverrides: Record<number, number>;
  startYear?: number;
}): number {
  const startYear = input.startYear ?? PROJECTION_START_YEAR;
  const rate = input.pensionYieldPct / 100;
  let balance = input.balance;

  for (let year = startYear; year < input.targetYear; year++) {
    const returns = balance * rate;
    const savings =
      year <= input.retirementYear
        ? input.pensionSavingsOverrides[year] ?? input.yearlyPensionSavings
        : 0;
    balance = balance + returns + savings;
  }

  return balance;
}

/**
 * Fixed yearly payment that exhausts `balance` over `payoutYears` at `annualRatePct`:
 * payment = B·r / (1 − (1+r)^−n), and B/n when the rate is zero.
 */
export function levelAnnuityPayment(
  balance: number,
  annualRatePct: number,
  payoutYears: number
): number {
  const n = Math.floor(payoutYears);
  if (!Number.isFinite(balance) || balance <= 0 || !Number.isFinite(n) || n <= 0) return 0;
  const r = annualRatePct / 100;
  if (r === 0) return balance / n;
  return (balance * r) / (1 - Math.pow(1 + r, -n));
}

/** A row only takes part in the income chart once both type and start age are set. */
export function isPensionPayoutConfigured(row: PensionPayoutRow): boolean {
  return Boolean(row.pensionType) && typeof row.payoutStartAge === "number" && row.payoutStartAge > 0;
}

export type RetirementIncomeInput = {
  pensionRows: PensionPayoutRow[];
  /** Total of block C (investments) as of today — the pot that funds unfunded years. */
  investmentBalance: number;
  /**
   * Expected yearly spend in today's money — the PF Planning focus retirement-spend
   * assumption (monthly × 12), falling back to block K monthly outgoings × 12 while
   * the user hasn't set one. Drives the chart's spending line and its gap.
   */
  yearlyExpenses: number;
  birthYear: number;
  retirementAge: number;
  /** "Today" — the year expense figures are expressed in. */
  currentYear: number;
  pensionYieldPct: number;
  inflationRatePct: number;
  pensionTaxRatePct: number;
  /** true = apply the pension tax rate to annuity and drawdown income (default). */
  afterTax: boolean;
  yearlyPensionSavings: number;
  pensionSavingsOverrides: Record<number, number>;
};

export type RetirementIncomeYear = {
  year: number;
  age: number;
  /** Annuity payouts (after tax when afterTax). */
  annuity: number;
  /** Drawdown pensions converted to a level payment (after tax when afterTax). */
  drawdown: number;
  /** Invested savings drawn to cover this year's unfunded spending — never taxed; limited by what is left of the pot. */
  investmentSpend: number;
  /**
   * Pension surplus arriving from earlier years — re-pushed forward when this year
   * still runs a surplus, otherwise it is what finances this year before the pot.
   */
  carriedIn: number;
  totalIncome: number;
  /** Expected yearly spend (PF Planning focus), compounded with inflation until that year. */
  spending: number;
  /**
   * pensions after tax + carriedIn + investmentSpend − spending.
   * 0 = fully financed, positive = surplus pushed to later years,
   * negative = the investment pot ran out before the spending was covered.
   */
  gap: number;
};

/**
 * Build one row per chart year: retirement year (birth year + retirement age)
 * through the year the user turns 85. Returns an empty array when the
 * retirement age is 85 or later.
 *
 * Funding after retirement — each year's spending is financed in this order:
 *   1. pensions after tax,
 *   2. any surplus pushed forward from earlier years,
 *   3. only the remainder out of the investments, never more than the pot has left.
 * A year whose pensions (plus carried-in surplus) already cover the spending draws
 * nothing from the investments; its whole leftover is pushed to the next year that
 * runs a deficit.
 */
export function buildRetirementIncomeSeries(input: RetirementIncomeInput): RetirementIncomeYear[] {
  const retirementYear = input.birthYear + input.retirementAge;
  const startYear = retirementYear;
  const endYear = input.birthYear + CHART_END_AGE;
  if (endYear < startYear) return [];

  const taxFactor = input.afterTax
    ? 1 - Math.min(Math.max(input.pensionTaxRatePct, 0), 100) / 100
    : 1;

  // Precompute each configured row's fixed yearly income and active age window.
  const streams = input.pensionRows
    .filter(isPensionPayoutConfigured)
    .map((row) => {
      const startAge = row.payoutStartAge as number;
      const endAge = payoutEndAge(startAge, row.payoutYears);
      let yearly = 0;
      if (row.pensionType === "annuity") {
        yearly = Number(row.annualPayout) > 0 ? Number(row.annualPayout) : 0;
      } else {
        // Drawdown: compound the pot (yield + yearly savings until retirement) to
        // the payout start age, then convert it to a level payment over the window.
        const balanceAtStart = projectPensionBalanceToYear({
          balance: Number(row.value) || 0,
          targetYear: input.birthYear + startAge,
          pensionYieldPct: input.pensionYieldPct,
          retirementYear,
          yearlyPensionSavings: input.yearlyPensionSavings,
          pensionSavingsOverrides: input.pensionSavingsOverrides,
        });
        yearly = levelAnnuityPayment(balanceAtStart, input.pensionYieldPct, endAge - startAge);
      }
      return { kind: row.pensionType as "annuity" | "drawdown", startAge, endAge, yearly };
    });

  const rows: RetirementIncomeYear[] = [];
  let investmentRemaining = Math.max(input.investmentBalance, 0);
  // Pension surplus pushed forward from earlier years, spent down before the pot is.
  let carriedForward = 0;

  for (let year = startYear; year <= endYear; year++) {
    const age = year - input.birthYear;

    let annuityRaw = 0;
    let drawdownRaw = 0;
    for (const stream of streams) {
      if (age < stream.startAge || age >= stream.endAge) continue;
      if (stream.kind === "annuity") annuityRaw += stream.yearly;
      else drawdownRaw += stream.yearly;
    }
    const annuity = Math.round(annuityRaw * taxFactor);
    const drawdown = Math.round(drawdownRaw * taxFactor);

    const spending = Math.round(
      inflatedYearlySpend(input.yearlyExpenses, input.inflationRatePct, input.currentYear, year)
    );

    // Funding order: pensions after tax, then the surplus pushed forward from earlier
    // years, then the investments — and only as much of the remainder as the pot still
    // has left.
    const carriedIn = carriedForward;
    const pensionAfterTax = annuity + drawdown;
    const net = pensionAfterTax + carriedIn - spending;
    let spendFromInvestments = 0;
    if (net >= 0) {
      // Pensions (plus what earlier years pushed forward) already cover this year:
      // no investment draw — the whole leftover is pushed to the next deficit year.
      carriedForward = net;
    } else {
      carriedForward = 0;
      spendFromInvestments = Math.round(Math.min(-net, investmentRemaining));
      investmentRemaining = Math.max(investmentRemaining - spendFromInvestments, 0);
    }

    const totalIncome = annuity + drawdown + spendFromInvestments;

    rows.push({
      year,
      age,
      annuity,
      drawdown,
      investmentSpend: spendFromInvestments,
      carriedIn,
      totalIncome,
      spending,
      gap: net + spendFromInvestments,
    });
  }

  return rows;
}

/**
 * Exclusive end age of a row's payout window. Missing or "lifelong" payout years
 * run past the last charted age, so the income continues through age 85.
 */
function payoutEndAge(startAge: number, payoutYears: number | "lifelong" | undefined): number {
  if (typeof payoutYears === "number" && Number.isFinite(payoutYears) && payoutYears > 0) {
    return startAge + Math.floor(payoutYears);
  }
  return CHART_END_AGE + 1;
}

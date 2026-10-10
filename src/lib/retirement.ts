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
  /** Block E row id — the stable key that ties a drawdown fund to its chart series. */
  id?: string;
  /** Block E name column — shown in the chart legend for that fund. */
  identifier?: string;
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
 * A gross (before-tax) pension amount less the "Expected tax rate pension funds" from
 * PF Planning focus — the single rule used by the funding table's after-tax total and
 * by the retirement-income chart's after-tax columns, so the two can never disagree.
 */
export function afterTaxAmount(gross: number, pensionTaxRatePct: number): number {
  const rate = Math.min(Math.max(pensionTaxRatePct, 0), 100) / 100;
  return Math.round(gross * (1 - rate));
}

/**
 * Level yearly payment that exhausts `balance` over `payoutYears` at `annualRatePct`,
 * paid at the *start* of each year (annuity due):
 *   V = C ÷ ([1 − (1+i)^−n] / i × (1+i)), and C/n when the rate is zero.
 * Dividing by the present value of the annuity-due is what turns a start amount into
 * the payment it can fund; multiplying by that factor would not be a payout at all.
 */
export function levelAnnuityDuePayment(
  balance: number,
  annualRatePct: number,
  payoutYears: number
): number {
  const n = Math.floor(payoutYears);
  if (!Number.isFinite(balance) || balance <= 0 || !Number.isFinite(n) || n <= 0) return 0;
  const i = annualRatePct / 100;
  if (i === 0) return balance / n;
  const presentValueFactor = ((1 - Math.pow(1 + i, -n)) / i) * (1 + i);
  return balance / presentValueFactor;
}

/** A pension only takes part once both its type and its payout start age are set. */
export function isPensionPayoutConfigured(row: PensionPayoutRow): boolean {
  return Boolean(row.pensionType) && typeof row.payoutStartAge === "number" && row.payoutStartAge > 0;
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

/**
 * Funding overview — one row per year from the retirement year to age 85, showing how
 * the pensions and the investment funds pay the living expenses. This is the single
 * source behind both the "Funding after retirement" table and the retirement-income
 * chart.
 *
 *   • Start amount — each block E balance is projected to its payout year:
 *     FV = PV × (1 + yield)^years, yield = "Average yield % pension funds".
 *   • Drawdown payout — that start amount becomes the level payout of the annuity-due
 *     payment formula, over that pension's own payout years, at the same yield.
 *   • Annuity payout — the entered yearly payment, increased with "Expected % inflation
 *     rate" from today to the year it is paid.
 *   • Additional pension contribution — the Retirement table's yearly savings,
 *     compounded to its payout start year, paid out as one more drawdown pension.
 *   • Spending — today's expected monthly spend × 12, moved to the retirement year with
 *     inflation and then compounded year over year.
 *   • Tax — each year's pension total (before tax) is reduced once by "Expected tax rate
 *     pension funds"; that after-tax total is what the year is funded with.
 *   • Investments — today's block C total grows with "Average yield % less liquid assets"
 *     each year; whenever (pensions after tax − yearly spend) is negative, exactly that
 *     amount is drawn from it — never more than it holds.
 */
export function buildRetirementFundingOverview(input: FundingOverviewInput): FundingOverviewResult {
  const retirementYear = input.birthYear + input.retirementAge;
  const startYear = retirementYear;
  const endYear = input.birthYear + CHART_END_AGE;
  const untouchedPot = Math.max(input.investmentBalance, 0);
  if (endYear < startYear) return { funds: [], rows: [], unspentInvestmentFunds: untouchedPot };

  // "Expected tax rate pension funds" from PF Planning focus, taken off the pension
  // total — funding always works on what the pensions are actually worth after tax.
  const taxRate = Math.min(Math.max(input.pensionTaxRatePct, 0), 100) / 100;
  const pensionRate = input.pensionYieldPct / 100;
  const investmentRate = input.investmentYieldPct / 100;
  const inflationRate = input.inflationRatePct / 100;

  type PensionFund = FundingOverviewFund & {
    /** Inclusive start age; the fund pays for ages startAge … endAge − 1. */
    startAge: number;
    endAge: number;
    /** Payout before the per-year inflation/tax adjustments below. */
    yearly: number;
    /** true = grow `yearly` with inflation from currentYear (annuity contracts). */
    inflate: boolean;
  };

  const pensionFunds: PensionFund[] = [];

  input.pensionRows.filter(isPensionPayoutConfigured).forEach((row, index) => {
    const startAge = row.payoutStartAge as number;
    const endAge = payoutEndAge(startAge, row.payoutYears);
    const key = row.id ?? `row-${index}`;
    const name =
      (row.identifier ?? "").trim() || (row.pensionType === "annuity" ? "Annuity pension" : "Drawdown pension");

    if (row.pensionType === "annuity") {
      pensionFunds.push({
        key,
        name,
        startAge,
        endAge,
        yearly: Number(row.annualPayout) > 0 ? Number(row.annualPayout) : 0,
        inflate: true,
      });
      return;
    }

    // Start amount: today's balance projected to the payout year — FV = PV (1 + yield)^years.
    const years = input.birthYear + startAge - input.currentYear;
    const startAmount = (Number(row.value) || 0) * Math.pow(1 + pensionRate, years);
    pensionFunds.push({
      key,
      name,
      startAge,
      endAge,
      yearly: levelAnnuityDuePayment(startAmount, input.pensionYieldPct, endAge - startAge),
      inflate: false,
    });
  });

  // Additional pension contribution: the Retirement table's yearly savings compounded to
  // the payout start year, then paid out as one more drawdown pension.
  const additionalStartAge = input.additionalPension.payoutStartAge;
  const additionalPayoutYears = Math.max(Math.floor(input.additionalPension.payoutYears), 0);
  if (Number.isFinite(additionalStartAge) && additionalStartAge > 0 && additionalPayoutYears > 0) {
    const startAmount = projectPensionBalanceToYear({
      balance: 0,
      targetYear: input.birthYear + additionalStartAge,
      pensionYieldPct: input.pensionYieldPct,
      retirementYear,
      yearlyPensionSavings: input.additionalPension.yearlySavings,
      pensionSavingsOverrides: input.additionalPension.savingsOverrides,
    });
    pensionFunds.push({
      key: "additional-pension",
      name: "Additional pension contribution",
      startAge: additionalStartAge,
      endAge: additionalStartAge + additionalPayoutYears,
      yearly: levelAnnuityDuePayment(startAmount, input.pensionYieldPct, additionalPayoutYears),
      inflate: false,
    });
  }

  const rows: FundingOverviewYear[] = [];
  let investmentFunds = untouchedPot;

  for (let year = startYear; year <= endYear; year++) {
    const age = year - input.birthYear;

    // Each fund pays its gross (before-tax) amount; the tax is taken once, on the
    // total, so "pension total after tax" is exactly the total less the PF tax rate.
    const payouts = pensionFunds
      .filter((fund) => age >= fund.startAge && age < fund.endAge)
      .map((fund) => {
        const payment = fund.inflate
          ? fund.yearly * Math.pow(1 + inflationRate, year - input.currentYear)
          : fund.yearly;
        return { key: fund.key, name: fund.name, amount: Math.round(payment) };
      });
    const pensionsTotal = payouts.reduce((sum, payout) => sum + payout.amount, 0);
    const pensionTotalAfterTax = Math.round(pensionsTotal * (1 - taxRate));
    const spending = Math.round(
      inflatedYearlySpend(input.yearlyExpenses, input.inflationRatePct, input.currentYear, year)
    );

    // Funding rule: as soon as (pensions after tax − yearly spend) is negative, the
    // missing amount is drawn from the investment funds — never more than they hold.
    // They grow with the planning-block yield first; an untouched surplus simply stays
    // invested and keeps growing.
    investmentFunds = investmentFunds * (1 + investmentRate);
    const needed = Math.max(spending - pensionTotalAfterTax, 0);
    const fromInvestments = Math.round(Math.min(needed, investmentFunds));
    investmentFunds = Math.max(investmentFunds - fromInvestments, 0);

    rows.push({
      year,
      age,
      payouts,
      pensionsTotal,
      pensionTotalAfterTax,
      spending,
      fromInvestments,
      unfunded: Math.max(spending - pensionTotalAfterTax - fromInvestments, 0),
      investmentFundsLeft: Math.round(investmentFunds),
    });
  }

  return {
    funds: pensionFunds.map(({ key, name }) => ({ key, name })),
    rows,
    unspentInvestmentFunds: Math.round(investmentFunds),
  };
}

/** One column of the funding table: a pension, or the additional contribution. */
export type FundingOverviewFund = { key: string; name: string };

/** The extra drawdown pension built from the Retirement table's savings column. */
export type AdditionalPensionInput = {
  /** Flat "Yearly pension savings to retirement" from PF Planning focus. */
  yearlySavings: number;
  /** Per-year overrides edited directly in the Retirement table. */
  savingsOverrides: Record<number, number>;
  /** Payout start age — PF Planning focus "from age" (default: the year after retirement). */
  payoutStartAge: number;
  /** Number of payouts — PF Planning focus "years" (default: run until age 85). */
  payoutYears: number;
};

export type FundingOverviewInput = {
  pensionRows: PensionPayoutRow[];
  /** Today's total of block C — grows with `investmentYieldPct` and funds any gap. */
  investmentBalance: number;
  /** "Average yield % less liquid assets" from PF Planning focus. */
  investmentYieldPct: number;
  /** Expected monthly spend after retirement × 12, in today's money. */
  yearlyExpenses: number;
  birthYear: number;
  retirementAge: number;
  /** "Today" — the year today's amounts are expressed in. */
  currentYear: number;
  /** "Average yield % pension funds" from PF Planning focus. */
  pensionYieldPct: number;
  inflationRatePct: number;
  /** "Expected tax rate pension funds" from PF Planning focus. */
  pensionTaxRatePct: number;
  additionalPension: AdditionalPensionInput;
};

export type FundingOverviewYear = {
  year: number;
  age: number;
  /** Per fund, before tax; a fund outside its payout window is omitted. */
  payouts: Array<{ key: string; name: string; amount: number }>;
  /** Sum of `payouts`, before tax. */
  pensionsTotal: number;
  /** `pensionsTotal` less the "Expected tax rate pension funds" from PF Planning focus. */
  pensionTotalAfterTax: number;
  /** Inflation-adjusted spending for this year. */
  spending: number;
  /** Drawn from the investment funds: the negative part of (after tax − spending). */
  fromInvestments: number;
  /** What neither the pensions nor the investment funds could cover. */
  unfunded: number;
  /** Investment funds left after this year's draw. */
  investmentFundsLeft: number;
};

export type FundingOverviewResult = {
  /** One table column per pension (block E order), then the additional contribution. */
  funds: FundingOverviewFund[];
  rows: FundingOverviewYear[];
  /** Investment funds left after the last charted year (age 85). */
  unspentInvestmentFunds: number;
};


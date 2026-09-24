// Static, structural reference facts for the AI-prompt template (src/components/dashboard-client.tsx,
// buildAiPrompt). This is never sent to an AI/LLM by PlanHumans itself — it's assembled into a plain
// text block the user copies and pastes into ChatGPT or another tool of their choice.
//
// Deliberately limited to slow-changing structural facts (what a pension/account is called, roughly
// how retirement age works) rather than volatile numbers like today's inflation rate or fund yields —
// those go stale immediately and the prompt template asks the receiving LLM to estimate them itself
// (Section 6), with an explicit "use your own general knowledge, be approximate" instruction, since
// PlanHumans has no live economic data source to draw on.
export type CountryFacts = {
  facts: string;
  localTerms: string;
};

export const COUNTRY_FACTS: Record<string, CountryFacts> = {
  US: {
    facts:
      "- Public pension: Social Security (full retirement age 66-67 depending on birth year; reduced benefits available from 62).\n" +
      "- Common retirement accounts: 401(k) / Roth 401(k) via an employer, IRA / Roth IRA held individually, HSA for healthcare costs.\n" +
      "- No wealth tax. Capital gains and dividends in a regular (taxable) brokerage account are taxed annually.\n" +
      "- Mortgage interest on a primary residence may be tax-deductible; a large capital-gains exclusion applies when selling a primary home.",
    localTerms: "Social Security, 401(k), Roth IRA, Traditional IRA, HSA, FICA",
  },
  UK: {
    facts:
      "- Public pension: the State Pension (State Pension age currently 66, rising to 67).\n" +
      "- Common retirement accounts: workplace pension (auto-enrolment, employer + employee contributions), SIPP (Self-Invested Personal Pension) held individually.\n" +
      "- ISA (Individual Savings Account) shelters savings and investments from tax up to an annual allowance; a LISA (Lifetime ISA) adds a government bonus for a first home or retirement.\n" +
      "- No general wealth tax. Capital Gains Tax and Inheritance Tax apply above their respective allowances.",
    localTerms: "State Pension, workplace pension, SIPP, ISA, LISA, National Insurance",
  },
  DK: {
    facts:
      "- Public pension: Folkepension (state pension), topped up by ATP (Arbejdsmarkedets Tillægspension), a mandatory supplementary scheme.\n" +
      "- Most employees also have an Arbejdsmarkedspension (occupational pension) paid via their employer or union agreement.\n" +
      "- Individual pension savings: Ratepension (paid out over a fixed number of years) and Aldersopsparing (tax-free up to an annual cap).\n" +
      "- Folkepensionsalderen (state pension age) is currently around 67-69 depending on birth year and rises with life expectancy.",
    localTerms: "Folkepension, ATP, Arbejdsmarkedspension, Ratepension, Aldersopsparing",
  },
  SE: {
    facts:
      "- Public pension (Allmän pension) has two parts: Inkomstpension (income-based) and Premiepension (the individual chooses funds).\n" +
      "- Most employees also have a Tjänstepension (occupational pension) via their employer, e.g. ITP.\n" +
      "- ISK (Investeringssparkonto) is a flat-tax investment account widely used for individual saving; Kapitalförsäkring is a similar wrapper offered by insurers.\n" +
      "- The guaranteed pension age is rising gradually; most people can currently draw a pension from around 63, with a higher age for the full guarantee pension.",
    localTerms: "Allmän pension, Premiepension, Tjänstepension, ISK, Kapitalförsäkring",
  },
  NO: {
    facts:
      "- Public pension: Folketrygden (National Insurance Scheme).\n" +
      "- Employers must provide an occupational pension, Obligatorisk tjenestepensjon (OTP).\n" +
      "- Individual pension/investment savings: IPS (Individuell pensjonssparing, tax-favoured) and Aksjesparekonto/ASK (share savings account, tax on gains deferred until withdrawal).\n" +
      "- Pension can typically be drawn flexibly from age 62 (reduced) up to 75, with 67 as a common reference age.",
    localTerms: "Folketrygden, OTP, IPS, Aksjesparekonto (ASK)",
  },
  FI: {
    facts:
      "- Statutory earnings-related pension (työeläke) covers most of what other countries split into 'public' and 'employer' pensions, administered by pension insurance companies.\n" +
      "- Kansaneläke (national pension) provides a minimum-level top-up for those with low earnings-related pension.\n" +
      "- Individual saving: vapaaehtoinen eläkevakuutus (voluntary pension insurance) and osakesäästötili (equity savings account, tax on gains deferred until withdrawal).\n" +
      "- Retirement age is on a rising, birth-year-linked scale, currently in roughly the 63-68 range.",
    localTerms: "Työeläke, Kansaneläke, Vapaaehtoinen eläkevakuutus, Osakesäästötili",
  },
};

export function getCountryFacts(country: string): CountryFacts {
  return (
    COUNTRY_FACTS[String(country).toUpperCase()] ?? {
      facts: "- No structured local pension/account reference is available for this country yet.",
      localTerms: "(none available)",
    }
  );
}

// Generated from translation4.csv — PlanHumans wealth block copy.
// Source of truth is translation4.csv in the repo root; regenerate rather than hand-edit.

export type CountryCode = "US" | "UK" | "DK" | "SE" | "NO" | "FI";

export type BlockCopy = {
  headline: string;
  subtitle: string;
  examples?: string;
  notHere?: string;
  tip?: string;
  placeholder?: string;
};

export const blockTranslations: Record<CountryCode, Record<string, BlockCopy>> = {
  US: {
    // A — Assets · core
    A: {
      headline: "Cash & Instant-Access Savings",
      subtitle: "Money you could spend this week without selling anything or paying a penalty.",
      examples: "Checking account, high-yield savings, money market account, joint household account, cash in payment apps, physical cash",
      notHere: "Not here: stocks, funds and ETFs, even though you can sell them fast — their value moves, so they go in C. Money locked for a fixed term → B. Retirement accounts → E.",
      tip: "A common rule of thumb is to keep 3–6 months of essential spending here. Fill in Monthly Spending (K) first and you will see what that means for you.",
      placeholder: "e.g. Chase checking account",
    },
    // A2 — Debt · core
    A2: {
      headline: "Credit Cards & Short-Term Debt",
      subtitle: "What you owe on cards and flexible credit — the balance you carry, not this month’s payment.",
      examples: "Credit card balance, overdraft, buy-now-pay-later (Klarna, Affirm), store card, 0% purchase credit",
      notHere: "Not here: mortgage and auto loans → D2. Personal loans and student loans → B2. The monthly payment itself → K.",
      tip: "Put the interest rate in the name, e.g. “Visa 22.9%”. Debt at this kind of rate is almost always the first thing worth clearing.",
      placeholder: "e.g. Visa card 22.9%",
    },
    // B — Assets · advanced
    B: {
      headline: "Locked Savings & Money Owed to You, and Expected Extraordinary Earnings / Payments",
      subtitle: "Money that is yours but takes weeks or months to reach — fixed terms, notice periods, or someone still has to pay you.",
      examples: "Certificate of deposit (CD), notice savings account, security deposit held by a landlord, money a friend or family member owes you, a tax refund or insurance payout you’re waiting for, escrow balance",
      notHere: "Not here: instant-access savings → A. Investments you could sell any day → C. Retirement accounts → E.",
      tip: "Write when you get access in the name, e.g. “CD, matures March 2027”. Many people leave this block empty — that’s normal.",
      placeholder: "e.g. 12-month CD, matures 03/2027",
    },
    // B2 — Debt · advanced
    B2: {
      headline: "Loans & Bills You Owe",
      subtitle: "Money you already owe someone — a loan, a bill or a tax demand. Not something you are only planning to buy.",
      examples: "Personal loan, student loans, taxes owed this year, unpaid bills or invoices, a payment plan (dentist, vet, repair), money borrowed from family",
      notHere: "Not here: things you plan to buy or repair. A future kitchen or a second car is a goal, not a debt → put it in Goals (G). Credit cards → A2. Mortgage and auto loans → D2.",
      tip: "The test: if a court could make you pay it today, it belongs here. If not, it’s a plan — and plans go in Goals.",
      placeholder: "e.g. Student loan 5.5%",
    },
    // C — Assets · core
    C: {
      headline: "Investments",
      subtitle: "Money invested to grow over years — stocks, funds and other assets you don’t plan to spend soon.",
      examples: "Brokerage account, index funds and ETFs, individual stocks, Roth/traditional IRA held outside a workplace plan, vested employer stock (RSUs), rental property, crypto, gold, private company shares",
      notHere: "Not here: retirement accounts through work → E. The home you live in → D. Cash sitting uninvested → A.",
      tip: "This is the block the “Assets and investments” forecast grows from — if your stocks are in the wrong block, the forecast will be wrong. One row per account is enough.",
      placeholder: "e.g. Vanguard brokerage — total market index",
    },
    // C2 — Debt · advanced
    C2: {
      headline: "Debt and Potential Tax Against Investments",
      subtitle: "Borrowing secured on — or taken out to buy — the investments above.",
      examples: "Rental property mortgage, second-property mortgage, margin loan on a brokerage account, commercial property loan, a loan taken out to invest",
      notHere: "Not here: the mortgage on the home you live in → D2.",
      tip: "Most people leave this block empty — that’s completely normal.",
      placeholder: "e.g. Rental property mortgage 5.2%",
    },
    // C3 — Debt · advanced (optional)
    C3: {
      headline: "Tax If You Sold (Optional)",
      subtitle: "Optional. A rough estimate of the capital gains tax you would pay if you sold the investments in block C today.",
      examples: "Capital gains tax on unrealized profit in a taxable brokerage account, deferred tax on a rental property",
      notHere: "Not here: tax already demanded for this year → B2. Retirement accounts and the home you live in are usually treated differently — leave them out.",
      tip: "A quick estimate: (what it’s worth now − what you paid) × your capital gains rate. Leaving it empty is fine — it just means your net worth is shown before tax.",
      placeholder: "e.g. Est. capital gains tax, brokerage",
    },
    // D — Assets · core
    D: {
      headline: "Your Home & Belongings",
      subtitle: "What your home and your personal things would realistically sell for today — not what you paid for them.",
      examples: "Primary residence, vacation home, car(s) you own outright, motorcycle, RV or boat, jewelry, watches, art, collections",
      notHere: "Not here: a leased car — you don’t own it, so put the monthly payment in K instead. Property you rent out → C. Furniture and everyday belongings → leave out.",
      tip: "Use a realistic sale price — a recent local sale or an online valuation is close enough for the home. Personal items usually sell for far less than they cost, so be conservative or leave the small ones out.",
      placeholder: "e.g. Home — 3 bed, Austin",
    },
    // D2 — Debt · core
    D2: {
      headline: "Mortgage & Loans On What You Own",
      subtitle: "The balance still outstanding on loans secured against your home and vehicles — not the monthly payment.",
      examples: "Primary mortgage, second mortgage or HELOC, vacation home mortgage, auto loan, boat or RV financing, home improvement loan",
      notHere: "Not here: the monthly payment — that belongs in Monthly Spending (K). Enter the balance you still owe here and the payment there. Rental property mortgage → C2.",
      tip: "Put the rate and how long it’s fixed in the name, e.g. “Mortgage 4.8%, fixed to 2030”. It makes the AI analysis far sharper.",
      placeholder: "e.g. Mortgage 4.8%, fixed to 2030",
    },
    // E — Assets · core
    E: {
      headline: "Retirement Accounts",
      subtitle: "Retirement savings you normally can’t touch until retirement age. Enter the balance shown on your latest statement.",
      examples: "401(k), 403(b), traditional and Roth IRA, pensions from previous employers, HSA earmarked for retirement",
      notHere: "Not here: Social Security. It pays a monthly income for life — it is not a balance you own, and entering it will badly distort your net worth. Same for any old-style pension that promises a monthly amount rather than a pot.",
      tip: "The rule: only pots with a balance. If your statement gives you a monthly amount for life instead of a total, it’s income — leave it out and lower your retirement spending target instead. Enter values before tax; the planner has a separate tax setting.",
      placeholder: "e.g. 401(k) — Fidelity",
    },
    // J — Income · core
    J: {
      headline: "Monthly Income",
      subtitle: "What actually lands in your account each month, after tax and after retirement contributions are taken out.",
      examples: "Net salary (yours, and your partner’s if you plan together), regular freelance or side income, rent received after costs, dividends or interest, child support received, an annual bonus divided by 12",
      notHere: "Not here: one-off amounts like an inheritance or the proceeds of a house sale — those belong in whichever asset block they end up in.",
      tip: "Use a normal month. Anything annual, divide by 12. One row per source — the AI analysis can then see where your money actually comes from.",
      placeholder: "e.g. Net salary (after tax)",
    },
    // K — Expenses · core
    K: {
      headline: "Monthly Spending",
      subtitle: "What leaves your account in a normal month — housing, living costs, loan payments and insurance.",
      examples: "Rent or mortgage payment, HOA fee, property tax, utilities, phone and internet, groceries, transportation and gas, insurance, childcare, subscriptions, healthcare, clothes and hobbies, vacations (annual cost ÷ 12)",
      notHere: "Not here: money you move into savings, investments or a retirement account. That isn’t spent, it’s moved — and keeping it out is what makes your surplus figure mean something.",
      tip: "Your surplus (income − spending) is what the planner assumes you invest each year, so make this block complete. If the total looks too low, check your statements for annual costs you’ve forgotten — insurance, car service, holidays, Christmas.",
      placeholder: "e.g. Mortgage payment",
    },
    // G — Goals
    G: {
      headline: "Goals and Goal Status",
      subtitle: "What you are saving towards. First number is what it will cost in total, second is how much you have put aside so far.",
      examples: "Down payment on a bigger home, a second or electric car, a long trip, kitchen or bathroom renovation, a sabbatical, paying off the mortgage early, college fund, building a 6-month emergency fund",
      tip: "Put the year in the name, e.g. “New kitchen, 2028”. The AI advisory uses it to tell you whether your timing is realistic.",
      placeholder: "e.g. Bigger home by 2031",
    },
    // H — Notes
    H: {
      headline: "My Notes",
      subtitle: "Anything the numbers don’t capture — a job change coming, an inheritance you expect, a separation, a child starting college.",
      tip: "Write these in full sentences — the AI advisory reads them and will factor them into its recommendations.",
      placeholder: "e.g. Changing jobs in spring",
    },
    // I — Notes
    I: {
      headline: "My Notes",
      subtitle: "Anything the numbers don’t capture — a job change coming, an inheritance you expect, a separation, a child starting college.",
      tip: "Write these in full sentences — the AI advisory reads them and will factor them into its recommendations.",
      placeholder: "e.g. Changing jobs in spring",
    },
  },
  UK: {
    // A — Assets · core
    A: {
      headline: "Cash & Instant-Access Savings",
      subtitle: "Money you could spend this week without selling anything or paying a penalty.",
      examples: "Current account, instant-access savings, cash ISA, Premium Bonds, joint household account, e-money balances (Revolut, Wise), physical cash",
      notHere: "Not here: shares, funds and ETFs, even though you can sell them fast — their value moves, so they go in C. Money locked for a fixed term → B. Pensions → E.",
      tip: "A common rule of thumb is to keep 3–6 months of essential spending here. Fill in Monthly Outgoings (K) first and you will see what that means for you.",
      placeholder: "e.g. Barclays current account",
    },
    // A2 — Debt · core
    A2: {
      headline: "Credit Cards & Short-Term Debt",
      subtitle: "What you owe on cards and flexible credit — the balance you carry, not this month’s payment.",
      examples: "Credit card balance, overdraft, buy-now-pay-later (Klarna, Clearpay), store card, 0% purchase credit",
      notHere: "Not here: mortgage and car finance → D2. Personal loans and student loans → B2. The monthly payment itself → K.",
      tip: "Put the interest rate in the name, e.g. “Barclaycard 22.9%”. Debt at this kind of rate is almost always the first thing worth clearing.",
      placeholder: "e.g. Barclaycard 22.9%",
    },
    // B — Assets · advanced
    B: {
      headline: "Locked Savings & Money Owed to You, and Expected Extraordinary Earnings / Payments",
      subtitle: "Money that is yours but takes weeks or months to reach — fixed terms, notice periods, or someone still has to pay you.",
      examples: "Fixed-rate bond, notice savings account, tenancy deposit held in a protection scheme, money a friend or family member owes you, a tax refund or insurance payout you’re waiting for",
      notHere: "Not here: instant-access savings → A. Investments you could sell any day → C. Pensions → E.",
      tip: "Write when you get access in the name, e.g. “Fixed bond, matures March 2027”. Many people leave this block empty — that’s normal.",
      placeholder: "e.g. Fixed-rate bond, matures 03/2027",
    },
    // B2 — Debt · advanced
    B2: {
      headline: "Loans & Bills You Owe",
      subtitle: "Money you already owe someone — a loan, a bill or a tax demand. Not something you are only planning to buy.",
      examples: "Unsecured personal loan, student loan balance (Plan 1/2/5), Self Assessment tax owed, unpaid bills or invoices, a payment plan (dentist, vet, repair), money borrowed from family",
      notHere: "Not here: things you plan to buy or repair. A future kitchen or a second car is a goal, not a debt → put it in Goals (G). Credit cards → A2. Mortgage and car finance → D2.",
      tip: "The test: if you are legally on the hook for it today, it belongs here. If not, it’s a plan — and plans go in Goals.",
      placeholder: "e.g. Personal loan, Santander 6.9%",
    },
    // C — Assets · core
    C: {
      headline: "Investments",
      subtitle: "Money invested to grow over years — shares, funds and other assets you don’t plan to spend soon.",
      examples: "Stocks & Shares ISA, general investment account, index funds and ETFs, individual shares, vested employer share scheme (SAYE/SIP), buy-to-let property, crypto, gold, unlisted company shares",
      notHere: "Not here: pensions → E. The home you live in → D. Cash sitting uninvested → A.",
      tip: "This is the block the “Assets and investments” forecast grows from — if your shares are in the wrong block, the forecast will be wrong. One row per account is enough.",
      placeholder: "e.g. Vanguard S&S ISA — global index fund",
    },
    // C2 — Debt · advanced
    C2: {
      headline: "Debt and Potential Tax Against Investments",
      subtitle: "Borrowing secured on — or taken out to buy — the investments above.",
      examples: "Buy-to-let mortgage, second-property mortgage, margin loan on a brokerage account, commercial property loan, a loan taken out to invest",
      notHere: "Not here: the mortgage on the home you live in → D2.",
      tip: "Most people leave this block empty — that’s completely normal.",
      placeholder: "e.g. Buy-to-let mortgage 5.2%",
    },
    // C3 — Debt · advanced (optional)
    C3: {
      headline: "Tax If You Sold (Optional)",
      subtitle: "Optional. A rough estimate of the capital gains tax you would pay if you sold the investments in block C today.",
      examples: "Capital gains tax on unrealised profit in a general investment account, deferred tax on a rental property",
      notHere: "Not here: tax already demanded for this year → B2. Money inside an ISA and the home you live in are normally exempt — leave them out.",
      tip: "A quick estimate: (what it’s worth now − what you paid) × your capital gains rate. Leaving it empty is fine — it just means your net worth is shown before tax.",
      placeholder: "e.g. Est. CGT on GIA gain",
    },
    // D — Assets · core
    D: {
      headline: "Your Home & Belongings",
      subtitle: "What your home and your personal things would realistically sell for today — not what you paid for them.",
      examples: "Main residence, holiday home, car(s) you own outright, motorbike, caravan or boat, jewellery, watches, art, collections",
      notHere: "Not here: a car on lease or PCP — you don’t own it, so put the monthly payment in K instead. Property you rent out → C. Furniture and everyday belongings → leave out.",
      tip: "Use a realistic sale price — a recent local sale or an online valuation is close enough for the home. Personal items usually sell for far less than they cost, so be conservative or leave the small ones out.",
      placeholder: "e.g. Flat — 3 bed, Manchester",
    },
    // D2 — Debt · core
    D2: {
      headline: "Mortgage & Loans On What You Own",
      subtitle: "The balance still outstanding on loans secured against your home and vehicles — not the monthly payment.",
      examples: "Main residence mortgage, second charge or further advance, holiday home mortgage, car finance (HP), boat or caravan finance, home improvement loan",
      notHere: "Not here: the monthly payment — that belongs in Monthly Outgoings (K). Enter the balance you still owe here and the payment there. Buy-to-let mortgage → C2.",
      tip: "Put the rate and how long it’s fixed in the name, e.g. “HSBC mortgage 4.8%, fixed to 2030”. It makes the AI analysis far sharper.",
      placeholder: "e.g. HSBC mortgage 4.8%, fixed to 2030",
    },
    // E — Assets · core
    E: {
      headline: "Pensions",
      subtitle: "Retirement savings you normally can’t touch until pension age. Enter the balance shown on your latest statement.",
      examples: "Workplace pension (defined contribution), personal pension or SIPP, pots from previous employers, AVCs",
      notHere: "Not here: the State Pension, or a final-salary (defined benefit) pension. Those pay a monthly income for life — they are not a balance you own, and entering them will badly distort your net worth.",
      tip: "The rule: only pots with a balance. If your statement gives you a monthly amount for life instead of a total, it’s income — leave it out and lower your retirement spending target instead. Enter values before tax; the planner has a separate tax setting.",
      placeholder: "e.g. Aviva workplace pension (DC)",
    },
    // J — Income · core
    J: {
      headline: "Monthly Income",
      subtitle: "What actually lands in your account each month, after tax and after pension contributions are taken out.",
      examples: "Net salary (yours, and your partner’s if you plan together), regular freelance or side income, rent received after costs, dividends or interest, Child Benefit, maintenance received, an annual bonus divided by 12",
      notHere: "Not here: one-off amounts like an inheritance or the proceeds of a house sale — those belong in whichever asset block they end up in.",
      tip: "Use a normal month. Anything annual, divide by 12. One row per source — the AI analysis can then see where your money actually comes from.",
      placeholder: "e.g. Net salary (after tax)",
    },
    // K — Expenses · core
    K: {
      headline: "Monthly Outgoings",
      subtitle: "What leaves your account in a normal month — housing, living costs, loan payments and insurance.",
      examples: "Rent or mortgage payment, service charge, council tax, energy and water, phone and broadband, food, transport and fuel, insurance, childcare, subscriptions, healthcare, clothes and hobbies, holidays (annual cost ÷ 12)",
      notHere: "Not here: money you move into savings, investments or a pension. That isn’t spent, it’s moved — and keeping it out is what makes your surplus figure mean something.",
      tip: "Your surplus (income − outgoings) is what the planner assumes you invest each year, so make this block complete. If the total looks too low, check your statements for annual costs you’ve forgotten — insurance, car service, holidays, Christmas.",
      placeholder: "e.g. Mortgage payment",
    },
    // G — Goals
    G: {
      headline: "Goals and Goal Status",
      subtitle: "What you are saving towards. First number is what it will cost in total, second is how much you have put aside so far.",
      examples: "Deposit on a bigger home, a second or electric car, a long trip, kitchen or bathroom renovation, a sabbatical, paying off the mortgage early, university fund, building a 6-month emergency fund",
      tip: "Put the year in the name, e.g. “New kitchen, 2028”. The AI advisory uses it to tell you whether your timing is realistic.",
      placeholder: "e.g. Bigger flat by 2031",
    },
    // H — Notes
    H: {
      headline: "My Notes",
      subtitle: "Anything the numbers don’t capture — a job change coming, an inheritance you expect, a separation, a child starting university.",
      tip: "Write these in full sentences — the AI advisory reads them and will factor them into its recommendations.",
      placeholder: "e.g. Changing jobs in spring",
    },
    // I — Notes
    I: {
      headline: "My Notes",
      subtitle: "Anything the numbers don’t capture — a job change coming, an inheritance you expect, a separation, a child starting university.",
      tip: "Write these in full sentences — the AI advisory reads them and will factor them into its recommendations.",
      placeholder: "e.g. Changing jobs in spring",
    },
  },
  DK: {
    // A — Assets · core
    A: {
      headline: "Kontanter og frie opsparinger",
      subtitle: "Penge du kan bruge i denne uge uden at sælge noget eller betale gebyr.",
      examples: "Lønkonto, budgetkonto, fri opsparingskonto, fælles husholdningskonto, MobilePay-/Revolut-saldo, kontanter",
      notHere: "Ikke her: aktier, fonde og ETF’er — selvom du kan sælge dem hurtigt, svinger værdien, så de hører til i C. Bundne midler → B. Pension → E.",
      tip: "En udbredt tommelfingerregel er at have 3–6 måneders faste udgifter stående her. Udfyld Månedlige udgifter (K) først, så kan du se hvad det svarer til for dig.",
      placeholder: "f.eks. Lønkonto, Danske Bank",
    },
    // A2 — Debt · core
    A2: {
      headline: "Kreditkort og kortfristet gæld",
      subtitle: "Hvad du skylder på kort og fleksibel kredit — den saldo du trækker med dig, ikke månedens ydelse.",
      examples: "Kreditkortgæld, kassekredit, ViaBill/Klarna, kontokort, rentefri afbetaling på et køb",
      notHere: "Ikke her: realkredit- og billån → D2. Forbrugslån og SU-lån → B2. Selve den månedlige ydelse → K.",
      tip: "Skriv renten i navnet, f.eks. “Visa 22,9%”. Gæld til den slags rente er næsten altid det første, der bør betales ud.",
      placeholder: "f.eks. Visa/Dankort-kredit 22,9%",
    },
    // B — Assets · advanced
    B: {
      headline: "Bundet opsparing og tilgodehavender, samt forventede ekstraordinære indtægter/udbetalinger",
      subtitle: "Penge der er dine, men som tager uger eller måneder at få fat i — bindingsperiode, opsigelsesvarsel, eller nogen mangler at betale dig.",
      examples: "Fastforrentet indlån med binding, opsparing med opsigelsesvarsel, depositum hos udlejer, penge familie eller venner skylder dig, overskydende skat eller forsikringsudbetaling du venter på",
      notHere: "Ikke her: fri opsparing → A. Investeringer du kan sælge når som helst → C. Pension → E.",
      tip: "Skriv i navnet hvornår du kan få pengene, f.eks. “Bundet indlån, frigives marts 2027”. Mange lader dette felt stå tomt — det er helt normalt.",
      placeholder: "f.eks. Depositum, lejlighed",
    },
    // B2 — Debt · advanced
    B2: {
      headline: "Lån og ubetalte regninger",
      subtitle: "Penge du allerede skylder nogen — et lån, en regning eller en skatteopkrævning. Ikke noget du blot planlægger at købe.",
      examples: "Forbrugslån, SU-lån, restskat for i år, ubetalte regninger, afdragsordning (tandlæge, dyrlæge, reparation), lån fra familie",
      notHere: "Ikke her: ting du planlægger at købe eller reparere. Et kommende køkken eller en ekstra bil er et mål, ikke gæld → skriv det i Mål (G). Kreditkort → A2. Realkredit og billån → D2.",
      tip: "Testen: er du juridisk forpligtet til at betale det i dag, hører det til her. Ellers er det en plan — og planer hører til i Mål.",
      placeholder: "f.eks. Forbrugslån, Nordea 6,9%",
    },
    // C — Assets · core
    C: {
      headline: "Investeringer",
      subtitle: "Penge investeret for at vokse over år — aktier, fonde og andre aktiver du ikke skal bruge lige med det samme.",
      examples: "Aktiesparekonto, frit depot, indeksfonde og ETF’er, enkeltaktier, medarbejderaktier (frigivne), udlejningsejendom, krypto, guld, unoterede aktier",
      notHere: "Ikke her: pension → E. Den bolig du selv bor i → D. Kontanter der ikke er investeret → A.",
      tip: "Det er dette felt, prognosen “Aktiver og investeringer” vokser ud fra — står dine aktier i det forkerte felt, bliver prognosen forkert. Én række pr. konto er nok.",
      placeholder: "f.eks. Aktiesparekonto — globalt indeks",
    },
    // C2 — Debt · advanced
    C2: {
      headline: "Gæld og potentiel skat knyttet til investeringer",
      subtitle: "Lån med sikkerhed i — eller optaget for at købe — investeringerne ovenfor.",
      examples: "Realkredit i udlejningsejendom, lån i sommerhus til udlejning, belåning af værdipapirdepot, erhvervsejendomslån, lån optaget for at investere",
      notHere: "Ikke her: lånet i den bolig du selv bor i → D2.",
      tip: "De fleste lader dette felt stå tomt — det er helt normalt.",
      placeholder: "f.eks. Realkredit, udlejningslejlighed 5,2%",
    },
    // C3 — Debt · advanced (optional)
    C3: {
      headline: "Latent skat ved salg (valgfri)",
      subtitle: "Valgfri. Et groft skøn over den skat, du ville betale hvis du solgte investeringerne i felt C i dag.",
      examples: "Skat af urealiseret gevinst på frit depot eller aktiesparekonto, udskudt skat ved salg af udlejningsejendom",
      notHere: "Ikke her: skat du allerede er opkrævet for i år → B2. Din egen bolig er normalt skattefri ved salg — lad den stå udenfor.",
      tip: "Hurtigt skøn: (værdi i dag − hvad du gav) × din skatteprocent på aktiegevinst. Det er fint at lade feltet stå tomt — så vises din formue blot før skat.",
      placeholder: "f.eks. Skønnet skat, frit depot",
    },
    // D — Assets · core
    D: {
      headline: "Din bolig og dine ejendele",
      subtitle: "Hvad din bolig og dine ting realistisk kan sælges for i dag — ikke hvad du gav for dem.",
      examples: "Primær bolig, sommerhus, bil(er) du ejer fuldt ud, motorcykel, campingvogn eller båd, smykker, ure, kunst, samlinger",
      notHere: "Ikke her: en leaset bil — den ejer du ikke, så skriv den månedlige ydelse i K i stedet. Bolig du lejer ud → C. Møbler og almindeligt indbo → lad stå udenfor.",
      tip: "Brug en realistisk salgspris — et nyligt salg i området eller en online vurdering er præcist nok for boligen. Personlige ting sælges typisk for langt mindre end de kostede, så vær forsigtig eller lad de små stå udenfor.",
      placeholder: "f.eks. Ejerlejlighed — 3 vær., Århus",
    },
    // D2 — Debt · core
    D2: {
      headline: "Bolig- og billån",
      subtitle: "Restgælden på lån med sikkerhed i din bolig og dine køretøjer — ikke den månedlige ydelse.",
      examples: "Realkreditlån i primær bolig, banklån/bolig-tillægslån, lån i sommerhus, billån, båd- eller campingvognslån, renoveringslån",
      notHere: "Ikke her: den månedlige ydelse — den hører til i Månedlige udgifter (K). Skriv restgælden her og ydelsen der. Lån i udlejningsejendom → C2.",
      tip: "Skriv rente og bindingsperiode i navnet, f.eks. “Realkredit 4,8%, fast til 2030”. Det gør AI-analysen langt skarpere.",
      placeholder: "f.eks. Realkredit 4,8%, fast til 2030",
    },
    // E — Assets · core
    E: {
      headline: "Pension",
      subtitle: "Pensionsopsparing du normalt først kan bruge ved pensionsalderen. Skriv saldoen fra din seneste opgørelse.",
      examples: "Arbejdsmarkedspension, ratepension, aldersopsparing, livrente med opgjort depot, ATP-opsparing, pensioner fra tidligere job",
      notHere: "Ikke her: folkepension og den livsvarige ATP-ydelse. De udbetales som et månedligt beløb — det er ikke en opsparing du ejer, og tallet vil forvrænge din formue.",
      tip: "Reglen: kun opsparinger med en saldo. Giver din opgørelse et månedligt beløb livsvarigt i stedet for et samlet tal, er det indkomst — lad det stå udenfor og sænk i stedet dit forbrugsmål som pensionist. Skriv beløb før skat; planlæggeren har en særskilt skatteindstilling.",
      placeholder: "f.eks. Arbejdsmarkedspension, PFA",
    },
    // J — Income · core
    J: {
      headline: "Månedlig indkomst",
      subtitle: "Det der rent faktisk går ind på din konto hver måned — efter skat og efter pensionsindbetaling.",
      examples: "Nettoløn (din, og din partners hvis I planlægger sammen), fast freelance- eller bijobindkomst, lejeindtægt efter udgifter, udbytte eller renter, børne- og ungeydelse, børnebidrag, årlig bonus divideret med 12",
      notHere: "Ikke her: engangsbeløb som arv eller provenu fra et boligsalg — de hører til i det aktivfelt, hvor pengene ender.",
      tip: "Brug en normal måned. Alt årligt divideres med 12. Én række pr. kilde — så kan AI-analysen se hvor dine penge faktisk kommer fra.",
      placeholder: "f.eks. Nettoløn (efter skat)",
    },
    // K — Expenses · core
    K: {
      headline: "Månedlige udgifter",
      subtitle: "Det der forlader din konto i en normal måned — bolig, leveomkostninger, låneydelser og forsikringer.",
      examples: "Husleje eller låneydelse, ejerforeningsbidrag, ejendomsskat, el/vand/varme, telefon og internet, dagligvarer, transport og brændstof, forsikringer, børnepasning, abonnementer, sundhed, tøj og fritid, ferie (årlig udgift ÷ 12)",
      notHere: "Ikke her: penge du flytter til opsparing, investering eller pension. De er ikke brugt, kun flyttet — og det er netop det, der gør dit overskud meningsfuldt.",
      tip: "Dit overskud (indkomst − udgifter) er det, planlæggeren antager du investerer hvert år, så gør feltet komplet. Ser summen for lav ud, så tjek kontoudtog for årlige udgifter du har glemt — forsikring, bilsyn, ferie, jul.",
      placeholder: "f.eks. Ydelse på realkreditlån",
    },
    // G — Goals
    G: {
      headline: "Mål",
      subtitle: "Det du sparer op til. Første tal er hvad det koster i alt, andet tal er hvor meget du har lagt til side indtil nu.",
      examples: "Udbetaling til større bolig, bil nummer to eller elbil, en længere rejse, nyt køkken eller bad, orlov, at betale realkreditlånet hurtigere ud, opsparing til børnenes uddannelse, en buffer på 6 måneders udgifter",
      tip: "Skriv årstallet i navnet, f.eks. “Nyt køkken, 2028”. AI-rådgivningen bruger det til at vurdere om din tidsplan er realistisk.",
      placeholder: "f.eks. Større bolig i 2031",
    },
    // H — Notes
    H: {
      headline: "Mine noter",
      subtitle: "Alt det tallene ikke fanger — et jobskifte på vej, en arv du forventer, en skilsmisse, et barn der skal læse.",
      tip: "Skriv i hele sætninger — AI-rådgivningen læser dem og tænker dem ind i sine anbefalinger.",
      placeholder: "f.eks. Skifter job til foråret",
    },
    // I — Notes
    I: {
      headline: "Mine noter",
      subtitle: "Alt det tallene ikke fanger — et jobskifte på vej, en arv du forventer, en skilsmisse, et barn der skal læse.",
      tip: "Skriv i hele sætninger — AI-rådgivningen læser dem og tænker dem ind i sine anbefalinger.",
      placeholder: "f.eks. Skifter job til foråret",
    },
  },
  SE: {
    // A — Assets · core
    A: {
      headline: "Kontanter och tillgängligt sparande",
      subtitle: "Pengar du kan använda den här veckan utan att sälja något eller betala en avgift.",
      examples: "Lönekonto, sparkonto utan bindningstid, gemensamt hushållskonto, saldo i Revolut/Wise, kontanter",
      notHere: "Inte här: aktier, fonder och ETF:er — även om du kan sälja snabbt rör sig värdet, så de hör hemma i C. Bundet sparande → B. Pension → E.",
      tip: "En vanlig tumregel är att ha 3–6 månaders nödvändiga utgifter här. Fyll i Månatliga utgifter (K) först så ser du vad det innebär för dig.",
      placeholder: "t.ex. Lönekonto, Swedbank",
    },
    // A2 — Debt · core
    A2: {
      headline: "Kreditkort och kortfristiga skulder",
      subtitle: "Vad du är skyldig på kort och flexibla krediter — saldot du bär med dig, inte månadens betalning.",
      examples: "Kreditkortsskuld, checkkredit, Klarna/delbetalning, kontokort, räntefri avbetalning",
      notHere: "Inte här: bolån och billån → D2. Privatlån och CSN → B2. Själva månadsbetalningen → K.",
      tip: "Skriv räntan i namnet, t.ex. “Visa 22,9%”. Skulder med den räntan är nästan alltid det första värt att lösa.",
      placeholder: "t.ex. Kreditkort SEB 22,9%",
    },
    // B — Assets · advanced
    B: {
      headline: "Bundet sparande och fordringar, samt förväntade extraordinära intäkter/utbetalningar",
      subtitle: "Pengar som är dina men tar veckor eller månader att komma åt — bindningstid, uppsägningstid, eller någon har inte betalat dig än.",
      examples: "Fasträntekonto/bundet sparkonto, sparkonto med uppsägningstid, deposition hos hyresvärd, pengar någon är skyldig dig, skatteåterbäring eller försäkringsersättning du väntar på",
      notHere: "Inte här: sparande utan bindningstid → A. Investeringar du kan sälja när som helst → C. Pension → E.",
      tip: "Skriv i namnet när du kommer åt pengarna, t.ex. “Fasträntekonto, frigörs mars 2027”. Många lämnar det här blocket tomt — det är helt normalt.",
      placeholder: "t.ex. Deposition, hyreslägenhet",
    },
    // B2 — Debt · advanced
    B2: {
      headline: "Lån och obetalda räkningar",
      subtitle: "Pengar du redan är skyldig någon — ett lån, en räkning eller kvarskatt. Inte något du bara planerar att köpa.",
      examples: "Blancolån/privatlån, CSN-lån, kvarskatt för i år, obetalda räkningar, avbetalningsplan (tandläkare, veterinär, reparation), lån från familj",
      notHere: "Inte här: saker du planerar att köpa eller renovera. Ett framtida kök eller en andra bil är ett mål, inte en skuld → skriv det i Mål (G). Kreditkort → A2. Bolån och billån → D2.",
      tip: "Testet: är du juridiskt skyldig att betala i dag hör det hemma här. Annars är det en plan — och planer hör hemma i Mål.",
      placeholder: "t.ex. Privatlån, SEB 6,9%",
    },
    // C — Assets · core
    C: {
      headline: "Investeringar",
      subtitle: "Pengar investerade för att växa över år — aktier, fonder och andra tillgångar du inte ska använda snart.",
      examples: "ISK, kapitalförsäkring, aktie- och fonddepå, indexfonder och ETF:er, enskilda aktier, personalaktier (intjänade), hyresfastighet, krypto, guld, onoterade aktier",
      notHere: "Inte här: pension → E. Bostaden du bor i → D. Pengar som står oinvesterade → A.",
      tip: "Det är det här blocket som prognosen “Tillgångar och investeringar” växer från — ligger dina aktier i fel block blir prognosen fel. En rad per konto räcker.",
      placeholder: "t.ex. ISK Avanza — globalfond",
    },
    // C2 — Debt · advanced
    C2: {
      headline: "Skulder och potentiell skatt kopplade till investeringar",
      subtitle: "Lån med säkerhet i — eller taget för att köpa — investeringarna ovan.",
      examples: "Bolån på hyresfastighet, lån på andra bostad för uthyrning, belåning av värdepappersdepå, lån på kommersiell fastighet, lån taget för att investera",
      notHere: "Inte här: lånet på bostaden du bor i → D2.",
      tip: "De flesta lämnar det här blocket tomt — det är helt normalt.",
      placeholder: "t.ex. Bolån hyreslägenhet 5,2%",
    },
    // C3 — Debt · advanced (optional)
    C3: {
      headline: "Skatt vid försäljning (frivillig)",
      subtitle: "Frivillig. En grov uppskattning av skatten du skulle betala om du sålde investeringarna i block C i dag.",
      examples: "Skatt på orealiserad vinst i aktie- och fonddepå, uppskjuten skatt vid försäljning av hyresfastighet",
      notHere: "Inte här: skatt du redan blivit debiterad för i år → B2. ISK beskattas löpande, inte vid försäljning — ta inte med den här.",
      tip: "Snabb uppskattning: (värde i dag − vad du betalade) × din skattesats på kapitalvinst. Det går bra att lämna tomt — då visas din förmögenhet före skatt.",
      placeholder: "t.ex. Uppskattad skatt, aktiedepå",
    },
    // D — Assets · core
    D: {
      headline: "Din bostad och dina ägodelar",
      subtitle: "Vad din bostad och dina saker realistiskt skulle säljas för i dag — inte vad du betalade.",
      examples: "Permanentbostad, fritidshus, bil(ar) du äger helt, motorcykel, husvagn eller båt, smycken, klockor, konst, samlingar",
      notHere: "Inte här: en leasad bil — den äger du inte, skriv månadskostnaden i K i stället. Bostad du hyr ut → C. Möbler och vardagliga saker → utelämna.",
      tip: "Använd ett realistiskt försäljningspris — en nyligen såld granne eller en onlinevärdering räcker för bostaden. Personliga saker säljs oftast för mycket mindre än de kostade, så var försiktig eller utelämna småsakerna.",
      placeholder: "t.ex. Bostadsrätt — 3 rok, Göteborg",
    },
    // D2 — Debt · core
    D2: {
      headline: "Bolån och billån",
      subtitle: "Kvarvarande skuld på lån med säkerhet i din bostad och dina fordon — inte månadsbetalningen.",
      examples: "Bolån på permanentbostad, topp-/tilläggslån, lån på fritidshus, billån, båt- eller husvagnslån, renoveringslån",
      notHere: "Inte här: månadsbetalningen — den hör hemma i Månatliga utgifter (K). Skriv kvarvarande skuld här och betalningen där. Lån på hyresfastighet → C2.",
      tip: "Skriv ränta och bindningstid i namnet, t.ex. “Bolån 4,8%, bundet till 2030”. Det gör AI-analysen mycket vassare.",
      placeholder: "t.ex. Bolån 4,8%, bundet till 2030",
    },
    // E — Assets · core
    E: {
      headline: "Pension",
      subtitle: "Pensionssparande du normalt inte kommer åt förrän vid pensionsåldern. Skriv saldot från ditt senaste besked.",
      examples: "Tjänstepension, privat pensionssparande, premiepension (fondvärdet i orange kuvertet), pensioner från tidigare arbetsgivare",
      notHere: "Inte här: inkomstpensionen i den allmänna pensionen — den redovisas som ett belopp per månad, inte som kapital du äger. Premiepensionen har däremot ett verkligt fondvärde och kan tas med.",
      tip: "Regeln: bara kapital med ett saldo. Ger ditt besked ett månadsbelopp livet ut i stället för en totalsumma är det inkomst — utelämna det och sänk i stället ditt utgiftsmål som pensionär. Skriv belopp före skatt; planeraren har en egen skatteinställning.",
      placeholder: "t.ex. Tjänstepension, Alecta",
    },
    // J — Income · core
    J: {
      headline: "Månatlig inkomst",
      subtitle: "Det som faktiskt landar på ditt konto varje månad — efter skatt och efter pensionsavsättning.",
      examples: "Nettolön (din, och din partners om ni planerar ihop), regelbunden frilans- eller extrainkomst, hyresintäkt efter kostnader, utdelning eller ränta, barnbidrag, underhållsstöd, årlig bonus delat med 12",
      notHere: "Inte här: engångsbelopp som arv eller pengar från en bostadsförsäljning — de hör hemma i det tillgångsblock där pengarna hamnar.",
      tip: "Utgå från en normal månad. Allt som är årligt delas med 12. En rad per källa — då ser AI-analysen var pengarna faktiskt kommer ifrån.",
      placeholder: "t.ex. Nettolön (efter skatt)",
    },
    // K — Expenses · core
    K: {
      headline: "Månatliga utgifter",
      subtitle: "Det som lämnar ditt konto en normal månad — boende, levnadskostnader, lånebetalningar och försäkringar.",
      examples: "Hyra eller bolånebetalning, avgift till bostadsrättsföreningen, fastighetsavgift, el och vatten, telefon och bredband, mat, transport och drivmedel, försäkringar, barnomsorg, abonnemang, vård, kläder och fritid, semester (årlig kostnad ÷ 12)",
      notHere: "Inte här: pengar du för över till sparande, investeringar eller pension. De är inte spenderade utan flyttade — och det är just därför ditt överskott blir meningsfullt.",
      tip: "Ditt överskott (inkomst − utgifter) är det planeraren antar att du investerar varje år, så gör blocket komplett. Ser summan för låg ut, kolla kontoutdrag efter årliga kostnader du glömt — försäkring, bilservice, semester, jul.",
      placeholder: "t.ex. Bolånebetalning",
    },
    // G — Goals
    G: {
      headline: "Mål",
      subtitle: "Det du sparar till. Första siffran är vad det kostar totalt, andra är hur mycket du lagt undan hittills.",
      examples: "Kontantinsats till större bostad, andra eller elbil, en längre resa, nytt kök eller badrum, tjänstledighet, att lösa bolånet snabbare, sparande till barnens studier, en buffert på 6 månaders utgifter",
      tip: "Skriv årtalet i namnet, t.ex. “Nytt kök, 2028”. AI-rådgivningen använder det för att bedöma om din tidsplan är realistisk.",
      placeholder: "t.ex. Större bostad 2031",
    },
    // H — Notes
    H: {
      headline: "Mina anteckningar",
      subtitle: "Allt som siffrorna inte fångar — ett jobbyte på gång, ett arv du väntar, en separation, ett barn som ska studera.",
      tip: "Skriv i hela meningar — AI-rådgivningen läser dem och väger in dem i sina rekommendationer.",
      placeholder: "t.ex. Byter jobb till våren",
    },
    // I — Notes
    I: {
      headline: "Mina anteckningar",
      subtitle: "Allt som siffrorna inte fångar — ett jobbyte på gång, ett arv du väntar, en separation, ett barn som ska studera.",
      tip: "Skriv i hela meningar — AI-rådgivningen läser dem och väger in dem i sina rekommendationer.",
      placeholder: "t.ex. Byter jobb till våren",
    },
  },
  NO: {
    // A — Assets · core
    A: {
      headline: "Kontanter og tilgjengelig sparing",
      subtitle: "Penger du kan bruke denne uken uten å selge noe eller betale gebyr.",
      examples: "Brukskonto, sparekonto uten binding, felles husholdningskonto, saldo i Revolut/Wise, kontanter",
      notHere: "Ikke her: aksjer, fond og ETF-er — selv om du kan selge raskt, svinger verdien, så de hører hjemme i C. Bundet sparing → B. Pensjon → E.",
      tip: "En vanlig tommelfingerregel er å ha 3–6 måneders nødvendige utgifter her. Fyll ut Månedlige utgifter (K) først, så ser du hva det betyr for deg.",
      placeholder: "f.eks. Brukskonto, DNB",
    },
    // A2 — Debt · core
    A2: {
      headline: "Kredittkort og kortsiktig gjeld",
      subtitle: "Hva du skylder på kort og fleksibel kreditt — saldoen du drar med deg, ikke månedens betaling.",
      examples: "Kredittkortgjeld, brukskreditt, Klarna/delbetaling, kontokort, rentefri avbetaling",
      notHere: "Ikke her: bolig- og billån → D2. Forbrukslån og studielån → B2. Selve månedsbetalingen → K.",
      tip: "Skriv renten i navnet, f.eks. “Visa 22,9%”. Gjeld til den renten er nesten alltid det første som bør betales ned.",
      placeholder: "f.eks. Kredittkort DNB 22,9%",
    },
    // B — Assets · advanced
    B: {
      headline: "Bundet sparing og tilgodehavender, samt forventede ekstraordinære inntekter/utbetalinger",
      subtitle: "Penger som er dine, men som tar uker eller måneder å få tak i — bindingstid, oppsigelsestid, eller noen skylder deg penger.",
      examples: "Fastrentekonto/bundet sparekonto, BSU, sparekonto med oppsigelsestid, depositum hos utleier, penger noen skylder deg, skattepenger til gode eller forsikringsoppgjør du venter på",
      notHere: "Ikke her: sparing uten binding → A. Investeringer du kan selge når som helst → C. Pensjon → E.",
      tip: "Skriv i navnet når du får tilgang, f.eks. “Fastrentekonto, frigis mars 2027”. Mange lar dette feltet stå tomt — det er helt normalt.",
      placeholder: "f.eks. Depositum, leilighet",
    },
    // B2 — Debt · advanced
    B2: {
      headline: "Lån og ubetalte regninger",
      subtitle: "Penger du allerede skylder noen — et lån, en regning eller restskatt. Ikke noe du bare planlegger å kjøpe.",
      examples: "Forbrukslån, studielån (Lånekassen), restskatt for i år, ubetalte regninger, nedbetalingsavtale (tannlege, veterinær, reparasjon), lån fra familie",
      notHere: "Ikke her: ting du planlegger å kjøpe eller reparere. Et fremtidig kjøkken eller bil nummer to er et mål, ikke gjeld → skriv det i Mål (G). Kredittkort → A2. Bolig- og billån → D2.",
      tip: "Testen: er du juridisk forpliktet til å betale i dag, hører det hjemme her. Ellers er det en plan — og planer hører hjemme i Mål.",
      placeholder: "f.eks. Forbrukslån, DNB 6,9%",
    },
    // C — Assets · core
    C: {
      headline: "Investeringer",
      subtitle: "Penger investert for å vokse over år — aksjer, fond og andre eiendeler du ikke skal bruke med det første.",
      examples: "Aksjesparekonto (ASK), fondskonto, verdipapirkonto, indeksfond og ETF-er, enkeltaksjer, ansatteaksjer (innløste), utleiebolig, krypto, gull, unoterte aksjer",
      notHere: "Ikke her: pensjon → E. Boligen du bor i → D. Penger som står uinvestert → A.",
      tip: "Det er dette feltet prognosen “Eiendeler og investeringer” vokser fra — ligger aksjene dine i feil felt, blir prognosen feil. Én rad per konto holder.",
      placeholder: "f.eks. ASK Nordnet — globalt indeksfond",
    },
    // C2 — Debt · advanced
    C2: {
      headline: "Gjeld og potensiell skatt knyttet til investeringer",
      subtitle: "Lån med sikkerhet i — eller tatt opp for å kjøpe — investeringene over.",
      examples: "Lån på utleiebolig, lån på sekundærbolig, belåning av verdipapirkonto, næringseiendomslån, lån tatt opp for å investere",
      notHere: "Ikke her: lånet på boligen du bor i → D2.",
      tip: "De fleste lar dette feltet stå tomt — det er helt normalt.",
      placeholder: "f.eks. Lån utleiebolig 5,2%",
    },
    // C3 — Debt · advanced (optional)
    C3: {
      headline: "Skatt ved salg (valgfri)",
      subtitle: "Valgfri. Et grovt anslag over skatten du ville betalt hvis du solgte investeringene i felt C i dag.",
      examples: "Skatt på urealisert gevinst på verdipapirkonto/ASK, utsatt skatt ved salg av utleiebolig",
      notHere: "Ikke her: skatt du allerede er avkrevd for i år → B2. Boligen du bor i er normalt skattefri ved salg — hold den utenfor.",
      tip: "Raskt anslag: (verdi i dag − det du betalte) × skattesatsen din på aksjegevinst. Det er greit å la feltet stå tomt — da vises formuen din før skatt.",
      placeholder: "f.eks. Anslag skatt, verdipapirkonto",
    },
    // D — Assets · core
    D: {
      headline: "Din bolig og dine eiendeler",
      subtitle: "Hva boligen din og tingene dine realistisk kan selges for i dag — ikke hva du betalte.",
      examples: "Primærbolig, hytte, bil(er) du eier fullt ut, motorsykkel, campingvogn eller båt, smykker, klokker, kunst, samlinger",
      notHere: "Ikke her: en leaset bil — den eier du ikke, skriv månedsbeløpet i K i stedet. Bolig du leier ut → C. Møbler og vanlig innbo → hold utenfor.",
      tip: "Bruk en realistisk salgspris — et nylig salg i nærheten eller en nettverdivurdering holder for boligen. Personlige ting selges som regel for langt mindre enn de kostet, så vær forsiktig eller hold de små utenfor.",
      placeholder: "f.eks. Leilighet — 3 rom, Bergen",
    },
    // D2 — Debt · core
    D2: {
      headline: "Bolig- og billån",
      subtitle: "Restgjelden på lån med sikkerhet i boligen og kjøretøyene dine — ikke månedsbeløpet.",
      examples: "Boliglån på primærbolig, rammelån/fleksilån, lån på hytte, billån, båt- eller campingvognlån, oppussingslån",
      notHere: "Ikke her: månedsbeløpet — det hører hjemme i Månedlige utgifter (K). Skriv restgjelden her og betalingen der. Lån på utleiebolig → C2.",
      tip: "Skriv rente og bindingstid i navnet, f.eks. “Boliglån 4,8%, fast til 2030”. Det gjør AI-analysen mye skarpere.",
      placeholder: "f.eks. Boliglån 4,8%, fast til 2030",
    },
    // E — Assets · core
    E: {
      headline: "Pensjon",
      subtitle: "Pensjonssparing du normalt ikke får tilgang til før pensjonsalder. Skriv saldoen fra siste oversikt.",
      examples: "Innskuddspensjon, pensjonskapitalbevis fra tidligere jobber, IPS, egen pensjonssparing",
      notHere: "Ikke her: alderspensjon fra folketrygden. Den utbetales som et månedlig beløp og er ikke kapital du eier. Ytelsespensjon som lover en månedlig sum hører heller ikke hjemme her.",
      tip: "Regelen: bare pensjonskapital med saldo. Gir oversikten din et månedlig beløp livet ut i stedet for en totalsum, er det inntekt — hold det utenfor og senk heller forbruksmålet ditt som pensjonist. Skriv beløp før skatt; planleggeren har en egen skatteinnstilling.",
      placeholder: "f.eks. Innskuddspensjon, Storebrand",
    },
    // J — Income · core
    J: {
      headline: "Månedlig inntekt",
      subtitle: "Det som faktisk kommer inn på kontoen din hver måned — etter skatt og etter pensjonsinnbetaling.",
      examples: "Nettolønn (din, og partnerens hvis dere planlegger sammen), fast frilans- eller ekstrainntekt, leieinntekt etter kostnader, utbytte eller renter, barnetrygd, barnebidrag, årlig bonus delt på 12",
      notHere: "Ikke her: engangsbeløp som arv eller oppgjør fra et boligsalg — de hører hjemme i det eiendelsfeltet pengene havner i.",
      tip: "Bruk en normal måned. Alt som er årlig deles på 12. Én rad per kilde — da ser AI-analysen hvor pengene dine faktisk kommer fra.",
      placeholder: "f.eks. Nettolønn (etter skatt)",
    },
    // K — Expenses · core
    K: {
      headline: "Månedlige utgifter",
      subtitle: "Det som forlater kontoen din i en normal måned — bolig, levekostnader, lånebetalinger og forsikringer.",
      examples: "Husleie eller lånebetaling, felleskostnader, kommunale avgifter, strøm og vann, telefon og bredbånd, mat, transport og drivstoff, forsikringer, barnehage/SFO, abonnementer, helse, klær og fritid, ferie (årlig kostnad ÷ 12)",
      notHere: "Ikke her: penger du flytter til sparing, investering eller pensjon. De er ikke brukt, bare flyttet — og det er nettopp det som gjør overskuddet ditt meningsfullt.",
      tip: "Overskuddet ditt (inntekt − utgifter) er det planleggeren antar at du investerer hvert år, så gjør feltet komplett. Ser summen for lav ut, sjekk kontoutskrifter for årlige kostnader du har glemt — forsikring, bilservice, ferie, jul.",
      placeholder: "f.eks. Lånebetaling bolig",
    },
    // G — Goals
    G: {
      headline: "Mål",
      subtitle: "Det du sparer til. Første tall er hva det koster totalt, andre er hvor mye du har lagt til side så langt.",
      examples: "Egenkapital til større bolig, bil nummer to eller elbil, en lengre reise, nytt kjøkken eller bad, permisjon, å nedbetale boliglånet raskere, sparing til barnas utdanning, en buffer på 6 måneders utgifter",
      tip: "Skriv årstallet i navnet, f.eks. “Nytt kjøkken, 2028”. AI-rådgivningen bruker det til å vurdere om tidsplanen din er realistisk.",
      placeholder: "f.eks. Større bolig i 2031",
    },
    // H — Notes
    H: {
      headline: "Mine notater",
      subtitle: "Alt tallene ikke fanger — et jobbskifte på gang, en arv du venter, et samlivsbrudd, et barn som skal studere.",
      tip: "Skriv i hele setninger — AI-rådgivningen leser dem og tar dem med i anbefalingene.",
      placeholder: "f.eks. Bytter jobb til våren",
    },
    // I — Notes
    I: {
      headline: "Mine notater",
      subtitle: "Alt tallene ikke fanger — et jobbskifte på gang, en arv du venter, et samlivsbrudd, et barn som skal studere.",
      tip: "Skriv i hele setninger — AI-rådgivningen leser dem og tar dem med i anbefalingene.",
      placeholder: "f.eks. Bytter jobb til våren",
    },
  },
  FI: {
    // A — Assets · core
    A: {
      headline: "Käteinen ja nostettavissa olevat säästöt",
      subtitle: "Rahat, jotka voit käyttää tällä viikolla myymättä mitään tai maksamatta kuluja.",
      examples: "Käyttötili, säästötili ilman määräaikaa, yhteinen kotitaloustili, Revolut-/Wise-saldo, käteinen",
      notHere: "Ei tähän: osakkeet, rahastot ja ETF:t — vaikka ne voi myydä nopeasti, arvo heiluu, joten ne kuuluvat kohtaan C. Määräaikaiset säästöt → B. Eläkkeet → E.",
      tip: "Yleinen nyrkkisääntö on pitää täällä 3–6 kuukauden välttämättömät menot. Täytä Kuukausittaiset menot (K) ensin, niin näet mitä se sinulle tarkoittaa.",
      placeholder: "esim. Käyttötili, OP",
    },
    // A2 — Debt · core
    A2: {
      headline: "Luottokortit ja lyhytaikaiset velat",
      subtitle: "Mitä olet velkaa korteista ja joustoluotoista — kannettava saldo, ei kuukauden maksuerä.",
      examples: "Luottokorttivelka, tililuotto, Klarna/osamaksu, kanta-asiakasluotto, koroton osamaksu",
      notHere: "Ei tähän: asunto- ja autolainat → D2. Kulutus- ja opintolainat → B2. Itse kuukausierä → K.",
      tip: "Kirjoita korko nimeen, esim. “Visa 22,9%”. Tämän korkotason velka kannattaa lähes aina maksaa ensin pois.",
      placeholder: "esim. Luottokortti Nordea 22,9%",
    },
    // B — Assets · advanced
    B: {
      headline: "Sidotut säästöt ja saamiset, sekä odotetut poikkeukselliset tulot/maksut",
      subtitle: "Rahat, jotka ovat sinun mutta joiden saaminen kestää viikkoja tai kuukausia — määräaika, irtisanomisaika tai joku on velkaa sinulle.",
      examples: "Määräaikaistalletus, irtisanomisajallinen säästötili, vuokravakuus, läheisen sinulle velkaa oleva summa, veronpalautus tai vakuutuskorvaus jota odotat",
      notHere: "Ei tähän: vapaasti nostettavat säästöt → A. Milloin tahansa myytävät sijoitukset → C. Eläkkeet → E.",
      tip: "Kirjoita nimeen milloin saat rahat, esim. “Määräaikaistalletus, erääntyy 3/2027”. Moni jättää tämän lohkon tyhjäksi — se on normaalia.",
      placeholder: "esim. Vuokravakuus, asunto",
    },
    // B2 — Debt · advanced
    B2: {
      headline: "Lainat ja maksamattomat laskut",
      subtitle: "Rahat, jotka olet jo velkaa — laina, lasku tai jäännösvero. Ei jokin, jonka vasta aiot ostaa.",
      examples: "Kulutusluotto, opintolaina, kuluvan vuoden jäännösvero, maksamattomat laskut, maksusuunnitelma (hammaslääkäri, eläinlääkäri, korjaus), laina läheiseltä",
      notHere: "Ei tähän: asiat joita vasta aiot ostaa tai korjata. Tuleva keittiö tai toinen auto on tavoite, ei velka → kirjaa se kohtaan Tavoitteet (G). Luottokortit → A2. Asunto- ja autolainat → D2.",
      tip: "Testi: jos olet jo juridisesti velvollinen maksamaan, se kuuluu tänne. Muuten se on suunnitelma — ja suunnitelmat kuuluvat Tavoitteisiin.",
      placeholder: "esim. Kulutusluotto, OP 6,9%",
    },
    // C — Assets · core
    C: {
      headline: "Sijoitukset",
      subtitle: "Rahat, jotka on sijoitettu kasvamaan vuosiksi — osakkeet, rahastot ja muu omaisuus, jota et aio pian käyttää.",
      examples: "Osakesäästötili, arvo-osuustili, indeksirahastot ja ETF:t, yksittäiset osakkeet, ansaitut työsuhdeosakkeet, sijoitusasunto, krypto, kulta, listaamattomat osakkeet",
      notHere: "Ei tähän: eläkkeet → E. Asunto jossa asut → D. Sijoittamaton käteinen → A.",
      tip: "Tästä lohkosta ennuste “Varat ja sijoitukset” kasvaa — jos osakkeesi ovat väärässä lohkossa, ennuste menee pieleen. Yksi rivi per tili riittää.",
      placeholder: "esim. Osakesäästötili — maailmanindeksi",
    },
    // C2 — Debt · advanced
    C2: {
      headline: "Sijoituksiin liittyvät velat ja mahdollinen vero",
      subtitle: "Lainat, joiden vakuutena ovat — tai jotka on otettu ostamaan — yllä olevat sijoitukset.",
      examples: "Sijoitusasuntolaina, kakkosasunnon laina, arvopaperisalkun vakuudellinen laina, liikekiinteistölaina, sijoittamista varten otettu laina",
      notHere: "Ei tähän: oman asuntosi laina → D2.",
      tip: "Useimmat jättävät tämän lohkon tyhjäksi — se on täysin normaalia.",
      placeholder: "esim. Sijoitusasuntolaina 5,2%",
    },
    // C3 — Debt · advanced (optional)
    C3: {
      headline: "Vero jos myisit (vapaaehtoinen)",
      subtitle: "Vapaaehtoinen. Karkea arvio verosta, jonka maksaisit jos myisit lohkon C sijoitukset tänään.",
      examples: "Vero realisoitumattomasta voitosta arvo-osuustilillä, sijoitusasunnon luovutusvoittovero",
      notHere: "Ei tähän: tälle vuodelle jo määrätty vero → B2. Oma vakituinen asunto on yleensä verovapaa — jätä se pois.",
      tip: "Nopea arvio: (nykyarvo − hankintahinta) × luovutusvoittoveroprosenttisi. Tyhjäksi jättäminen on ok — silloin varallisuutesi näkyy ennen veroja.",
      placeholder: "esim. Arvioitu vero, arvo-osuustili",
    },
    // D — Assets · core
    D: {
      headline: "Asuntosi ja omaisuutesi",
      subtitle: "Mitä asuntosi ja tavarasi realistisesti myytäisiin tänään — ei mitä niistä maksoit.",
      examples: "Vakituinen asunto, vapaa-ajan asunto, kokonaan omistamasi auto(t), moottoripyörä, asuntovaunu tai vene, korut, kellot, taide, kokoelmat",
      notHere: "Ei tähän: leasing-auto — et omista sitä, joten kirjaa kuukausimaksu kohtaan K. Vuokralle antamasi asunto → C. Huonekalut ja arkitavarat → jätä pois.",
      tip: "Käytä realistista myyntihintaa — lähialueen viimeaikainen kauppa tai verkkoarvio riittää asunnolle. Henkilökohtaiset tavarat myydään yleensä paljon hankintahintaa halvemmalla, joten arvioi varovasti tai jätä pienet pois.",
      placeholder: "esim. Kerrostaloasunto — 3h, Tampere",
    },
    // D2 — Debt · core
    D2: {
      headline: "Asunto- ja autolainat",
      subtitle: "Jäljellä oleva velka lainoista, joiden vakuutena on asuntosi tai ajoneuvosi — ei kuukausierä.",
      examples: "Vakituisen asunnon asuntolaina, lisälaina/joustoluotto, vapaa-ajan asunnon laina, autolaina, vene- tai asuntovaunulaina, remonttilaina",
      notHere: "Ei tähän: kuukausierä — se kuuluu kohtaan Kuukausittaiset menot (K). Kirjaa jäljellä oleva velka tähän ja maksuerä sinne. Sijoitusasunnon laina → C2.",
      tip: "Kirjoita korko ja kiinnitysaika nimeen, esim. “Asuntolaina 4,8%, kiinteä 2030 asti”. Se terävöittää AI-analyysia huomattavasti.",
      placeholder: "esim. Asuntolaina 4,8%, kiinteä 2030 asti",
    },
    // E — Assets · core
    E: {
      headline: "Eläkkeet",
      subtitle: "Eläkesäästöt, joihin pääset yleensä vasta eläkeiässä. Kirjaa viimeisimmän otteen saldo.",
      examples: "Vapaaehtoinen eläkevakuutus, PS-tili, työnantajan lisäeläkejärjestely, aiempien työnantajien eläkesäästöt",
      notHere: "Ei tähän: työeläke ja kansaneläke. Ne maksetaan kuukausittaisena eläkkeenä eivätkä ne ole omistamaasi pääomaa — niiden kirjaaminen vääristää varallisuutesi pahasti.",
      tip: "Sääntö: vain saldolliset eläkesäästöt. Jos otteesi antaa kuukausisumman eliniäksi kokonaissumman sijaan, kyse on tulosta — jätä se pois ja laske sen sijaan eläkeajan kulutustavoitettasi. Kirjaa summat ennen veroja; suunnittelijassa on erillinen veroasetus.",
      placeholder: "esim. Vapaaehtoinen eläkevakuutus, Ilmarinen",
    },
    // J — Income · core
    J: {
      headline: "Kuukausitulot",
      subtitle: "Se mikä oikeasti tulee tilillesi joka kuukausi — verojen ja eläkemaksujen jälkeen.",
      examples: "Nettopalkka (sinun ja kumppanisi, jos suunnittelette yhdessä), säännöllinen freelance- tai sivutulo, vuokratulo kulujen jälkeen, osingot tai korot, lapsilisä, elatusapu, vuosibonus jaettuna 12:lla",
      notHere: "Ei tähän: kertaluonteiset erät kuten perintö tai asuntokaupan tuotto — ne kuuluvat siihen varallisuuslohkoon, johon rahat päätyvät.",
      tip: "Käytä tavallista kuukautta. Vuosittaiset jaetaan 12:lla. Yksi rivi per lähde — silloin AI-analyysi näkee mistä rahasi oikeasti tulevat.",
      placeholder: "esim. Nettopalkka (verojen jälkeen)",
    },
    // K — Expenses · core
    K: {
      headline: "Kuukausittaiset menot",
      subtitle: "Se mikä lähtee tililtäsi tavallisessa kuukaudessa — asuminen, eläminen, lainanhoito ja vakuutukset.",
      examples: "Vuokra tai lainanmaksu, hoitovastike, kiinteistövero, sähkö ja vesi, puhelin ja nettiyhteys, ruoka, liikkuminen ja polttoaine, vakuutukset, lastenhoito, tilaukset, terveydenhuolto, vaatteet ja harrastukset, lomat (vuosikulu ÷ 12)",
      notHere: "Ei tähän: rahat, jotka siirrät säästöön, sijoituksiin tai eläkkeeseen. Niitä ei ole kulutettu, vain siirretty — ja juuri siksi ylijäämäsi on merkitsevä.",
      tip: "Ylijäämäsi (tulot − menot) on se, minkä suunnittelija olettaa sinun sijoittavan vuosittain, joten täytä lohko huolella. Jos summa näyttää liian pieneltä, tarkista tiliotteista unohtuneet vuosikulut — vakuutukset, katsastus, lomat, joulu.",
      placeholder: "esim. Asuntolainan maksuerä",
    },
    // G — Goals
    G: {
      headline: "Tavoitteet",
      subtitle: "Se mitä varten säästät. Ensimmäinen luku on kokonaishinta, toinen on tähän mennessä säästetty summa.",
      examples: "Käsiraha isompaan asuntoon, toinen auto tai sähköauto, pitkä matka, keittiö- tai kylpyhuoneremontti, vuorotteluvapaa, asuntolainan nopeampi maksu, lasten opintosäästöt, 6 kuukauden puskuri",
      tip: "Kirjoita vuosiluku nimeen, esim. “Uusi keittiö, 2028”. AI-neuvonta käyttää sitä arvioidakseen onko aikataulusi realistinen.",
      placeholder: "esim. Isompi asunto 2031",
    },
    // H — Notes
    H: {
      headline: "Muistiinpanoni",
      subtitle: "Kaikki mitä luvut eivät kerro — tuleva työpaikan vaihto, odotettu perintö, ero, lapsen opintojen alku.",
      tip: "Kirjoita kokonaisin lausein — AI-neuvonta lukee ne ja ottaa ne huomioon suosituksissaan.",
      placeholder: "esim. Vaihdan työpaikkaa keväällä",
    },
    // I — Notes
    I: {
      headline: "Muistiinpanoni",
      subtitle: "Kaikki mitä luvut eivät kerro — tuleva työpaikan vaihto, odotettu perintö, ero, lapsen opintojen alku.",
      tip: "Kirjoita kokonaisin lausein — AI-neuvonta lukee ne ja ottaa ne huomioon suosituksissaan.",
      placeholder: "esim. Vaihdan työpaikkaa keväällä",
    },
  },
};

export const guideCopy: Record<CountryCode, Record<string, string>> = {
  US: {
    headline: "How to fill in your wealth blocks",
    subtitle: "Five minutes now is enough. You can refine it later.",
    step1: "Start with Monthly Income (J) and Monthly Spending (K). They drive every forecast on this page, and they are the two blocks you already know the answers to.",
    step2: "Each row has a name, an amount, and an optional notes field. Put anything useful in the name or the notes — the bank, the interest rate, when it unlocks: “Chase mortgage 4.8%, fixed to 2030”. The amount field takes whole numbers only.",
    step3: "Assets on the left, debts on the right. For a debt, enter the balance you still owe — the monthly payment goes in Monthly Spending (K) instead. Getting that split right is what makes the numbers work.",
    step4: "Not sure which block? Each one tells you what does not belong in it and where to put it instead. When two blocks could fit, pick by how quickly you could turn it into cash.",
    step5: "Add as many rows as you like with Add row. Nothing is kept until you press Save record at the top. Amounts are stored rounded to the nearest 100.",
    detailPlaceholder: "Provider, rate, notes (optional)",
    sectionStart: "Start here",
    sectionBalance: "What you own and owe",
    sectionAdvanced: "Show advanced blocks",
    sectionAdvancedHint: "Most people can leave these empty.",
    sectionNotes: "Notes",
    disclaimer: "PlanHumans is a planning tool, not financial advice. Forecasts are simple projections based on the assumptions you set — they are not a prediction of what will happen.",
    premiumNote: "Some features (adding goals, unlimited AI suggestions) are for premium users only. Donate 10 USD to unlock premium for 1 year. PlanHumans is a non-profit — donations go toward making the solution better, more secure, and covering advertising expenses.",
  },
  UK: {
    headline: "How to fill in your wealth blocks",
    subtitle: "Five minutes now is enough. You can refine it later.",
    step1: "Start with Monthly Income (J) and Monthly Outgoings (K). They drive every forecast on this page, and they are the two blocks you already know the answers to.",
    step2: "Each row has a name, an amount, and an optional notes field. Put anything useful in the name or the notes — the bank, the interest rate, when it unlocks: “HSBC mortgage 4.8%, fixed to 2030”. The amount field takes whole numbers only.",
    step3: "Assets on the left, debts on the right. For a debt, enter the balance you still owe — the monthly payment goes in Monthly Outgoings (K) instead. Getting that split right is what makes the numbers work.",
    step4: "Not sure which block? Each one tells you what does not belong in it and where to put it instead. When two blocks could fit, pick by how quickly you could turn it into cash.",
    step5: "Add as many rows as you like with Add row. Nothing is kept until you press Save record at the top. Amounts are stored rounded to the nearest 100.",
    detailPlaceholder: "Provider, rate, notes (optional)",
    sectionStart: "Start here",
    sectionBalance: "What you own and owe",
    sectionAdvanced: "Show advanced blocks",
    sectionAdvancedHint: "Most people can leave these empty.",
    sectionNotes: "Notes",
    disclaimer: "PlanHumans is a planning tool, not financial advice. Forecasts are simple projections based on the assumptions you set — they are not a prediction of what will happen.",
    premiumNote: "Some features (adding goals, unlimited AI suggestions) are for premium users only. Donate 10 USD to unlock premium for 1 year. PlanHumans is a non-profit — donations go toward making the solution better, more secure, and covering advertising expenses.",
  },
  DK: {
    headline: "Sådan udfylder du dine formueblokke",
    subtitle: "Fem minutter er nok til at starte. Du kan finjustere senere.",
    step1: "Start med Månedlig indkomst (J) og Månedlige udgifter (K). De driver alle prognoser på siden — og det er de to felter, du allerede kender svarene på.",
    step2: "Hver række har et navn, et beløb og et valgfrit notefelt. Skriv alt nyttigt i navnet eller noten — banken, renten, hvornår pengene frigives: “Realkredit 4,8%, fast til 2030”. Beløbsfeltet tager kun hele tal.",
    step3: "Aktiver til venstre, gæld til højre. Ved gæld skriver du restgælden — den månedlige ydelse hører til i Månedlige udgifter (K). Det er den opdeling, der får tallene til at hænge sammen.",
    step4: "I tvivl om hvilket felt? Hvert felt fortæller hvad der ikke hører til, og hvor det skal stå i stedet. Passer to felter, så vælg efter hvor hurtigt du kan lave det om til kontanter.",
    step5: "Tilføj lige så mange rækker du vil med Tilføj række. Intet gemmes, før du trykker Gem post øverst. Beløb gemmes afrundet til nærmeste 100.",
    detailPlaceholder: "Udbyder, rente, note (valgfri)",
    sectionStart: "Start her",
    sectionBalance: "Hvad du ejer og skylder",
    sectionAdvanced: "Vis avancerede felter",
    sectionAdvancedHint: "De fleste kan lade disse stå tomme.",
    sectionNotes: "Noter",
    disclaimer: "PlanHumans er et planlægningsværktøj, ikke finansiel rådgivning. Prognoserne er simple fremskrivninger baseret på de forudsætninger, du selv sætter — ikke en forudsigelse af hvad der sker.",
    premiumNote: "Nogle funktioner (tilføjelse af mål, ubegrænsede AI-forslag) er kun for premium-brugere. Donér 10 USD for at låse premium op i 1 år. PlanHumans er non-profit — donationer går til at gøre løsningen bedre, mere sikker og til at dække annonceudgifter.",
  },
  SE: {
    headline: "Så här fyller du i dina förmögenhetsblock",
    subtitle: "Fem minuter räcker för att börja. Du kan finjustera senare.",
    step1: "Börja med Månatlig inkomst (J) och Månatliga utgifter (K). De driver alla prognoser på sidan — och det är de två block du redan vet svaren på.",
    step2: "Varje rad har ett namn, ett belopp och ett valfritt anteckningsfält. Skriv allt användbart i namnet eller anteckningen — banken, räntan, när pengarna frigörs: “Bolån 4,8%, bundet till 2030”. Beloppsfältet tar bara heltal.",
    step3: "Tillgångar till vänster, skulder till höger. För en skuld skriver du kvarvarande belopp — månadsbetalningen hör hemma i Månatliga utgifter (K). Det är den uppdelningen som får siffrorna att gå ihop.",
    step4: "Osäker på vilket block? Varje block berättar vad som inte hör hemma där och var det ska stå i stället. Passar två block, välj efter hur snabbt du kan göra om det till kontanter.",
    step5: "Lägg till hur många rader du vill med Lägg till rad. Inget sparas förrän du trycker Spara post högst upp. Belopp sparas avrundade till närmaste 100.",
    detailPlaceholder: "Leverantör, ränta, notering (frivillig)",
    sectionStart: "Börja här",
    sectionBalance: "Vad du äger och är skyldig",
    sectionAdvanced: "Visa avancerade block",
    sectionAdvancedHint: "De flesta kan lämna dessa tomma.",
    sectionNotes: "Anteckningar",
    disclaimer: "PlanHumans är ett planeringsverktyg, inte finansiell rådgivning. Prognoserna är enkla framskrivningar baserade på de antaganden du själv anger — inte en förutsägelse om vad som kommer att hända.",
    premiumNote: "Vissa funktioner (att lägga till mål, obegränsade AI-förslag) är endast för premiumanvändare. Donera 10 USD för att låsa upp premium i 1 år. PlanHumans är en ideell tjänst — donationer går till att göra lösningen bättre, säkrare och till att täcka annonskostnader.",
  },
  NO: {
    headline: "Slik fyller du ut formuesblokkene dine",
    subtitle: "Fem minutter er nok til å starte. Du kan finjustere senere.",
    step1: "Start med Månedlig inntekt (J) og Månedlige utgifter (K). De driver alle prognosene på siden — og det er de to feltene du allerede vet svaret på.",
    step2: "Hver rad har et navn, et beløp og et valgfritt notatfelt. Skriv alt nyttig i navnet eller notatet — banken, renten, når pengene frigis: “Boliglån 4,8%, fast til 2030”. Beløpsfeltet tar bare hele tall.",
    step3: "Eiendeler til venstre, gjeld til høyre. For gjeld skriver du restgjelden — månedsbeløpet hører hjemme i Månedlige utgifter (K). Det er den delingen som får tallene til å gå opp.",
    step4: "Usikker på hvilket felt? Hvert felt forteller hva som ikke hører hjemme der, og hvor det skal stå i stedet. Passer to felt, velg etter hvor raskt du kan gjøre det om til kontanter.",
    step5: "Legg til så mange rader du vil med Legg til rad. Ingenting lagres før du trykker Lagre post øverst. Beløp lagres avrundet til nærmeste 100.",
    detailPlaceholder: "Tilbyder, rente, notat (valgfritt)",
    sectionStart: "Start her",
    sectionBalance: "Hva du eier og skylder",
    sectionAdvanced: "Vis avanserte felter",
    sectionAdvancedHint: "De fleste kan la disse stå tomme.",
    sectionNotes: "Notater",
    disclaimer: "PlanHumans er et planleggingsverktøy, ikke finansiell rådgivning. Prognosene er enkle framskrivninger basert på forutsetningene du selv setter — ikke en spådom om hva som vil skje.",
    premiumNote: "Enkelte funksjoner (å legge til mål, ubegrensede AI-forslag) er kun for premium-brukere. Doner 10 USD for å låse opp premium i 1 år. PlanHumans er ideelt — donasjoner går til å gjøre løsningen bedre, sikrere og til å dekke annonsekostnader.",
  },
  FI: {
    headline: "Näin täytät varallisuuslohkosi",
    subtitle: "Viisi minuuttia riittää alkuun. Voit tarkentaa myöhemmin.",
    step1: "Aloita kohdista Kuukausitulot (J) ja Kuukausittaiset menot (K). Ne ohjaavat kaikkia sivun ennusteita — ja niihin osaat jo vastata.",
    step2: "Jokaisella rivillä on nimi, summa ja vapaaehtoinen muistiinpanokenttä. Kirjoita kaikki hyödyllinen nimeen tai muistiinpanoon — pankki, korko, milloin vapautuu: “Asuntolaina 4,8%, kiinteä 2030 asti”. Summakenttään käyvät vain kokonaisluvut.",
    step3: "Varat vasemmalla, velat oikealla. Velkaan kirjaat jäljellä olevan summan — kuukausierä kuuluu kohtaan Kuukausittaiset menot (K). Tämä jako saa luvut täsmäämään.",
    step4: "Epävarma lohkosta? Jokainen lohko kertoo mikä ei sinne kuulu ja mihin se kuuluu. Jos kaksi sopisi, valitse sen mukaan kuinka nopeasti saat sen rahaksi.",
    step5: "Lisää rivejä niin monta kuin haluat painikkeella Lisää rivi. Mitään ei tallenneta ennen kuin painat Tallenna ylhäällä. Summat tallennetaan pyöristettynä lähimpään sataan.",
    detailPlaceholder: "Palveluntarjoaja, korko, muistiinpano (vapaaehtoinen)",
    sectionStart: "Aloita tästä",
    sectionBalance: "Mitä omistat ja olet velkaa",
    sectionAdvanced: "Näytä lisälohkot",
    sectionAdvancedHint: "Useimmat voivat jättää nämä tyhjiksi.",
    sectionNotes: "Muistiinpanot",
    disclaimer: "PlanHumans on suunnittelutyökalu, ei sijoitusneuvontaa. Ennusteet ovat yksinkertaisia laskelmia asettamillasi oletuksilla — eivät ennuste siitä mitä tapahtuu.",
    premiumNote: "Jotkin ominaisuudet (tavoitteiden lisääminen, rajattomat tekoälyehdotukset) ovat vain premium-käyttäjille. Lahjoita 10 USD avataksesi premiumin vuodeksi. PlanHumans on voittoa tavoittelematon — lahjoitukset menevät ratkaisun parantamiseen, turvallisuuden lisäämiseen ja mainoskulujen kattamiseen.",
  },
};

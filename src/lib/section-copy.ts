// Section copy for the planning & analysis blocks (AI, PF, PUR, RI, FR).
// Same shape and lookup pattern as blockTranslations/guideCopy in block-copy.ts,
// so every section label, heading and description follows the user's selected
// language like the wealth blocks (A, A2, …) do.
// Kept in its own file because block-copy.ts is generated from translation4.csv.

import type { CountryCode } from "./block-copy";

export type SectionCopy = {
  label: string;
  heading: string;
  sub?: string;
  description: string;
  placeholder?: string;
};

export const sectionCopy: Record<CountryCode, Record<string, SectionCopy>> = {
  US: {
    AI: {
      label: "AI",
      heading: "AI guided advisory",
      description:
        "Build your AI prompt. You can copy the ai-text and paste into ChatGpt.com or any other AI agents, and continue your dialogue with the AI agent of your choise. You can edit the text, and ask your burning questions; for example “When can I afford a second car, based on the information”",
      placeholder: "Your AI prompt will appear here. You can edit it freely before pasting it into an AI agent.",
    },
    PF: {
      label: "PF Planning focus",
      heading: "Tailor the outlook to your life stage",
      description: "These assumptions help the planner reflect your personal retirement trajectory.",
    },
    PUR: {
      label: "PUR, - pension savings from today until retirement",
      heading: "Additional pension contribution",
      description: "The pension payments you expect to make from today, until retirement, you can adjust each year manually in block RT Pension projection",
    },
    RI: {
      label: "RI Retirement income",
      heading: "Retirement income vs. spending",
      description:
        "Funding after retirement: each year is paid by your pensions — and, whenever the pensions after tax do not cover your yearly spending, the missing amount is drawn from your investment funds.",
    },
    FR: {
      label: "FR Funding after retirement table",
      heading: "Pensions and investments per year",
      description:
        "Every year from your retirement year to age {age}: the payout of each pension, the Additional pension contribution built from your yearly savings, your inflation-adjusted spend — and what the investment funds must cover when your pensions after tax are not enough.",
    },
    ALO: {
      label: "ALO Assets / liabilities balance overview",
      heading: "Projection, growth in investment funds (C) until retirement. You can use block AP Asset projection to make adjustments year over year",
      sub: "Investments (C) plus yearly cashflow, compounded at the PF investment yield",
      description:
        "The chart adds your yearly cashflow (income − outgoings) as new money invested each year — so cashflow becomes investment funds and keeps growing at the PF \"Average after tax yield % for investments in block C\". The same future value (incl. cashflow) is used as the starting investment funds in block FR Funding after retirement table.",
    },
    RF: {
      label: "RF Retirement funds",
      heading: "Until retirement",
      sub: "Pension pot only — other assets are not drawn down",
      description: "Projects the growth of your pension pot until retirement — pension funds only, other assets are not drawn down.",
    },
    RT: {
      label: "RT Retirement table",
      heading: "Pension projection",
      sub: "Editable forecast",
      description:
        "Each pension of type \"draw back\" (drawdown) is projected from today's balance to its payout year at the PF \"Average yield % pension funds\" — so the yield from now until the pension year is reflected — and then turned into a level yearly annuity over its payout years at the same yield. This per-pension calculation lives in lib/retirement.ts and drives block FR Funding after retirement table and the retirement-income graph. RT shows the aggregate block E pension-and-reserves path.",
    },
    AP: {
      label: "AP Asset projection",
      heading: "Assets and investments",
      sub: "Editable forecast",
      description:
        "A positive monthly cashflow is treated as new money invested each year — it is added to the investment funds here in AP, it builds up as investment funds in the ALO Assets graph, and it is part of the future value used as the starting investment funds in block FR Funding after retirement table.",
    },
  },
  UK: {
    AI: {
      label: "AI",
      heading: "AI guided advisory",
      description:
        "Build your AI prompt. You can copy the ai-text and paste into ChatGpt.com or any other AI agents, and continue your dialogue with the AI agent of your choise. You can edit the text, and ask your burning questions; for example “When can I afford a second car, based on the information”",
      placeholder: "Your AI prompt will appear here. You can edit it freely before pasting it into an AI agent.",
    },
    PF: {
      label: "PF Planning focus",
      heading: "Tailor the outlook to your life stage",
      description: "These assumptions help the planner reflect your personal retirement trajectory.",
    },
    PUR: {
      label: "PUR, - pension savings from today until retirement",
      heading: "Additional pension contribution",
      description: "The pension payments you expect to make from today, until retirement, you can adjust each year manually in block RT Pension projection",
    },
    RI: {
      label: "RI Retirement income",
      heading: "Retirement income vs. spending",
      description:
        "Funding after retirement: each year is paid by your pensions — and, whenever the pensions after tax do not cover your yearly spending, the missing amount is drawn from your investment funds.",
    },
    FR: {
      label: "FR Funding after retirement table",
      heading: "Pensions and investments per year",
      description:
        "Every year from your retirement year to age {age}: the payout of each pension, the Additional pension contribution built from your yearly savings, your inflation-adjusted spend — and what the investment funds must cover when your pensions after tax are not enough.",
    },
    ALO: {
      label: "ALO Assets / liabilities balance overview",
      heading: "Projection, growth in investment funds (C) until retirement. You can use block AP Asset projection to make adjustments year over year",
      sub: "Investments (C) plus yearly cashflow, compounded at the PF investment yield",
      description:
        "The chart adds your yearly cashflow (income − outgoings) as new money invested each year — so cashflow becomes investment funds and keeps growing at the PF \"Average after tax yield % for investments in block C\". The same future value (incl. cashflow) is used as the starting investment funds in block FR Funding after retirement table.",
    },
    RF: {
      label: "RF Retirement funds",
      heading: "Until retirement",
      sub: "Pension pot only — other assets are not drawn down",
      description: "Projects the growth of your pension pot until retirement — pension funds only, other assets are not drawn down.",
    },
    RT: {
      label: "RT Retirement table",
      heading: "Pension projection",
      sub: "Editable forecast",
      description:
        "Each pension of type \"draw back\" (drawdown) is projected from today's balance to its payout year at the PF \"Average yield % pension funds\" — so the yield from now until the pension year is reflected — and then turned into a level yearly annuity over its payout years at the same yield. This per-pension calculation lives in lib/retirement.ts and drives block FR Funding after retirement table and the retirement-income graph. RT shows the aggregate block E pension-and-reserves path.",
    },
    AP: {
      label: "AP Asset projection",
      heading: "Assets and investments",
      sub: "Editable forecast",
      description:
        "A positive monthly cashflow is treated as new money invested each year — it is added to the investment funds here in AP, it builds up as investment funds in the ALO Assets graph, and it is part of the future value used as the starting investment funds in block FR Funding after retirement table.",
    },
  },
  DK: {
    AI: {
      label: "AI",
      heading: "AI-guidet rådgivning",
      description:
        "Byg din AI-prompt. Du kan kopiere ai-teksten og indsætte den i ChatGpt.com eller en hvilken som helst anden AI-agent og fortsætte din dialog med AI-agenten efter eget valg. Du kan redigere teksten og stille dine brændende spørgsmål; for eksempel “Hvornår har jeg råd til en bil nummer to, ud fra oplysningerne”",
      placeholder: "Din AI-prompt vises her. Du kan frit redigere den, før du indsætter den i en AI-agent.",
    },
    PF: {
      label: "PF Planlægningsfokus",
      heading: "Tilpas udsigten til din livsfase",
      description: "Disse antagelser hjælper planlæggeren med at afspejle din personlige pensionsudvikling.",
    },
    PUR: {
      label: "PUR, - pensionsopsparing fra i dag til pension",
      heading: "Yderligere pensionsbidrag",
      description: "De pensionsbetalinger, du forventer at indbetale fra i dag og frem til pension, kan du justere hvert år manuelt i blokken RT Pension projection",
    },
    RI: {
      label: "RI Pensionindtægt",
      heading: "Pensionindtægt vs. forbrug",
      description:
        "Finansiering efter pension: hvert år betales af dine pensioner — og når pensionerne efter skat ikke dækker dit årlige forbrug, trækkes det manglende beløb fra dine investeringsmidler.",
    },
    FR: {
      label: "FR Tabel over finansiering efter pension",
      heading: "Pensioner og investeringer pr. år",
      description:
        "Hvert år fra dit pensionsår til {age} år: udbetalingen af hver pension, det yderligere pensionsbidrag bygget op fra dine årlige opsparinger, dit inflationsjusterede forbrug — og hvad investeringsmidlerne skal dække, når dine pensioner efter skat ikke er nok.",
    },
    ALO: {
      label: "ALO Aktiver og gæld – balanceoversigt",
      heading: "Projektion, vækst i investeringsmidler (C) frem til pension. Du kan bruge blok AP Aktivprojektion til at justere år for år",
      sub: "Investeringer (C) plus årlig cashflow, forrentet med PF-afkastet",
      description:
        "Diagrammet lægger din årlige cashflow (indtægt − udgifter) til som nye investerede midler hvert år — så cashflow bliver til investeringsmidler og vokser med PF-afkastet \"Gennemsnitlig efter skat-afkastning i blok C\". Samme fremtidige værdi (inkl. cashflow) bruges som startinvesteringsmidler i blok FR Finansiering efter pension-tabel.",
    },
    RF: {
      label: "RF Pensionsmidler",
      heading: "Før pension",
      sub: "Kun pensionsopsparing — andre aktiver trækkes ikke fra",
      description: "Viser den forventede vækst i din pensionsopsparing frem til pension — alene baseret på pensionsmidler, andre aktiver trækkes ikke fra.",
    },
    RT: {
      label: "RT Pensionstabel",
      heading: "Pensionsprojektion",
      sub: "Redigerbar fremskrivning",
      description:
        "Hver pension af typen \"tilbageføring\" (drawdown) projekteres fra din nuværende saldo til udbetalingsåret med PF-afkastet \"Gennemsnitligt afkast på pensionsmidler\" — så afkastet fra nu til pensionsåret afspejles — og omdannes derefter til en fast årlig livrente over udbetalingsårene med samme afkast. Denne beregning per pension ligger i lib/retirement.ts og driver blok FR Finansiering efter pension-tabel og pensionsindkomstgraferne. RT viser den samlede blok E pensions- og reservevej.",
    },
    AP: {
      label: "AP Aktivprojektion",
      heading: "Aktiver og investeringer",
      sub: "Redigerbar fremskrivning",
      description:
        "En positiv månedlig cashflow behandles som nye investerede midler hvert år — den lægges til investeringsmidlerne her i AP, den opbygges som investeringsmidler i ALO Aktiver-grafen, og den indgår i den fremtidige værdi, der bruges som startinvesteringsmidler i blok FR Finansiering efter pension-tabel.",
    },
  },
  SE: {
    AI: {
      label: "AI",
      heading: "AI-guidad rådgivning",
      description:
        "Bygg din AI-prompt. Du kan kopiera ai-texten och klistra in den i ChatGpt.com eller vilken som helst annan AI-agent och fortsätta din dialog med AI-agenten efter eget valg. Du kan redigera texten och ställa dina brinnande frågor; till exempel “När har jag råd till en andra bil, utifrån uppgifterna”",
      placeholder: "Din AI-prompt visas här. Du kan fritt redigera den innan du klistrar in den i en AI-agent.",
    },
    PF: {
      label: "PF Planeringsfokus",
      heading: "Anpassa utsikten efter din livsfas",
      description: "Dessa antaganden hjälper planeraren att spegla din personliga pensionssutveckling.",
    },
    PUR: {
      label: "PUR, - pensionssparande från i dag till pensionering",
      heading: "Ytterligare pensionssparande",
      description: "De pensionssparanden du förväntar dig göra från i dag och fram till pensioneringen kan du justera varje år manuellt i blocken RT Pension projection",
    },
    RI: {
      label: "RI Pensioninkomst",
      heading: "Pensioninkomst kontra utgifter",
      description:
        "Finansiering efter pensionering: varje år betalas av dina pensioner — och när pensionerna efter skatt inte täcker dina årliga utgifter dras det belopp som saknas från dina investeringsmedel.",
    },
    FR: {
      label: "FR Tabell över finansiering efter pensionering",
      heading: "Pensioner och investeringar per år",
      description:
        "Varje år från ditt pensioneringsår till {age} år: utbetalningen av varje pension, det ytterligare pensionssparandet byggt upp från ditt årliga sparande, dina inflationsjusterade utgifter — och vad investeringsmedlen måste täcka när dina pensioner efter skatt inte räcker.",
    },
    ALO: {
      label: "ALO Tillgångar och skulder – balansöversikt",
      heading: "Projektion, tillväxt i investeringsmedel (C) fram till pension. Du kan använda block AP Tillgångsprojektion för att justera år för år",
      sub: "Investeringar (C) plus årlig kassaflöde, förräntat med PF-avkastningen",
      description:
        "Diagrammet lägger till din årliga kassaflöde (intäkter − utgifter) som nya investerade medel varje år — så kassaflöde blir till investeringsmedel och växer med PF-avkastningen \"Genomsnittlig efter skatt-avkastning i block C\". Samma framtida värde (inkl. kassaflöde) används som startinvesteringsmedel i block FR Finansiering efter pensionering-tabel.",
    },
    RF: {
      label: "RF Pensionsmedel",
      heading: "Fram till pension",
      sub: "Endast pensionssparande — andra tillgångar dras inte ned",
      description: "Visar den förväntade tillväxten i din pensionssparande fram till pension — enbart pensionsmedel, andra tillgångar dras inte ned.",
    },
    RT: {
      label: "RT Pensionstabell",
      heading: "Pensionsprojektion",
      sub: "Redigerbar prognos",
      description:
        "Varje pension av typen \"återbetalning\" (drawdown) projekteras från dagens saldo till utbetalningsåret med PF-avkastningen \"Genomsnittlig avkastning på pensionsfonder\" — så avkastningen från nu till pensionsåret avspeglas — och omvandlas sedan till en fast årlig livränta över utbetalningsåren med samma avkastning. Denna per-pension-beräkning finns i lib/retirement.ts och driver block FR Finansiering efter pensionering-tabel och pensionsinkomstgraferna. RT visar den samlade block E pensions- och reserveringsvägen.",
    },
    AP: {
      label: "AP Tillgångsprojektion",
      heading: "Tillgångar och investeringar",
      sub: "Redigerbar prognos",
      description:
        "Ett positivt månadligt kassaflöde behandlas som nya investerade medel varje år — det läggs till investeringsmedlen här i AP, det byggs upp som investeringsmedel i ALO Tillgångar-grafen, och det ingår i det framtida värdet som används som startinvesteringsmedel i block FR Finansiering efter pensionering-tabel.",
    },
  },
  NO: {
    AI: {
      label: "AI",
      heading: "AI-guidet rådgivning",
      description:
        "Bygg din AI-prompt. Du kan kopiere ai-teksten og lime den inn i ChatGpt.com eller en hvilken som helst annen AI-agent og fortsette dialogen med AI-agenten du velger. Du kan redigere teksten og stille de brennende spørsmålene dine; for eksempel “Når har jeg råd til en bil nummer to, ut fra informasjonen?”",
      placeholder: "AI-prompten din vises her. Du kan fritt redigere den før du limer den inn i en AI-agent.",
    },
    PF: {
      label: "PF Planleggingsfokus",
      heading: "Tilpass utsiktene til din livsfase",
      description: "Disse antakelsene hjelper planleggeren med å gjenspeile din personlige pensjonsutvikling.",
    },
    PUR: {
      label: "PUR, - pensjonssparing fra i dag til pensjon",
      heading: "Ytterligere pensjonssparing",
      description: "Pensjonsbetalingene du forventer å gjøre fra i dag og frem til pensjon kan du justere hvert år manuelt i blokken RT Pension projection",
    },
    RI: {
      label: "RI Pensjonsinntekt",
      heading: "Pensjonsinntekt vs. forbruk",
      description:
        "Finansiering etter pensjon: hvert år betales av pensjonene dine — og når pensjonene etter skatt ikke dekker det årlige forbruket ditt, trekkes det manglende beløpet fra investeringsmidlene dine.",
    },
    FR: {
      label: "FR Tabell over finansiering etter pensjon",
      heading: "Pensjoner og investeringer per år",
      description:
        "Hvert år fra pensjonsåret ditt til {age} år: utbetalingen av hver pensjon, den ytterligere pensjonssparingen bygget fra dine årlige sparepenger, det inflasjonsjusterte forbruket ditt — og hva investeringsmidlene må dekke når pensjonene etter skatt ikke er nok.",
    },
    ALO: {
      label: "ALO Eiendeler og gjeld – balanseoversikt",
      heading: "Proksjon, vekst i investeringsmidler (C) frem til pensjon. Du kan bruke blok AP Aktivproksjon for å justere år for år",
      sub: "Investeringer (C) plus årlig kontantstrøm, forrentet med PF-avkastet",
      description:
        "Diagrammet legger til din årlige kontantstrøm (inntekter − utgifter) som nye investerte midler hvert år — så kontantstrøm blir til investeringsmidler og vokser med PF-avkastet \"Gjennomsnittlig etter skatt-avkastning i blok C\". Samme fremtidige verdi (inkl. kontantstrøm) brukes som startinvesteringer i blok FR Finansiering etter pensjon-tabel.",
    },
    RF: {
      label: "RF Pensjonsmidler",
      heading: "Før pensjon",
      sub: "Kun pensjonssparing — andre eiendeler trekkes ikke fra",
      description: "Viser den forventede veksten i pensjonssparingen din frem til pensjon — alene basert på pensjonsmidler, andre eiendeler trekkes ikke fra.",
    },
    RT: {
      label: "RT Pensjonstabell",
      heading: "Pensjonsproksjon",
      sub: "Redigerbar fremskrivning",
      description:
        "Hver pensjon av typen \"utbetaling\" (drawdown) projiseres fra dagens saldo til utbetalingsåret med PF-avkastet \"Gjennomsnittlig avkastning på pensjonsfond\" — så avkastet fra nå til pensjonsåret avspeiles — og omdannes deretter til en fast årlig livrente over utbetalingsårene med samme avkast. Denne beregningen per pensjon ligger i lib/retirement.ts og driver blok FR Finansiering etter pensjon-tabel og pensjonsinntektsgrafene. RT viser den samlede blok E pensjons- og reserveringsveien.",
    },
    AP: {
      label: "AP Aktivproksjon",
      heading: "Eiendeler og investeringer",
      sub: "Redigerbar fremskrivning",
      description:
        "En positiv månedlig kontantstrøm behandles som nye investerte midler hvert år — den legges til investeringsmidlene her i AP, den bygges opp som investeringsmidler i ALO Eiendeler-grafen, og den er en del av den fremtidige verdien som brukes som startinvesteringer i blok FR Finansiering etter pensjon-tabel.",
    },
  },
  FI: {
    AI: {
      label: "AI",
      heading: "AI-ohjattu neuvonta",
      description:
        "Rakenna AI-promptisi. Voit kopioida AI-tekstin ja liittää sen ChatGpt.com:iin mihin tahansa muuhun AI-agenttiin ja jatkaa keskustelua valitsemallasi AI-agentilla. Voit muokata tekstiä ja esittää kiireellisiä kysymyksiä; esimerkiksi “Milloin minulla on varaa toiseen autoon, tietojen perusteella”",
      placeholder: "AI-promptisi näkyy tässä. Voit vapaasti muokata sitä ennen kuin liität sen AI-agenttiin.",
    },
    PF: {
      label: "PF Suunnittelufokus",
      heading: "Mukauta näkymää elämäntilanteeseesi",
      description: "Nämä oletukset auttavat suunnittelijaa heijastamaan henkilökohtaista eläkekehitystäsi.",
    },
    PUR: {
      label: "PUR, - eläkesäästöt tänään eläkkeelle jäämiseen asti",
      heading: "Lisäeläkesäästöt",
      description: "Eläkemaksut, jotka aiot suorittaa tänään eläkkeelle jäämiseen asti, voit säätää joka vuosi manuaalisesti RT Pension projection -lohkossa",
    },
    RI: {
      label: "RI Eläketulot",
      heading: "Eläketulot vs. kulutus",
      description:
        "Rahoitus eläkkeen jälkeen: jokainen vuosi maksetaan eläkkeistäsi — ja kun eläkkeet verojen jälkeen eivät kata vuosikulutuksiasi, puuttuva summa otetaan sijoitusvaroistasi.",
    },
    FR: {
      label: "FR Rahoitustaulukko eläkkeen jälkeen",
      heading: "Eläkkeet ja sijoitukset vuosittain",
      description:
        "Jokainen vuosi eläkevuodestasi {age}-vuotiaaksi: kunkin eläkkeen maksu, vuosittaisista säästöistäsi kootut lisäeläkemaksut, inflaatioon korjattu kulutus — ja mitä sijoitusvarojen on kattava, kun eläkkeesi verojen jälkeen eivät riitä.",
    },
    ALO: {
      label: "ALO Varat ja velat – tasekatsaus",
      heading: "Ennuste, sijoitusvarojen (C) kasvu eläkkeeseen asti. Voit käyttää blokin AP Varaprojektiota säätääksesi vuosi vuodelta",
      sub: "Sijoitukset (C) plus vuotuinen kassavirta, kerryttäen PF-tuotolla",
      description:
        "Kaavio lisää vuotuisen kassavirran (tulot − menot) uutena sijoitettavana rahana joka vuosi — niin kassavirrasta tulee sijoitusvaroja ja ne kasvavat PF-tuotolla \"Keskimääräinen verojen jälkeinen tuotto blokissa C\". Samat tulevaisuuden arvot (sis. kassavirta) käytetään lähtösijoitusvaroina blokin FR Rahoitustaulukko eläkkeen jälkeen -taulukossa.",
    },
    RF: {
      label: "RF Eläkevarat",
      heading: "Ennen eläkkeelle jäämistä",
      sub: "Vain eläkesäästöt — muita varoja ei nosteta",
      description: "Näyttää eläkevarojen odotetun kasvun eläkkeelle jäämiseen asti — ainoastaan eläkevarat, muita varoja ei nosteta.",
    },
    RT: {
      label: "RT Eläketaulukko",
      heading: "Eläke-ennuste",
      sub: "Muokattava ennuste",
      description:
        "Jokainen \"nostettava\" (drawdown) -tyyppinen eläke ennustetaan nykyisestä saldosta nostovuoteen PF-tuotolla \"Keskimääräinen eläkerahastojen tuotto\" — niin tuotto nyt asti nostovuoteen heijastuu — ja muutetaan sitten tasaksi vuosittaisiksi eläkkeiksi nostovuosien ajaksi samalla tuotolla. Tämä per-eläke-laskelma on lib/retirement.ts:ssä ja se ajaa blokin FR Rahoitustaulukko eläkkeen jälkeen -taulukkoa ja eläketulografi. RT näyttää kokonaiseläke- ja reservipolun blokista E.",
    },
    AP: {
      label: "AP Varaprojekti",
      heading: "Varat ja sijoitukset",
      sub: "Muokattava ennuste",
      description:
        "Positiivinen kuukausittainen kassavirta käsitellään uutena sijoitettavana rahana joka vuosi — se lisätään sijoitusvaroihin tässä AP:ssa, se kertyy sijoitusvaroiksi ALO Varat -kaaviossa, ja se on osa tulevaisuuden arvoa, jota käytetään lähtösijoitusvaroina blokin FR Rahoitustaulukko eläkkeen jälkeen -taulukossa.",
    },
  },
};

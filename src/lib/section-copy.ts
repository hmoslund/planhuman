// Section copy for the planning & analysis blocks (AI, PF, PUR, RI, FR).
// Same shape and lookup pattern as blockTranslations/guideCopy in block-copy.ts,
// so every section label, heading and description follows the user's selected
// language like the wealth blocks (A, A2, …) do.
// Kept in its own file because block-copy.ts is generated from translation4.csv.

import type { CountryCode } from "./block-copy";

export type SectionCopy = {
  label: string;
  heading: string;
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
  },
};

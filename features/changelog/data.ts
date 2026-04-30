export type ChangelogCategory = "feature" | "api" | "fix" | "improvement";

export interface ChangelogEntry {
  date: string;
  title: string;
  summary: string;
  highlights?: string[];
  category: ChangelogCategory;
}

const changelogData: Record<string, ChangelogEntry[]> = {
  sk: [
    {
      date: "2026-04-30",
      category: "api",
      title: "Štýlovanie QR kódu cez API",
      summary:
        "REST API teraz prijíma vlastné farby, okraj a úroveň korekcie chýb pri generovaní QR kódu.",
      highlights: [
        "darkColor / lightColor (#RRGGBB alebo #RRGGBBAA, vrátane priehľadnosti)",
        "margin 0-10 (šírka tichej zóny)",
        "errorCorrectionLevel L | M | Q | H",
      ],
    },
    {
      date: "2026-04-30",
      category: "feature",
      title: "Výber veľkosti pri sťahovaní",
      summary:
        "Pri sťahovaní, kopírovaní a zdieľaní QR kódu si zvolíte veľkosť 128, 256, 512 alebo 1024 px.",
    },
    {
      date: "2026-04-30",
      category: "improvement",
      title: "Jemnejšia animácia a hmatová odozva",
      summary:
        "Pridali sme zladený systém pohybu naprieč tlačidlami, dialógmi a ovládacími prvkami pre prirodzenejší pocit z aplikácie.",
    },
    {
      date: "2026-04-30",
      category: "feature",
      title: "Kontrola čitateľnosti v reálnom čase",
      summary:
        "Customizer upozorní, keď je logo príliš veľké alebo kontrast nedostatočný, takže QR kód zostane skenovateľný.",
    },
    {
      date: "2026-04-29",
      category: "feature",
      title: "QR Studio - pokročilý editor",
      summary:
        "Nová stránka /studio s živým náhľadom, samostatnou plochou pre dizajn a šablónami zdieľanými s domovským customizerom.",
    },
    {
      date: "2026-04-11",
      category: "feature",
      title: "SPAYD v hromadnom generovaní",
      summary:
        "Hromadné generovanie z CSV teraz podporuje aj český formát SPAYD popri PAY by square a EPC QR.",
    },
    {
      date: "2026-04-08",
      category: "improvement",
      title: "Voliteľná suma a oznamovací banner",
      summary:
        "Suma na hlavnej stránke je voliteľná. Pridali sme oznamovací banner pre informácie o novinkách a niekoľko UX zlepšení.",
    },
    {
      date: "2026-03-21",
      category: "improvement",
      title: "Animácia načítavania v štýle Game of Life",
      summary:
        "Nahradili sme štandardný spinner subtílnou animáciou Conwayho Hry života, ktorá sa hodí k pixel-art estetike aplikácie.",
    },
    {
      date: "2026-03-11",
      category: "api",
      title: "Verejné REST API a stránka /docs",
      summary:
        "Spustili sme verejné REST API pre generovanie QR kódov spolu so stránkou s dokumentáciou, formulárom Try it a príkladmi v 5 jazykoch.",
    },
    {
      date: "2026-03-11",
      category: "feature",
      title: "Podpora SPAYD (QR Platba CZ)",
      summary:
        "Pridali sme podporu pre český štandard SPAYD, takže môžete generovať QR platby pre všetky české banky.",
    },
    {
      date: "2026-03-09",
      category: "feature",
      title: "Štýly bodov a text v strede QR kódu",
      summary:
        "Customizer dostal štýly bodov (štvorce, zaoblené, bodky, elegantné) a možnosť pridať text alebo logo do stredu QR kódu.",
    },
    {
      date: "2026-02-25",
      category: "feature",
      title: "Výber meny EUR / CZK",
      summary:
        "PAY by square aj SPAYD podporujú prepínanie medzi EUR a CZK pre cezhraničné platby.",
    },
    {
      date: "2026-02-25",
      category: "api",
      title: "WebMCP a llms.txt pre AI agentov",
      summary:
        "AI agenti vo vašom prehliadači môžu generovať QR kódy priamo cez W3C Web Model Context API. Pridali sme llms.txt pre lepšie objavovanie AI nástrojmi.",
    },
  ],
  en: [
    {
      date: "2026-04-30",
      category: "api",
      title: "QR styling via API",
      summary:
        "The REST API now accepts custom colors, margin, and error correction level when generating a QR code.",
      highlights: [
        "darkColor / lightColor (#RRGGBB or #RRGGBBAA, transparency supported)",
        "margin 0-10 (quiet zone width)",
        "errorCorrectionLevel L | M | Q | H",
      ],
    },
    {
      date: "2026-04-30",
      category: "feature",
      title: "Download size picker",
      summary:
        "Choose 128, 256, 512, or 1024 px when downloading, copying, or sharing the QR code.",
    },
    {
      date: "2026-04-30",
      category: "improvement",
      title: "Refined motion and tactile feedback",
      summary:
        "A unified motion system across buttons, dialogs, and controls makes the app feel more responsive.",
    },
    {
      date: "2026-04-30",
      category: "feature",
      title: "Live scannability guardrails",
      summary:
        "The customizer warns when the logo is too large or contrast is too low, so the QR code stays scannable.",
    },
    {
      date: "2026-04-29",
      category: "feature",
      title: "QR Studio - advanced editor",
      summary:
        "A new /studio page with a live preview, dedicated design canvas, and templates shared with the home customizer.",
    },
    {
      date: "2026-04-11",
      category: "feature",
      title: "SPAYD in bulk generation",
      summary:
        "Bulk CSV generation now supports SPAYD (Czech format) alongside PAY by square and EPC QR.",
    },
    {
      date: "2026-04-08",
      category: "improvement",
      title: "Optional amount and announcement banner",
      summary:
        "The amount on the home form is now optional. We also added an announcement banner for release news and several UX improvements.",
    },
    {
      date: "2026-03-21",
      category: "improvement",
      title: "Game of Life loading animation",
      summary:
        "Replaced the default spinner with a subtle Conway's Game of Life animation that fits the app's pixel-art aesthetic.",
    },
    {
      date: "2026-03-11",
      category: "api",
      title: "Public REST API and /docs page",
      summary:
        "We launched the public QR generation REST API along with a documentation page featuring a Try it form and code samples in 5 languages.",
    },
    {
      date: "2026-03-11",
      category: "feature",
      title: "SPAYD (Czech QR Platba) support",
      summary:
        "Added support for the Czech SPAYD standard, so you can generate payment QR codes for all Czech banks.",
    },
    {
      date: "2026-03-09",
      category: "feature",
      title: "Dot styles and center text",
      summary:
        "The customizer gained dot styles (square, rounded, dots, classy) and the option to place text or a logo in the center of the QR code.",
    },
    {
      date: "2026-02-25",
      category: "feature",
      title: "EUR / CZK currency picker",
      summary:
        "PAY by square and SPAYD both support switching between EUR and CZK for cross-border payments.",
    },
    {
      date: "2026-02-25",
      category: "api",
      title: "WebMCP and llms.txt for AI agents",
      summary:
        "In-browser AI agents can generate QR codes directly via the W3C Web Model Context API. We added llms.txt for better discovery by AI tools.",
    },
  ],
  cs: [
    {
      date: "2026-04-30",
      category: "api",
      title: "Stylování QR kódu přes API",
      summary:
        "REST API nyní přijímá vlastní barvy, okraj a úroveň korekce chyb při generování QR kódu.",
      highlights: [
        "darkColor / lightColor (#RRGGBB nebo #RRGGBBAA, včetně průhlednosti)",
        "margin 0-10 (šířka tiché zóny)",
        "errorCorrectionLevel L | M | Q | H",
      ],
    },
    {
      date: "2026-04-30",
      category: "feature",
      title: "Výběr velikosti při stahování",
      summary:
        "Při stahování, kopírování a sdílení QR kódu si zvolíte velikost 128, 256, 512 nebo 1024 px.",
    },
    {
      date: "2026-04-30",
      category: "improvement",
      title: "Jemnější animace a hmatová odezva",
      summary:
        "Sjednotili jsme systém pohybu napříč tlačítky, dialogy a ovládacími prvky pro přirozenější pocit z aplikace.",
    },
    {
      date: "2026-04-30",
      category: "feature",
      title: "Kontrola čitelnosti v reálném čase",
      summary:
        "Customizer upozorní, když je logo příliš velké nebo kontrast nízký, aby QR kód zůstal skenovatelný.",
    },
    {
      date: "2026-04-29",
      category: "feature",
      title: "QR Studio - pokročilý editor",
      summary:
        "Nová stránka /studio s živým náhledem, samostatným plátnem pro design a šablonami sdílenými s domácím customizerem.",
    },
    {
      date: "2026-04-11",
      category: "feature",
      title: "SPAYD v hromadném generování",
      summary:
        "Hromadné generování z CSV nyní podporuje i český formát SPAYD vedle PAY by square a EPC QR.",
    },
    {
      date: "2026-04-08",
      category: "improvement",
      title: "Volitelná částka a oznamovací banner",
      summary:
        "Částka na domovské stránce je volitelná. Přidali jsme oznamovací banner pro informace o novinkách a několik UX vylepšení.",
    },
    {
      date: "2026-03-21",
      category: "improvement",
      title: "Animace načítání ve stylu Game of Life",
      summary:
        "Nahradili jsme výchozí spinner jemnou animací Conwayovy Hry života, která zapadá do pixel-art estetiky aplikace.",
    },
    {
      date: "2026-03-11",
      category: "api",
      title: "Veřejné REST API a stránka /docs",
      summary:
        "Spustili jsme veřejné REST API pro generování QR kódů spolu se stránkou s dokumentací, formulářem Try it a příklady v 5 jazycích.",
    },
    {
      date: "2026-03-11",
      category: "feature",
      title: "Podpora SPAYD (QR Platba CZ)",
      summary:
        "Přidali jsme podporu českého standardu SPAYD, takže můžete generovat QR platby pro všechny české banky.",
    },
    {
      date: "2026-03-09",
      category: "feature",
      title: "Styly bodů a text uprostřed QR kódu",
      summary:
        "Customizer získal styly bodů (čtverce, zaoblené, tečky, elegantní) a možnost přidat text nebo logo do středu QR kódu.",
    },
    {
      date: "2026-02-25",
      category: "feature",
      title: "Výběr měny EUR / CZK",
      summary:
        "PAY by square i SPAYD podporují přepínání mezi EUR a CZK pro přeshraniční platby.",
    },
    {
      date: "2026-02-25",
      category: "api",
      title: "WebMCP a llms.txt pro AI agenty",
      summary:
        "AI agenti ve vašem prohlížeči mohou generovat QR kódy přímo přes W3C Web Model Context API. Přidali jsme llms.txt pro lepší objevování AI nástroji.",
    },
  ],
};

export function getChangelogData(locale: string): ChangelogEntry[] {
  return changelogData[locale] ?? changelogData.sk;
}

export function getLatestChangelogDate(locale = "sk"): string {
  const entries = getChangelogData(locale);
  return entries[0]?.date ?? new Date().toISOString().slice(0, 10);
}

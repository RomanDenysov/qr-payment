interface FaqItem {
  question: string;
  answer: string;
}

const faqData: Record<string, FaqItem[]> = {
  sk: [
    {
      question: "Aký je rozdiel medzi QR Platby a systémom NOP?",
      answer:
        "QR Platby generuje QR kódy pre bankové prevody podľa štandardu PAY by square - ideálne pre faktúry, e-maily a webstránky. Pre kamenné predajne s eKasou existuje štátny systém NOP (Notifikátor okamžitých platieb), ktorý slúži na okamžité oznámenie platby priamo na pokladnicu.",
    },
    {
      question: "Čo je QR Platby?",
      answer:
        "QR Platby je bezplatný online nástroj na vytváranie QR kódov pre bankové platby. Podporuje formáty BySquare (štandard pre Slovensko) a EPC QR (SEPA štandard pre Európu).",
    },
    {
      question: "Ako to funguje?",
      answer:
        "Zadáte platobné údaje (IBAN, sumu, variabilný symbol a pod.), kliknete na Vygenerovať a získate QR kód. Ten naskenujete bankovou aplikáciou a platba sa automaticky vyplní.",
    },
    {
      question: "Je to zadarmo?",
      answer:
        "Áno, QR Platby je úplne zadarmo a bez registrácie. Neexistujú žiadne skryté poplatky ani obmedzenia počtu generovaní.",
    },
    {
      question: "Sú moje údaje v bezpečí?",
      answer:
        "Áno. Všetky údaje sa spracúvajú priamo vo vašom prehliadači a nikdy neopúšťajú vaše zariadenie. Nepoužívame cookies, nezbierame osobné údaje a nemáme žiadnu databázu.",
    },
    {
      question: "S ktorými bankami to funguje?",
      answer:
        "QR kódy vo formáte BySquare fungujú so všetkými slovenskými bankami - Tatra banka, Slovenská sporiteľňa, VÚB, ČSOB, mBank, Fio banka a ďalšie. EPC QR formát je podporovaný väčšinou európskych bánk.",
    },
    {
      question: "Aký je rozdiel medzi BySquare a EPC QR?",
      answer:
        "BySquare je slovenský štandard pre platobné QR kódy - podporuje variabilný, špecifický a konštantný symbol. EPC QR (European Payments Council) je európsky SEPA štandard, ktorý funguje naprieč krajinami EÚ, ale nepodporuje slovenské symboly. Ak platíte na Slovensku, použite BySquare. Pre medzinárodné SEPA platby zvoľte EPC QR.",
    },
    {
      question: "Môžem si QR kód upraviť?",
      answer:
        "Áno. Môžete zmeniť farbu QR kódu a pozadia, pridať text do stredu alebo vlastné logo. Všetky úpravy sú viditeľné v reálnom čase.",
    },
    {
      question: "Čo je hromadné generovanie?",
      answer:
        "Funkcia hromadného generovania umožňuje vytvoriť viacero QR kódov naraz z CSV súboru. Výsledky si stiahnete ako ZIP archív alebo PDF dokument.",
    },
    {
      question: "Funguje to offline?",
      answer:
        "Čiastočne. Po prvom načítaní stránky môžete generovať QR kódy aj bez internetového pripojenia. História platieb a nastavenia sa ukladajú lokálne vo vašom prehliadači.",
    },
  ],
  en: [
    {
      question: "What is the difference between QR Platby and the NOP system?",
      answer:
        "QR Platby generates QR codes for bank transfers using the PAY by square standard - ideal for invoices, emails, and websites. For brick-and-mortar stores with eKasa, there is the state NOP system (Instant Payment Notifier) that provides instant payment confirmation directly to the cash register.",
    },
    {
      question: "What is QR Platby?",
      answer:
        "QR Platby is a free online tool for creating QR codes for bank payments. It supports BySquare format (standard for Slovakia) and EPC QR (SEPA standard for Europe).",
    },
    {
      question: "How does it work?",
      answer:
        "Enter payment details (IBAN, amount, variable symbol, etc.), click Generate, and you get a QR code. Scan it with your banking app and the payment fills in automatically.",
    },
    {
      question: "Is it free?",
      answer:
        "Yes, QR Platby is completely free with no registration required. There are no hidden fees or limits on the number of codes you can generate.",
    },
    {
      question: "Is my data safe?",
      answer:
        "Yes. All data is processed directly in your browser and never leaves your device. We don't use cookies, don't collect personal data, and don't have any database.",
    },
    {
      question: "Which banks does it work with?",
      answer:
        "BySquare QR codes work with all Slovak banks - Tatra banka, Slovenská sporiteľňa, VÚB, ČSOB, mBank, Fio banka, and more. EPC QR format is supported by most European banks.",
    },
    {
      question: "What is the difference between BySquare and EPC QR?",
      answer:
        "BySquare is the Slovak standard for payment QR codes - it supports variable, specific, and constant symbols. EPC QR (European Payments Council) is a European SEPA standard that works across EU countries but does not support Slovak symbols. For payments within Slovakia, use BySquare. For international SEPA payments, choose EPC QR.",
    },
    {
      question: "Can I customize the QR code?",
      answer:
        "Yes. You can change the QR code and background colors, add center text or your own logo. All changes are visible in real time.",
    },
    {
      question: "What is bulk generation?",
      answer:
        "The bulk generation feature lets you create multiple QR codes at once from a CSV file. Download the results as a ZIP archive or PDF document.",
    },
    {
      question: "Does it work offline?",
      answer:
        "Partially. After the first page load, you can generate QR codes even without an internet connection. Payment history and settings are stored locally in your browser.",
    },
  ],
  cs: [
    {
      question: "Jaký je rozdíl mezi QR Platby a systémem NOP?",
      answer:
        "QR Platby generuje QR kódy pro bankovní převody podle standardu PAY by square - ideální pro faktury, e-maily a webové stránky. Pro kamenné prodejny s eKasou existuje státní systém NOP (Notifikátor okamžitých plateb), který slouží k okamžitému oznámení platby přímo na pokladnu.",
    },
    {
      question: "Co je QR Platby?",
      answer:
        "QR Platby je bezplatný online nástroj na vytváření QR kódů pro bankovní platby. Podporuje formáty BySquare (standard pro Slovensko) a EPC QR (SEPA standard pro Evropu).",
    },
    {
      question: "Jak to funguje?",
      answer:
        "Zadáte platební údaje (IBAN, částku, variabilní symbol apod.), kliknete na Vygenerovat a získáte QR kód. Ten naskenujete bankovní aplikací a platba se automaticky vyplní.",
    },
    {
      question: "Je to zdarma?",
      answer:
        "Ano, QR Platby je zcela zdarma a bez registrace. Neexistují žádné skryté poplatky ani omezení počtu generování.",
    },
    {
      question: "Jsou moje údaje v bezpečí?",
      answer:
        "Ano. Všechny údaje se zpracovávají přímo ve vašem prohlížeči a nikdy neopouštějí vaše zařízení. Nepoužíváme cookies, neshromažďujeme osobní údaje a nemáme žádnou databázi.",
    },
    {
      question: "Se kterými bankami to funguje?",
      answer:
        "QR kódy ve formátu BySquare fungují se všemi slovenskými bankami - Tatra banka, Slovenská sporiteľňa, VÚB, ČSOB, mBank, Fio banka a další. EPC QR formát je podporován většinou evropských bank.",
    },
    {
      question: "Jaký je rozdíl mezi BySquare a EPC QR?",
      answer:
        "BySquare je slovenský standard pro platební QR kódy - podporuje variabilní, specifický a konstantní symbol. EPC QR (European Payments Council) je evropský SEPA standard, který funguje napříč zeměmi EU, ale nepodporuje slovenské symboly. Pokud platíte na Slovensku, použijte BySquare. Pro mezinárodní SEPA platby zvolte EPC QR.",
    },
    {
      question: "Můžu si QR kód upravit?",
      answer:
        "Ano. Můžete změnit barvu QR kódu a pozadí, přidat text do středu nebo vlastní logo. Všechny úpravy jsou viditelné v reálném čase.",
    },
    {
      question: "Co je hromadné generování?",
      answer:
        "Funkce hromadného generování umožňuje vytvořit více QR kódů najednou z CSV souboru. Výsledky si stáhnete jako ZIP archiv nebo PDF dokument.",
    },
    {
      question: "Funguje to offline?",
      answer:
        "Částečně. Po prvním načtení stránky můžete generovat QR kódy i bez internetového připojení. Historie plateb a nastavení se ukládají lokálně ve vašem prohlížeči.",
    },
  ],
};

export function getFaqData(locale: string): FaqItem[] {
  return faqData[locale] ?? faqData.sk;
}

interface FaqItem {
  question: string;
  answer: string;
}

const faqData: Record<string, FaqItem[]> = {
  sk: [
    {
      question: "Čo je SPAYD (QR Platba)?",
      answer:
        "SPAYD (QR Platba) je český štandard pre platobné QR kódy zavedený Českou bankovnou asociáciou. Formát SPD (Short Payment Descriptor) podporujú všetky české banky - Air Bank, Česká spořitelna, ČSOB, Fio banka, Komerční banka, Raiffeisenbank, mBank a ďalšie. QR Platby tento formát plne podporuje.",
    },
    {
      question: "Čo je QR Platby?",
      answer:
        "QR Platby je bezplatný online nástroj na vytváranie QR kódov pre bankové platby. Podporuje formáty BySquare (štandard pre Slovensko), EPC QR (SEPA štandard pre Európu) a SPAYD (štandard pre Česko).",
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
        "QR kódy vo formáte BySquare fungujú so všetkými slovenskými bankami - Tatra banka, Slovenská sporiteľňa, VÚB, ČSOB, mBank, Fio banka a ďalšie. Formát SPAYD (QR Platba) funguje so všetkými českými bankami - Air Bank, Česká spořitelna, ČSOB, Fio banka, Komerční banka, Raiffeisenbank a ďalšie. EPC QR formát je podporovaný väčšinou európskych bánk.",
    },
    {
      question: "Aký je rozdiel medzi BySquare, EPC QR a SPAYD?",
      answer:
        "BySquare je slovenský štandard pre platobné QR kódy - podporuje variabilný, špecifický a konštantný symbol. SPAYD (QR Platba) je český štandard s rovnakými symbolmi, ale v inom formáte. EPC QR (European Payments Council) je európsky SEPA štandard, ktorý funguje naprieč krajinami EÚ, ale nepodporuje české a slovenské symboly. Na platby na Slovensku použite BySquare, na platby v Česku SPAYD a na medzinárodné SEPA platby EPC QR.",
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
      question: "What is SPAYD (QR Platba)?",
      answer:
        "SPAYD (QR Platba) is a Czech standard for payment QR codes established by the Czech Banking Association. The SPD (Short Payment Descriptor) format is supported by all Czech banks - Air Bank, Česká spořitelna, ČSOB, Fio banka, Komerční banka, Raiffeisenbank, mBank and others. QR Platby fully supports this format.",
    },
    {
      question: "What is QR Platby?",
      answer:
        "QR Platby is a free online tool for creating QR codes for bank payments. It supports BySquare format (standard for Slovakia), EPC QR (SEPA standard for Europe), and SPAYD (standard for Czech Republic).",
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
        "BySquare QR codes work with all Slovak banks - Tatra banka, Slovenská sporiteľňa, VÚB, ČSOB, mBank, Fio banka, and more. SPAYD (QR Platba) format works with all Czech banks - Air Bank, Česká spořitelna, ČSOB, Fio banka, Komerční banka, Raiffeisenbank, and more. EPC QR format is supported by most European banks.",
    },
    {
      question: "What is the difference between BySquare, EPC QR, and SPAYD?",
      answer:
        "BySquare is the Slovak standard for payment QR codes - it supports variable, specific, and constant symbols. SPAYD (QR Platba) is the Czech standard with the same symbols but in a different format. EPC QR (European Payments Council) is a European SEPA standard that works across EU countries but does not support Czech and Slovak symbols. For payments within Slovakia, use BySquare. For payments within Czech Republic, use SPAYD. For international SEPA payments, choose EPC QR.",
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
      question: "Co je QR Platba (SPAYD)?",
      answer:
        "QR Platba (SPAYD) je český standard pro platební QR kódy zavedený Českou bankovní asociací. Formát SPD (Short Payment Descriptor) podporují všechny české banky - Air Bank, Česká spořitelna, ČSOB, Fio banka, Komerční banka, Raiffeisenbank, mBank a další. QR Platby tento formát plně podporuje.",
    },
    {
      question: "Co je QR Platby?",
      answer:
        "QR Platby je bezplatný online nástroj na vytváření QR kódů pro bankovní platby. Podporuje formáty BySquare (standard pro Slovensko), EPC QR (SEPA standard pro Evropu) a SPAYD/QR Platba (standard pro Česko).",
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
        "QR kódy ve formátu BySquare fungují se všemi slovenskými bankami - Tatra banka, Slovenská sporiteľňa, VÚB, ČSOB, mBank, Fio banka a další. Formát SPAYD (QR Platba) funguje se všemi českými bankami - Air Bank, Česká spořitelna, ČSOB, Fio banka, Komerční banka, Raiffeisenbank a další. EPC QR formát je podporován většinou evropských bank.",
    },
    {
      question: "Jaký je rozdíl mezi BySquare, EPC QR a SPAYD?",
      answer:
        "BySquare je slovenský standard pro platební QR kódy - podporuje variabilní, specifický a konstantní symbol. SPAYD (QR Platba) je český standard se stejnými symboly, ale v jiném formátu. EPC QR (European Payments Council) je evropský SEPA standard, který funguje napříč zeměmi EU, ale nepodporuje české a slovenské symboly. Pro platby na Slovensku použijte BySquare, pro platby v Česku SPAYD a pro mezinárodní SEPA platby EPC QR.",
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

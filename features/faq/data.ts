interface FaqItem {
  question: string;
  answer: string;
}

const faqData: Record<string, FaqItem[]> = {
  sk: [
    {
      question: "Čo je QR Platby?",
      answer:
        "QR Platby je bezplatný online nástroj na vytváranie QR kódov pre bankové platby. Podporuje formáty BySquare (štandard pre Slovensko), EPC QR (SEPA štandard pre Európu) a SPAYD (štandard pre Česko). Všetky údaje sa spracúvajú priamo vo vašom prehliadači - nezbierame žiadne osobné údaje.",
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
      question: "Čo je SPAYD (QR Platba)?",
      answer:
        "SPAYD (QR Platba) je český štandard pre platobné QR kódy zavedený Českou bankovnou asociáciou. Formát SPD (Short Payment Descriptor) podporujú všetky české banky - Air Bank, Česká spořitelna, ČSOB, Fio banka, Komerční banka, Raiffeisenbank, mBank a ďalšie. QR Platby tento formát plne podporuje.",
    },
    {
      question: "Môžem si QR kód upraviť?",
      answer:
        "Áno. Môžete zmeniť farbu QR kódu a pozadia, vybrať štýl bodov (štvorce, zaoblené, kruhy alebo elegantné), pridať text do stredu alebo vlastné logo. Všetky úpravy sú viditeľné v reálnom čase. Nastavenia si môžete uložiť ako šablónu pre opakované použitie.",
    },
    {
      question: "Čo je hromadné generovanie?",
      answer:
        "Funkcia hromadného generovania umožňuje vytvoriť viacero QR kódov naraz z CSV súboru. Výsledky si stiahnete ako ZIP archív alebo PDF dokument, prípadne ich priamo vytlačíte.",
    },
    {
      question: "Ako môžem zdieľať platbu?",
      answer:
        "Kliknite na tlačidlo Zdieľať link a skopírujte odkaz. Odkaz obsahuje všetky platobné údaje vrátane IBAN, sumy, symbolov, poznámky a vzhľadu QR kódu. Príjemca po otvorení odkazu uvidí stránku s QR kódom, ktorý naskenuje bankovou aplikáciou.",
    },
    {
      question: "Je dostupné API?",
      answer:
        "Áno. QR Platby ponúka bezplatné REST API bez nutnosti API kľúča. Môžete ho integrovať do vlastnej aplikácie, chatbota alebo workflow. API podporuje všetky tri formáty - BySquare, EPC QR aj SPAYD. Limit je 10 požiadaviek za minútu.",
    },
    {
      question: "Funguje to offline?",
      answer:
        "Čiastočne. Po prvom načítaní stránky môžete generovať QR kódy aj bez internetového pripojenia. História platieb a nastavenia sa ukladajú lokálne vo vašom prehliadači.",
    },
  ],
  en: [
    {
      question: "What is QR Platby?",
      answer:
        "QR Platby is a free online tool for creating QR codes for bank payments. It supports BySquare format (standard for Slovakia), EPC QR (SEPA standard for Europe), and SPAYD (standard for Czech Republic). All data is processed directly in your browser - we don't collect any personal data.",
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
        "BySquare QR codes work with all Slovak banks - Tatra banka, Slovenska sporitelna, VUB, CSOB, mBank, Fio banka, and more. SPAYD (QR Platba) format works with all Czech banks - Air Bank, Ceska sporitelna, CSOB, Fio banka, Komercni banka, Raiffeisenbank, and more. EPC QR format is supported by most European banks.",
    },
    {
      question: "What is the difference between BySquare, EPC QR, and SPAYD?",
      answer:
        "BySquare is the Slovak standard for payment QR codes - it supports variable, specific, and constant symbols. SPAYD (QR Platba) is the Czech standard with the same symbols but in a different format. EPC QR (European Payments Council) is a European SEPA standard that works across EU countries but does not support Czech and Slovak symbols. For payments within Slovakia, use BySquare. For payments within Czech Republic, use SPAYD. For international SEPA payments, choose EPC QR.",
    },
    {
      question: "What is SPAYD (QR Platba)?",
      answer:
        "SPAYD (QR Platba) is a Czech standard for payment QR codes established by the Czech Banking Association. The SPD (Short Payment Descriptor) format is supported by all Czech banks - Air Bank, Ceska sporitelna, CSOB, Fio banka, Komercni banka, Raiffeisenbank, mBank and others. QR Platby fully supports this format.",
    },
    {
      question: "Can I customize the QR code?",
      answer:
        "Yes. You can change the QR code and background colors, choose a dot style (square, rounded, circles, or classy), and add center text or your own logo. All changes are visible in real time. You can also save your customization settings as a template for reuse.",
    },
    {
      question: "What is bulk generation?",
      answer:
        "The bulk generation feature lets you create multiple QR codes at once from a CSV file. Download the results as a ZIP archive or PDF document, or print them directly.",
    },
    {
      question: "How can I share a payment?",
      answer:
        "Click the Share link button and copy the link. The link contains all payment details including IBAN, amount, symbols, note, and QR code appearance. The recipient will see a page with the QR code that they can scan using their banking app.",
    },
    {
      question: "Is there an API available?",
      answer:
        "Yes. QR Platby offers a free REST API with no API key required. You can integrate it into your own app, chatbot, or workflow. The API supports all three formats - BySquare, EPC QR, and SPAYD. The rate limit is 10 requests per minute.",
    },
    {
      question: "Does it work offline?",
      answer:
        "Partially. After the first page load, you can generate QR codes even without an internet connection. Payment history and settings are stored locally in your browser.",
    },
  ],
  cs: [
    {
      question: "Co je QR Platby?",
      answer:
        "QR Platby je bezplatny online nastroj na vytvareni QR kodu pro bankovni platby. Podporuje formaty SPAYD/QR Platba (standard pro Cesko), BySquare (standard pro Slovensko) a EPC QR (SEPA standard pro Evropu). Vsechny udaje se zpracovavaji primo ve vasem prohlizeci - neshromazdujeme zadne osobni udaje.",
    },
    {
      question: "Jak vytvorit QR kod pro platbu?",
      answer:
        "Zadejte platebni udaje (IBAN, castku, variabilni symbol apod.), kliknete na Vygenerovat a ziskate QR kod. Ten naskenujete bankovni aplikaci a platba se automaticky vyplni. Muzete zvolit format SPAYD pro ceske platby, BySquare pro slovenske nebo EPC QR pro mezinarodni SEPA prevody.",
    },
    {
      question: "Je to zdarma?",
      answer:
        "Ano, QR Platby je zcela zdarma a bez registrace. Neexistuji zadne skryte poplatky ani omezeni poctu generovani.",
    },
    {
      question: "Jsou moje udaje v bezpeci?",
      answer:
        "Ano. Vsechny udaje se zpracovavaji primo ve vasem prohlizeci a nikdy neopousteji vase zarizeni. Nepouzivame cookies, neshromazdujeme osobni udaje a nemame zadnou databazi.",
    },
    {
      question: "Ktere banky podporuji QR platbu?",
      answer:
        "Format SPAYD (QR Platba) funguje se vsemi ceskymi bankami - Air Bank, Ceska sporitelna, CSOB, Fio banka, Komercni banka, Raiffeisenbank, mBank a dalsi. QR kody ve formatu BySquare funguji se vsemi slovenskymi bankami. EPC QR format je podporovan vetsinou evropskych bank.",
    },
    {
      question: "Co je QR Platba (SPAYD)?",
      answer:
        "QR Platba (SPAYD) je cesky standard pro platebni QR kody zavedeny Ceskou bankovni asociaci. Format SPD (Short Payment Descriptor) podporuji vsechny ceske banky - Air Bank, Ceska sporitelna, CSOB, Fio banka, Komercni banka, Raiffeisenbank, mBank a dalsi. QR Platby tento format plne podporuje.",
    },
    {
      question: "Jaky je rozdil mezi SPAYD, BySquare a EPC QR?",
      answer:
        "SPAYD (QR Platba) je cesky standard pro platebni QR kody - podporuje variabilni, specificky a konstantni symbol. BySquare je slovensky standard se stejnymi symboly, ale v jinem formatu. EPC QR (European Payments Council) je evropsky SEPA standard, ktery funguje napric zememi EU, ale nepodporuje ceske a slovenske symboly. Pro platby v Cesku pouzijte SPAYD, pro platby na Slovensku BySquare a pro mezinarodni SEPA platby EPC QR.",
    },
    {
      question: "Muzu si QR kod upravit?",
      answer:
        "Ano. Muzete zmenit barvu QR kodu a pozadi, vybrat styl bodu (ctverce, zaoblene, kruhy nebo elegantni), pridat text do stredu nebo vlastni logo. Vsechny upravy jsou viditelne v realnem case. Nastaveni si muzete ulozit jako sablonu pro opakovane pouziti.",
    },
    {
      question: "Co je hromadne generovani?",
      answer:
        "Funkce hromadneho generovani umoznuje vytvorit vice QR kodu najednou z CSV souboru. Vysledky si stahnete jako ZIP archiv nebo PDF dokument, pripadne je primo vytisknete.",
    },
    {
      question: "Jak muzu sdilet platbu?",
      answer:
        "Kliknete na tlacitko Sdilet link a zkopirujte odkaz. Odkaz obsahuje vsechny platebni udaje vcetne IBAN, castky, symbolu, poznamky a vzhledu QR kodu. Prijemce po otevreni odkazu uvidi stranku s QR kodem, ktery naskenuje bankovni aplikaci.",
    },
    {
      question: "Je k dispozici API?",
      answer:
        "Ano. QR Platby nabizi bezplatne REST API bez nutnosti API klice. Muzete ho integrovat do vlastni aplikace, chatbota nebo workflow. API podporuje vsechny tri formaty - BySquare, EPC QR i SPAYD. Limit je 10 pozadavku za minutu.",
    },
    {
      question: "Funguje to offline?",
      answer:
        "Castecne. Po prvnim nacteni stranky muzete generovat QR kody i bez internetoveho pripojeni. Historie plateb a nastaveni se ukladaji lokalne ve vasem prohlizeci.",
    },
  ],
};

export function getFaqData(locale: string): FaqItem[] {
  return faqData[locale] ?? faqData.sk;
}

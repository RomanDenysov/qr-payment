import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

interface Props {
  locale: string;
}

export async function HomeContent({ locale }: Props) {
  const t = await getTranslations({ locale, namespace: "HomeContent" });

  const getSteps = (locale: string): string[] => {
    const stepsMap: Record<string, string[]> = {
      sk: [
        "Zadajte IBAN, sumu a symboly",
        "Voliteľne prispôsobte farby a logo",
        "Vygenerujte QR kód",
        "Naskenujte bankovou aplikáciou",
      ],
      en: [
        "Enter IBAN, amount, and symbols",
        "Optionally customize colors and logo",
        "Generate the QR code",
        "Scan with your banking app",
      ],
      cs: [
        "Zadejte IBAN, částku a symboly",
        "Volitelně si QR kód přizpůsobte",
        "Vygenerujte QR kód",
        "Naskenujte bankovní aplikací",
      ],
    };
    return stepsMap[locale] ?? stepsMap.sk;
  };

  const getFaqItems = (locale: string) => {
    const itemsMap: Record<string, Array<{ q: string; a: string }>> = {
      sk: [
        {
          q: "Čo je QR Platby?",
          a: "QR Platby je bezplatný online nástroj na vytváranie QR kódov pre bankové platby. Všetky údaje sa spracúvajú priamo vo vašom prehliadači - nezbierame žiadne osobné údaje.",
        },
        {
          q: "Ako funguje QR platba?",
          a: "Zadáte platobné údaje (IBAN, sumu, symboly), vygenerujete QR kód a naskenujete ho bankovou aplikáciou. Platba sa automaticky vyplní.",
        },
        {
          q: "S ktorými bankami to funguje?",
          a: "QR kódy vo formáte BySquare fungujú so všetkými slovenskými bankami. Formát SPAYD funguje so všetkými českými bankami. EPC QR je podporovaný väčšinou evropských bánk.",
        },
      ],
      en: [
        {
          q: "What is QR Platby?",
          a: "QR Platby is a free online tool for creating QR codes for bank payments. All data is processed directly in your browser - we don't collect any personal data.",
        },
        {
          q: "How does payment QR work?",
          a: "Enter payment details (IBAN, amount, symbols), generate the QR code, and scan it with your banking app. The payment fills in automatically.",
        },
        {
          q: "Which banks are supported?",
          a: "BySquare QR codes work with all Slovak banks. SPAYD format works with all Czech banks. EPC QR is supported by most European banks.",
        },
      ],
      cs: [
        {
          q: "Co je QR Platby?",
          a: "QR Platby je bezplatný online nástroj na vytváření QR kódů pro bankovní platby. Všechny údaje se zpracovávají přímo ve vašem prohlížeči - neshromažďujeme žádné osobní údaje.",
        },
        {
          q: "Jak funguje QR platba?",
          a: "Zadejte platební údaje (IBAN, částku, symboly), vygenerujte QR kód a naskenujte ho bankovní aplikací. Platba se automaticky vyplní.",
        },
        {
          q: "Které banky jsou podporovány?",
          a: "QR kódy ve formátu SPAYD fungují se všemi českými bankami. BySquare formát funguje se všemi slovenskými bankami. EPC QR je podporován většinou evropských bank.",
        },
      ],
    };
    return itemsMap[locale] ?? itemsMap.sk;
  };

  const steps = getSteps(locale);
  const faqItems = getFaqItems(locale);

  return (
    <>
      <section className="mt-16 space-y-4">
        <h2 className="font-bold font-pixel text-foreground text-lg tracking-wide sm:text-xl">
          {t("section1Title")}
        </h2>
        <p className="text-muted-foreground">{t("section1Para1")}</p>
        <p className="text-muted-foreground">{t("section1Para2")}</p>
      </section>

      <section className="mt-16 space-y-4">
        <h2 className="font-bold font-pixel text-foreground text-lg tracking-wide sm:text-xl">
          {t("section2Title")}
        </h2>
        <ol className="list-inside list-decimal space-y-2 text-muted-foreground">
          {steps.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
      </section>

      <section className="mt-16 space-y-4">
        <h2 className="font-bold font-pixel text-foreground text-lg tracking-wide sm:text-xl">
          {t("section3Title")}
        </h2>
        <div className="grid gap-8 sm:grid-cols-2">
          <div>
            <h3 className="mb-3 font-semibold text-foreground text-sm">
              {t("section3Col1")}
            </h3>
            <ul className="list-inside list-disc space-y-2 text-muted-foreground text-sm">
              {t.raw("section3Banks1").map((bank: string) => (
                <li key={bank}>{bank}</li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="mb-3 font-semibold text-foreground text-sm">
              {t("section3Col2")}
            </h3>
            <ul className="list-inside list-disc space-y-2 text-muted-foreground text-sm">
              {t.raw("section3Banks2").map((bank: string) => (
                <li key={bank}>{bank}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="mt-16 space-y-4">
        <h2 className="font-bold font-pixel text-foreground text-lg tracking-wide sm:text-xl">
          {t("section4Title")}
        </h2>
        <div className="space-y-6">
          {faqItems.map((item) => (
            <div key={item.q}>
              <h3 className="mb-2 font-semibold text-foreground text-sm">
                {item.q}
              </h3>
              <p className="mb-3 text-muted-foreground text-sm">{item.a}</p>
            </div>
          ))}
        </div>
        <div className="mt-6 text-center">
          <Link
            className="inline-block font-semibold text-foreground text-sm hover:underline"
            href="/faq"
          >
            {t("section4ViewAllLink")} →
          </Link>
        </div>
      </section>
    </>
  );
}

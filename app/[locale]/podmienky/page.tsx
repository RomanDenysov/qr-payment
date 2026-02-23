import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { getAlternates } from "@/lib/seo";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Metadata" });

  return {
    title: t("termsTitle"),
    description: t("termsDescription"),
    alternates: getAlternates(locale, "/podmienky"),
  };
}

export default async function TermsPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: "Metadata" });

  return (
    <div className="flex-1 pt-5 sm:pt-8 md:pt-16">
      <article className="prose-sm mx-auto max-w-2xl space-y-6 text-muted-foreground text-sm leading-relaxed">
        <h1 className="font-bold text-foreground text-lg uppercase tracking-wider sm:text-xl">
          Podmienky používania
        </h1>
        <p className="text-muted-foreground text-xs">
          Posledná aktualizácia: 11. február 2026
        </p>

        <section className="space-y-2">
          <h2 className="font-semibold text-base text-foreground">O službe</h2>
          <p>
            QR Platby je bezplatný online nástroj na generovanie QR kódov pre
            bankové platby vo formáte BySquare a EPC. Služba je poskytovaná „tak
            ako je" (as-is), bez akýchkoľvek záruk.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-semibold text-base text-foreground">
            Zodpovednosť
          </h2>
          <p>
            Prevádzkovateľ nezodpovedá za chyby v generovaných QR kódoch ani za
            problémy s platbami. Používateľ je povinný skontrolovať správnosť
            údajov v QR kóde pred jeho použitím.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-semibold text-base text-foreground">
            Kompatibilita
          </h2>
          <p>
            QR kódy sú generované podľa štandardov BySquare a EPC, ale
            nezaručujeme kompatibilitu so všetkými bankovými aplikáciami.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-semibold text-base text-foreground">
            Zmeny služby
          </h2>
          <p>
            Vyhradzujeme si právo službu kedykoľvek upraviť, pozastaviť alebo
            ukončiť bez predchádzajúceho upozornenia.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-semibold text-base text-foreground">
            Zdrojový kód
          </h2>
          <p>
            Zdrojový kód aplikácie je verejne dostupný na{" "}
            <a
              className="text-foreground underline underline-offset-4 hover:text-primary"
              href="https://github.com/RomanDenysov/qr-payment"
              rel="noopener noreferrer"
              target="_blank"
            >
              GitHube
            </a>
            .
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-semibold text-base text-foreground">Kontakt</h2>
          <p>
            V prípade otázok kontaktujte:{" "}
            <a
              className="text-foreground underline underline-offset-4 hover:text-primary"
              href="mailto:info@qr-platby.com"
            >
              info@qr-platby.com
            </a>
          </p>
        </section>

        <div className="pt-4">
          <Link
            className="text-foreground text-xs underline underline-offset-4 hover:text-primary"
            href="/"
          >
            ← {t("backToHome")}
          </Link>
        </div>
      </article>
    </div>
  );
}

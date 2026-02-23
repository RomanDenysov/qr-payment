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
    title: t("privacyTitle"),
    description: t("privacyDescription"),
    alternates: getAlternates(locale, "/ochrana-udajov"),
  };
}

export default async function PrivacyPolicyPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: "Metadata" });

  return (
    <div className="flex-1 pt-5 sm:pt-8 md:pt-16">
      <article className="prose-sm mx-auto max-w-2xl space-y-6 text-muted-foreground text-sm leading-relaxed">
        <h1 className="font-bold font-pixel text-foreground text-lg tracking-wide sm:text-xl">
          Ochrana osobných údajov
        </h1>
        <p className="text-muted-foreground text-xs">
          Posledná aktualizácia: 11. február 2026
        </p>

        <section className="space-y-2">
          <h2 className="font-semibold text-base text-foreground">
            Prevádzkovateľ
          </h2>
          <p>
            <a
              className="text-foreground underline underline-offset-4 hover:text-primary"
              href="https://buymeacoffee.com/romandenysov"
              rel="noopener noreferrer"
              target="_blank"
            >
              Nezávislý autor
            </a>
          </p>
          <p>
            Kontakt:{" "}
            <a
              className="text-foreground underline underline-offset-4 hover:text-primary"
              href="mailto:info@qr-platby.com"
            >
              info@qr-platby.com
            </a>
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-semibold text-base text-foreground">
            Aké údaje zbierame
          </h2>
          <p>
            <strong className="text-foreground">Žiadne.</strong> Aplikácia QR
            Platby nezbiera, neukladá ani neprenáša žiadne osobné údaje na
            server. Všetky platobné údaje (IBAN, suma, symboly) sú spracované
            výlučne vo vašom prehliadači.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-semibold text-base text-foreground">
            Lokálne úložisko (localStorage)
          </h2>
          <p>
            Aplikácia používa localStorage vášho prehliadača na uloženie
            histórie platieb a nastavení. Tieto údaje nikdy neopustia váš
            prehliadač a nie sú prístupné nám ani tretím stranám.
          </p>
          <p>
            Údaje môžete kedykoľvek vymazať pomocou tlačidla „Vymazať históriu"
            v aplikácii alebo cez nastavenia prehliadača.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-semibold text-base text-foreground">Analytika</h2>
          <p>
            Používame{" "}
            <a
              className="text-foreground underline underline-offset-4 hover:text-primary"
              href="https://vercel.com/docs/analytics/privacy-policy"
              rel="noopener noreferrer"
              target="_blank"
            >
              Vercel Web Analytics
            </a>
            , ktoré zbierajú anonymné údaje o návštevnosti (počet zobrazení,
            krajina). Nepoužívajú cookies a neidentifikujú jednotlivých
            používateľov.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-semibold text-base text-foreground">
            Cookies a sledovanie
          </h2>
          <p>
            Aplikácia nepoužíva cookies. Nepoužívame žiadne reklamné, sledovacie
            ani marketingové nástroje tretích strán.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-semibold text-base text-foreground">Kontakt</h2>
          <p>
            V prípade otázok nás kontaktujte:{" "}
            <a
              className="text-foreground underline underline-offset-4 hover:text-primary"
              href="mailto:info@qr-platby.com"
            >
              info@qr-platby.com
            </a>
          </p>
        </section>

        <div className="pt-4 text-center">
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

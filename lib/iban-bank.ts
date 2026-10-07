import { composeIBAN, electronicFormatIBAN, isValidIBAN } from "ibantools";

export interface DetectedBank {
  name: string;
  code: string;
  country: "SK" | "CZ";
}

// Domestic bank codes, checked 2026-10-07 against the NBS directory
// (nbs.sk/_img/documents/_platobnesystemy/eurosips/prevodnik_ik_tps_sr.csv).
// Czech banks that are SIPS participants are left to CZ_BANKS.
const SK_BANKS: Record<string, string> = {
  "0200": "VÚB banka",
  "0720": "NBS",
  "0900": "Slovenská sporiteľňa",
  "1100": "Tatra banka",
  "1111": "UniCredit Bank",
  "3000": "SZRB",
  "3100": "Prima banka",
  "5200": "ČSOB",
  "5600": "Prima banka",
  "5900": "Prvá stavebná sporiteľňa",
  "6500": "365.bank",
  "7300": "ING Bank",
  "7500": "ČSOB",
  "7930": "Wüstenrot",
  "8050": "Commerzbank",
  "8100": "Komerční banka",
  "8120": "Privatbanka",
  "8130": "Citibank",
  "8160": "EXIMBANKA SR",
  "8170": "ČSOB stavebná sporiteľňa",
  "8180": "Štátna pokladnica",
  "8191": "Centrálny depozitár CP",
  "8320": "J&T Banka",
  "8330": "Fio banka",
  "8360": "mBank",
  "8370": "Oberbank",
  "8400": "COFIDIS",
  "8420": "BKS Bank",
  "8430": "KDB Bank",
  "8440": "BNP Paribas Personal Finance",
  "8450": "PKO BP",
  "9950": "SIA Central Europe",
  "9952": "Trust Pay",
  "9954": "K-PAY",
  "9955": "Unifiedpost Payments",
};

// Checked 2026-10-07 against the ČNB list (cnb.cz, platebni-styk,
// .galleries/ucty_kody_bank/download/kody_bank_CR.csv). The two lists must
// not share a code: domesticAccountToIban picks the country by it.
const CZ_BANKS: Record<string, string> = {
  "0100": "Komerční banka",
  "0300": "ČSOB",
  "0600": "MONETA Money Bank",
  "0710": "ČNB",
  "0800": "Česká spořitelna",
  "2010": "Fio banka",
  "2060": "Citfin",
  "2070": "TRINITY BANK",
  "2100": "ČSOB Hypoteční banka",
  "2200": "Peněžní dům",
  "2220": "Artesa",
  "2250": "Banka CREDITAS",
  "2600": "Citibank",
  "2700": "UniCredit Bank",
  "3030": "Air Bank",
  "3060": "PKO BP",
  "3500": "ING Bank",
  "4300": "Národní rozvojová banka",
  "5500": "Raiffeisenbank",
  "5800": "J&T Banka",
  "6000": "PPF banka",
  "6200": "COMMERZBANK",
  "6210": "mBank",
  "6300": "BNP Paribas",
  "6363": "Partners Banka",
  "6600": "Banking Circle",
  "6700": "VÚB Praha",
  "6800": "Sberbank CZ",
  "7910": "Deutsche Bank",
  "7950": "Raiffeisen stavební spořitelna",
  "7960": "ČSOB Stavební spořitelna",
  "7970": "MONETA Stavební Spořitelna",
  "7990": "Modrá pyramida",
  "8030": "Volksbank",
  "8040": "Oberbank",
  "8060": "Stavební spořitelna ČS",
  "8090": "Česká exportní banka",
  "8150": "HSBC",
  "8198": "FAS finance company",
  "8220": "Payment execution",
  "8250": "Bank of China",
  "8255": "Bank of Communications",
  "8265": "ICBC",
  "8500": "Multitude Bank",
  "8610": "Devizová burza",
  "8620": "Comgate",
  "8660": "PAYMONT",
};

export function detectBank(iban: string): DetectedBank | null {
  const electronic = electronicFormatIBAN(iban);
  if (!(electronic && isValidIBAN(electronic))) {
    return null;
  }

  const country = electronic.slice(0, 2);
  const code = electronic.slice(4, 8);

  if (country === "SK" && SK_BANKS[code]) {
    return { name: SK_BANKS[code], code, country: "SK" };
  }
  if (country === "CZ" && CZ_BANKS[code]) {
    return { name: CZ_BANKS[code], code, country: "CZ" };
  }
  return null;
}

const DOMESTIC_ACCOUNT_RE = /^(?:(\d{1,6})-)?(\d{2,10})\/(\d{4})$/;
const WHITESPACE_RE = /\s/g;
const PREFIX_WEIGHTS = [10, 5, 8, 4, 2, 1];
const NUMBER_WEIGHTS = [6, 3, 7, 9, 10, 5, 8, 4, 2, 1];

/** Czech and Slovak account numbers carry a weighted mod-11 checksum. */
function passesMod11(digits: string, weights: number[]): boolean {
  let sum = 0;
  for (const [index, weight] of weights.entries()) {
    sum += Number(digits[index]) * weight;
  }
  return sum % 11 === 0;
}

function countryOfBankCode(code: string): DetectedBank["country"] | null {
  if (CZ_BANKS[code]) {
    return "CZ";
  }
  if (SK_BANKS[code]) {
    return "SK";
  }
  return null;
}

/**
 * Converts a Czech or Slovak domestic account number (`19-2000145399/0800`)
 * to an IBAN. The bank code picks the country, the two lists do not overlap.
 * Returns null for anything else, an unknown bank code or a failed checksum,
 * so a typo never turns into a valid-looking IBAN.
 */
export function domesticAccountToIban(input: string): string | null {
  const match = input.replace(WHITESPACE_RE, "").match(DOMESTIC_ACCOUNT_RE);
  if (!match) {
    return null;
  }
  const [, prefix = "", number, bankCode] = match;
  const country = countryOfBankCode(bankCode);
  const paddedPrefix = prefix.padStart(6, "0");
  const paddedNumber = number.padStart(10, "0");
  if (
    !(
      country &&
      passesMod11(paddedPrefix, PREFIX_WEIGHTS) &&
      passesMod11(paddedNumber, NUMBER_WEIGHTS)
    )
  ) {
    return null;
  }
  return composeIBAN({
    countryCode: country,
    bban: `${bankCode}${paddedPrefix}${paddedNumber}`,
  });
}

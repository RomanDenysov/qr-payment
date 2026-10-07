import { composeIBAN, electronicFormatIBAN, isValidIBAN } from "ibantools";

export interface DetectedBank {
  name: string;
  code: string;
  country: "SK" | "CZ";
}

const SK_BANKS: Record<string, string> = {
  "0200": "VÚB banka",
  "0720": "NBS",
  "0900": "Slovenská sporiteľňa",
  "1100": "Tatra banka",
  "1111": "UniCredit Bank",
  "3000": "SZRB",
  "3100": "Prima banka",
  "5200": "OTP Banka",
  "5600": "Prima banka",
  "5900": "Prima banka",
  "6500": "365.bank",
  "7300": "ČSOB",
  "7500": "ČSOB",
  "7930": "Wüstenrot",
  "8120": "BKS Bank",
  "8130": "Citibank",
  "8170": "Štátna pokladnica",
  "8180": "Štátna pokladnica",
  "8191": "Pohotovosť",
  "8320": "J&T Banka",
  "8330": "Fio banka",
  "8360": "mBank",
  "8370": "Oberbank",
  "8400": "BKS Bank",
  "8420": "BKS Bank",
  "8430": "KOMERČNÁ banka",
  "9950": "Crowdberry",
  "9951": "Revolut",
  "9952": "Curve",
};

const CZ_BANKS: Record<string, string> = {
  "0100": "Komerční banka",
  "0300": "ČSOB",
  "0600": "MONETA Money Bank",
  "0710": "ČNB",
  "0800": "Česká spořitelna",
  "2010": "Fio banka",
  "2020": "MUFG Bank",
  "2030": "Československé úvěrní družstvo",
  "2060": "Citfin",
  "2070": "TRINITY BANK",
  "2100": "Hypoteční banka",
  "2200": "Peněžní dům",
  "2220": "Artesa",
  "2250": "Banka CREDITAS",
  "2260": "ANO spořitelní družstvo",
  "2275": "Podnikatelská družstevní záložna",
  "2600": "Citibank",
  "2700": "UniCredit Bank",
  "3030": "Air Bank",
  "3050": "BNP Paribas Personal Finance",
  "3060": "PKO BP",
  "3500": "ING Bank",
  "4000": "Expobank",
  "4300": "ČMZRB",
  "5500": "Raiffeisenbank",
  "5800": "J&T Banka",
  "6000": "PPF banka",
  "6100": "Equa bank",
  "6200": "COMMERZBANK",
  "6210": "mBank",
  "6300": "BNP Paribas Fortis",
  "6700": "VÚB Praha",
  "6800": "Sberbank",
  "7910": "Deutsche Bank",
  "7950": "Raiffeisen stavební spořitelna",
  "7960": "ČSOB stavební spořitelna",
  "7970": "Wüstenrot stavební spořitelna",
  "7990": "Modrá pyramida",
  "8030": "Volksbank",
  "8040": "Oberbank",
  "8060": "Stavební spořitelna ČS",
  "8090": "Česká exportní banka",
  "8150": "HSBC",
  "8190": "Sberbank CZ",
  "8198": "Sumitomo Mitsui",
  "8199": "Western Union",
  "8200": "PRIVATBANKA",
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

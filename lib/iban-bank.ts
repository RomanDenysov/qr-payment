import { electronicFormatIBAN, isValidIBAN } from "ibantools";

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
  "6500": "Poštová banka",
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
  "8360": "365.bank",
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

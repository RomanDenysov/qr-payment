import { Periodicity as BysquarePeriodicity } from "bysquare/pay";

/**
 * Standing order periodicity as the form, history and share links store it.
 * Only PAY by square can carry a standing order: SPAYD and EPC QR have no
 * fields for one.
 */
export const PERIODICITIES = [
  "daily",
  "weekly",
  "biweekly",
  "monthly",
  "bimonthly",
  "quarterly",
  "semiannually",
  "annually",
] as const;

export type Periodicity = (typeof PERIODICITIES)[number];

/**
 * The one-letter codes the bysquare spec writes into the QR. The library puts
 * whatever string it gets into the payload, so passing "Monthly" would produce
 * a code no bank understands.
 */
const BYSQUARE_CODES: Record<Periodicity, string> = {
  daily: BysquarePeriodicity.Daily,
  weekly: BysquarePeriodicity.Weekly,
  biweekly: BysquarePeriodicity.Biweekly,
  monthly: BysquarePeriodicity.Monthly,
  bimonthly: BysquarePeriodicity.Bimonthly,
  quarterly: BysquarePeriodicity.Quarterly,
  semiannually: BysquarePeriodicity.Semiannually,
  annually: BysquarePeriodicity.Annually,
};

export function isPeriodicity(value: unknown): value is Periodicity {
  return PERIODICITIES.includes(value as Periodicity);
}

export function toBysquarePeriodicity(periodicity: Periodicity): string {
  return BYSQUARE_CODES[periodicity];
}

export function fromBysquarePeriodicity(code: string): Periodicity | undefined {
  return PERIODICITIES.find((p) => BYSQUARE_CODES[p] === code);
}

/** Weekly payments take a weekday (1 = Monday ... 7 = Sunday). */
export function isWeekdayPeriodicity(periodicity: Periodicity): boolean {
  return periodicity === "weekly" || periodicity === "biweekly";
}

/** Daily payments have no payment day to pick. */
export function hasPaymentDay(periodicity: Periodicity): boolean {
  return periodicity !== "daily";
}

export function maxPaymentDay(periodicity: Periodicity): number {
  return isWeekdayPeriodicity(periodicity) ? 7 : 31;
}

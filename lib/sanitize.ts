/**
 * German-specific ligature mappings applied before NFD normalization.
 */
const GERMAN_MAP: Record<string, string> = {
  ä: "ae",
  ö: "oe",
  ü: "ue",
  Ä: "Ae",
  Ö: "Oe",
  Ü: "Ue",
  ß: "ss",
};

const GERMAN_RE = /[äöüÄÖÜß]/g;

/**
 * Sanitizes text for EPC QR payloads.
 * Converts diacritics → ASCII (č→c, š→s, ä→ae, ö→oe, ü→ue, ß→ss, etc.),
 * strips remaining non-printable characters.
 */
export function sanitizeForEpc(input: string): {
  sanitized: string;
  hadChanges: boolean;
} {
  // 1. Handle German-specific ligatures first
  let result = input.replace(GERMAN_RE, (ch) => GERMAN_MAP[ch] ?? ch);

  // 2. NFD normalize to split combining marks, then strip them
  result = result
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .normalize("NFC");

  // 3. Strip non-printable characters (keep printable ASCII + space)
  result = result.replace(/[^\x20-\x7E]/g, "");

  return {
    sanitized: result,
    hadChanges: result !== input,
  };
}

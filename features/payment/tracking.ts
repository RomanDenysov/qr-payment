/**
 * Privacy-first share-link open tracking.
 *
 * The owner holds a random 32-byte secret in localStorage; the public
 * tracking id is base64url(sha256(secret)).slice(0, 16), appended to the
 * share URL as ?t=. The id is not derivable from payment data and the
 * payment payload never touches the server — Redis only ever sees the id,
 * an open count and a last-opened timestamp (90-day TTL). Owner stats are
 * read by re-deriving the id client-side; possession of the full share
 * link already reveals the id, so this adds no exposure.
 */

export const SHARE_ID_RE = /^[A-Za-z0-9_-]{16}$/;

const SHARE_ID_LENGTH = 16;
const PLUS_RE = /\+/g;
const SLASH_RE = /\//g;
const TRAILING_EQ_RE = /=+$/;

function bytesToBase64Url(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary)
    .replace(PLUS_RE, "-")
    .replace(SLASH_RE, "_")
    .replace(TRAILING_EQ_RE, "");
}

export function generateShareSecret(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  return bytesToBase64Url(bytes);
}

export async function shareIdFromSecret(secret: string): Promise<string> {
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(secret)
  );
  return bytesToBase64Url(new Uint8Array(digest)).slice(0, SHARE_ID_LENGTH);
}

/**
 * Fire-and-forget open ping from the /p page. Failures are intentionally
 * swallowed — the shared payment page must never notice.
 */
export function pingShareOpen(id: string): void {
  const url = `/api/v1/t/${id}`;
  if (navigator.sendBeacon?.(url)) {
    return;
  }
  fetch(url, { method: "POST", keepalive: true }).catch(() => {
    // ignore — see above
  });
}

export interface ShareOpenStatsData {
  count: number;
  last: string | null;
}

export async function fetchShareOpenStats(
  secret: string
): Promise<ShareOpenStatsData | null> {
  const id = await shareIdFromSecret(secret);
  const res = await fetch(`/api/v1/t/${id}`);
  if (!res.ok) {
    return null;
  }
  return res.json();
}

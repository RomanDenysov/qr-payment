const HIT_URL = "/api/v1/stats/hit";

/**
 * Anonymous, body-less counter ping after successful QR generation.
 * Failures are intentionally swallowed: ad blockers routinely cut these
 * and the user flow must never notice.
 */
export function pingStats(count = 1): void {
  const url = count > 1 ? `${HIT_URL}?count=${count}` : HIT_URL;

  if (navigator.sendBeacon?.(url)) {
    return;
  }
  fetch(url, { method: "POST", keepalive: true }).catch(() => {
    // ignore — see above
  });
}

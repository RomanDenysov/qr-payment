// okfaktura (okfaktura.sk) is the author's invoicing app: PDF invoices with PAY by square for Slovak
// sole traders, companies and agencies. The site is Slovak only.
const OKFAKTURA_ORIGIN = "https://okfaktura.sk";

export type OkfakturaPage = "home" | "contractors" | "agencies";

const PATHS: Record<OkfakturaPage, string> = {
  home: "/",
  contractors: "/pre-firmy",
  agencies: "/pre-agentury",
};

/**
 * okfaktura URL with UTM parameters, so its analytics can tell which placement sent the visit.
 * `content` names the link inside a placement that has several (utm_content).
 */
export function okfakturaUrl(
  page: OkfakturaPage,
  campaign: string,
  content?: string
): string {
  const url = new URL(PATHS[page], OKFAKTURA_ORIGIN);
  url.searchParams.set("utm_source", "qr-platby.com");
  url.searchParams.set("utm_medium", "referral");
  url.searchParams.set("utm_campaign", campaign);
  if (content) {
    url.searchParams.set("utm_content", content);
  }
  return url.toString();
}

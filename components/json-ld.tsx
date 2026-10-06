/** Renders one schema.org object as a JSON-LD script tag. */
export function JsonLdScript({ data }: { data: object }) {
  return (
    <script
      // biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD structured data requires script injection
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
      type="application/ld+json"
    />
  );
}

/**
 * Server component that emits a JSON-LD <script> block.
 * Use inside page layouts (server components) for page-specific structured data.
 */
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

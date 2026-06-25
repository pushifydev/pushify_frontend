'use client';

import { EndpointCard, SectionHeading } from '../components';
import { buildParams, DOMAIN_CREATE_PARAM_DEFS, type SectionProps } from './shared';

export function DomainsSection({ c, apiBase }: SectionProps) {
  const ep = c.domains.endpoints;

  return (
    <div className="space-y-6">
      <SectionHeading title={c.domains.title} description={c.domains.description} />

      <div className="space-y-3">
        <EndpointCard
          method="GET"
          path="/projects/:projectId/domains"
          description={ep.list.description}
          scope="domains:read"
          labels={c.labels}
          request={`curl "${apiBase}/projects/550e8400-e29b-41d4-a716-446655440000/domains" \\
  -H "Authorization: Bearer YOUR_KEY"`}
          response={`{
  "data": [
    {
      "id": "b1b2b3b4-c5c6-4789-b012-345678901001",
      "domain": "myapp.com",
      "isPrimary": true,
      "verified": true,
      "sslStatus": "active",
      "createdAt": "2024-01-15T10:30:00Z"
    },
    {
      "id": "b1b2b3b4-c5c6-4789-b012-345678901002",
      "domain": "www.myapp.com",
      "isPrimary": false,
      "verified": true,
      "sslStatus": "active"
    }
  ]
}`}
        />

        <EndpointCard
          method="POST"
          path="/projects/:projectId/domains"
          description={ep.create.description}
          scope="domains:write"
          labels={c.labels}
          params={buildParams(DOMAIN_CREATE_PARAM_DEFS, ep.create.params)}
          request={`curl -X POST "${apiBase}/projects/550e8400-e29b-41d4-a716-446655440000/domains" \\
  -H "Authorization: Bearer YOUR_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{ "domain": "myapp.com" }'`}
          response={`{
  "data": {
    "id": "b1b2b3b4-c5c6-4789-b012-345678901003",
    "domain": "myapp.com",
    "verified": false,
    "dnsRecords": [
      { "type": "A", "name": "@", "value": "1.2.3.4" },
      { "type": "CNAME", "name": "www", "value": "myapp.pushify.dev" }
    ]
  },
  "message": "Domain added. Configure DNS records to verify."
}`}
        />

        <EndpointCard
          method="POST"
          path="/projects/:projectId/domains/:domainId/verify"
          description={ep.verify.description}
          scope="domains:write"
          labels={c.labels}
          request={`curl -X POST "${apiBase}/projects/550e8400-e29b-41d4-a716-446655440000/domains/b1b2b3b4-c5c6-4789-b012-345678901003/verify" \\
  -H "Authorization: Bearer YOUR_KEY"`}
          response={`{
  "data": { "id": "b1b2b3b4-c5c6-4789-b012-345678901003", "verified": true, "sslStatus": "provisioning" },
  "message": "Domain verified successfully"
}`}
        />

        <EndpointCard
          method="POST"
          path="/projects/:projectId/domains/:domainId/primary"
          description={ep.primary.description}
          scope="domains:write"
          labels={c.labels}
          request={`curl -X POST "${apiBase}/projects/550e8400-e29b-41d4-a716-446655440000/domains/b1b2b3b4-c5c6-4789-b012-345678901003/primary" \\
  -H "Authorization: Bearer YOUR_KEY"`}
          response={`{
  "data": { "id": "b1b2b3b4-c5c6-4789-b012-345678901003", "isPrimary": true },
  "message": "Primary domain updated"
}`}
        />

        <EndpointCard
          method="DELETE"
          path="/projects/:projectId/domains/:domainId"
          description={ep.remove.description}
          scope="domains:write"
          labels={c.labels}
          request={`curl -X DELETE "${apiBase}/projects/550e8400-e29b-41d4-a716-446655440000/domains/b1b2b3b4-c5c6-4789-b012-345678901003" \\
  -H "Authorization: Bearer YOUR_KEY"`}
          response={`{ "message": "Domain removed" }`}
        />
      </div>
    </div>
  );
}

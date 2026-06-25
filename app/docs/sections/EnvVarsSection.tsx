'use client';

import { EndpointCard, SectionHeading, Callout } from '../components';
import {
  buildParams,
  ENVVAR_LIST_PARAM_DEFS,
  ENVVAR_CREATE_PARAM_DEFS,
  ENVVAR_BULK_PARAM_DEFS,
  type SectionProps,
} from './shared';

export function EnvVarsSection({ c, apiBase }: SectionProps) {
  const ep = c.envvars.endpoints;

  return (
    <div className="space-y-6">
      <SectionHeading title={c.envvars.title} description={c.envvars.description} />

      <Callout type="info" title={c.envvars.sensitiveTitle}>
        {c.envvars.sensitiveText}
      </Callout>

      <div className="space-y-3">
        <EndpointCard
          method="GET"
          path="/projects/:projectId/env"
          description={ep.list.description}
          scope="envvars:read"
          labels={c.labels}
          params={buildParams(ENVVAR_LIST_PARAM_DEFS, ep.list.params)}
          request={`curl "${apiBase}/projects/550e8400-e29b-41d4-a716-446655440000/env" \\
  -H "Authorization: Bearer YOUR_KEY"`}
          response={`{
  "data": [
    {
      "id": "a1a2a3a4-b5b6-4789-a012-345678901001",
      "key": "DATABASE_URL",
      "value": "p****l",
      "isSecret": true,
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ]
}`}
        />

        <EndpointCard
          method="POST"
          path="/projects/:projectId/env"
          description={ep.create.description}
          scope="envvars:write"
          labels={c.labels}
          params={buildParams(ENVVAR_CREATE_PARAM_DEFS, ep.create.params)}
          request={`curl -X POST "${apiBase}/projects/550e8400-e29b-41d4-a716-446655440000/env" \\
  -H "Authorization: Bearer YOUR_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{ "key": "API_SECRET", "value": "s3cret", "isSecret": true }'`}
          response={`{
  "data": { "id": "a1a2a3a4-b5b6-4789-a012-345678901002", "key": "API_SECRET", "value": "s****t", ... },
  "message": "Environment variable created"
}`}
        />

        <EndpointCard
          method="POST"
          path="/projects/:projectId/env/bulk"
          description={ep.bulk.description}
          scope="envvars:write"
          labels={c.labels}
          params={buildParams(ENVVAR_BULK_PARAM_DEFS, ep.bulk.params)}
          request={`curl -X POST "${apiBase}/projects/550e8400-e29b-41d4-a716-446655440000/env/bulk" \\
  -H "Authorization: Bearer YOUR_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "variables": [
      { "key": "NODE_ENV", "value": "production" },
      { "key": "DB_HOST", "value": "localhost", "isSecret": true }
    ]
  }'`}
          response={`{
  "data": { "created": 1, "updated": 1 },
  "message": "Environment variables updated"
}`}
        />

        <EndpointCard
          method="PATCH"
          path="/projects/:projectId/env/:envVarId"
          description={ep.update.description}
          scope="envvars:write"
          labels={c.labels}
          request={`curl -X PATCH "${apiBase}/projects/550e8400-e29b-41d4-a716-446655440000/env/a1a2a3a4-b5b6-4789-a012-345678901001" \\
  -H "Authorization: Bearer YOUR_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{ "value": "new_value" }'`}
          response={`{
  "data": { "id": "a1a2a3a4-b5b6-4789-a012-345678901001", "key": "DATABASE_URL", ... },
  "message": "Environment variable updated"
}`}
        />

        <EndpointCard
          method="DELETE"
          path="/projects/:projectId/env/:envVarId"
          description={ep.remove.description}
          scope="envvars:write"
          labels={c.labels}
          request={`curl -X DELETE "${apiBase}/projects/550e8400-e29b-41d4-a716-446655440000/env/a1a2a3a4-b5b6-4789-a012-345678901001" \\
  -H "Authorization: Bearer YOUR_KEY"`}
          response={`{ "message": "Environment variable deleted" }`}
        />
      </div>
    </div>
  );
}

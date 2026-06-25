'use client';

import { EndpointCard, SectionHeading } from '../components';
import {
  buildParams,
  DEPLOYMENT_LIST_PARAM_DEFS,
  DEPLOYMENT_CREATE_PARAM_DEFS,
  DEPLOYMENT_LOGS_PARAM_DEFS,
  type SectionProps,
} from './shared';

export function DeploymentsSection({ c, apiBase }: SectionProps) {
  const ep = c.deployments.endpoints;

  return (
    <div className="space-y-6">
      <SectionHeading title={c.deployments.title} description={c.deployments.description} />

      <div className="space-y-3">
        <EndpointCard
          method="GET"
          path="/projects/:projectId/deployments"
          description={ep.list.description}
          scope="deployments:read"
          labels={c.labels}
          params={buildParams(DEPLOYMENT_LIST_PARAM_DEFS, ep.list.params)}
          request={`curl "${apiBase}/projects/550e8400-e29b-41d4-a716-446655440000/deployments?limit=10" \\
  -H "Authorization: Bearer YOUR_KEY"`}
          response={`{
  "data": [
    {
      "id": "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
      "status": "running",
      "trigger": "manual",
      "commitHash": "abc123",
      "commitMessage": "Update homepage",
      "branch": "main",
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ]
}`}
        />

        <EndpointCard
          method="POST"
          path="/projects/:projectId/deployments"
          description={ep.create.description}
          scope="deployments:write"
          labels={c.labels}
          params={buildParams(DEPLOYMENT_CREATE_PARAM_DEFS, ep.create.params)}
          request={`curl -X POST "${apiBase}/projects/550e8400-e29b-41d4-a716-446655440000/deployments" \\
  -H "Authorization: Bearer YOUR_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{ "branch": "main" }'`}
          response={`{
  "data": { "id": "6ba7b811-9dad-11d1-80b4-00c04fd430c8", "status": "pending", "trigger": "manual", ... },
  "message": "Deployment created successfully"
}`}
        />

        <EndpointCard
          method="POST"
          path="/projects/:projectId/deployments/:deploymentId/cancel"
          description={ep.cancel.description}
          scope="deployments:cancel"
          labels={c.labels}
          request={`curl -X POST "${apiBase}/projects/550e8400-e29b-41d4-a716-446655440000/deployments/6ba7b810-9dad-11d1-80b4-00c04fd430c8/cancel" \\
  -H "Authorization: Bearer YOUR_KEY"`}
          response={`{
  "data": { "id": "6ba7b810-9dad-11d1-80b4-00c04fd430c8", "status": "cancelled", ... },
  "message": "Deployment cancelled"
}`}
        />

        <EndpointCard
          method="POST"
          path="/projects/:projectId/deployments/:deploymentId/redeploy"
          description={ep.redeploy.description}
          scope="deployments:write"
          labels={c.labels}
          request={`curl -X POST "${apiBase}/projects/550e8400-e29b-41d4-a716-446655440000/deployments/6ba7b810-9dad-11d1-80b4-00c04fd430c8/redeploy" \\
  -H "Authorization: Bearer YOUR_KEY"`}
          response={`{
  "data": { "id": "6ba7b812-9dad-11d1-80b4-00c04fd430c8", "status": "pending", "trigger": "redeploy", ... },
  "message": "Redeploy started"
}`}
        />

        <EndpointCard
          method="POST"
          path="/projects/:projectId/deployments/:deploymentId/rollback"
          description={ep.rollback.description}
          scope="deployments:write"
          labels={c.labels}
          request={`curl -X POST "${apiBase}/projects/550e8400-e29b-41d4-a716-446655440000/deployments/6ba7b810-9dad-11d1-80b4-00c04fd430c8/rollback" \\
  -H "Authorization: Bearer YOUR_KEY"`}
          response={`{
  "data": { "id": "6ba7b813-9dad-11d1-80b4-00c04fd430c8", "status": "pending", "trigger": "rollback", ... },
  "message": "Rollback started"
}`}
        />

        <EndpointCard
          method="GET"
          path="/projects/:projectId/deployments/:deploymentId/logs"
          description={ep.logs.description}
          scope="deployments:read"
          labels={c.labels}
          params={buildParams(DEPLOYMENT_LOGS_PARAM_DEFS, ep.logs.params)}
          request={`curl "${apiBase}/projects/550e8400-e29b-41d4-a716-446655440000/deployments/6ba7b810-9dad-11d1-80b4-00c04fd430c8/logs?type=build" \\
  -H "Authorization: Bearer YOUR_KEY"`}
          response={`{
  "data": {
    "logs": "Step 1/5: Cloning repository...\\nStep 2/5: Installing dependencies...",
    "status": "running"
  }
}`}
        />
      </div>
    </div>
  );
}

'use client';

import { EndpointCard, SectionHeading } from '../components';
import { buildParams, PROJECT_CREATE_PARAM_DEFS, type SectionProps } from './shared';

export function ProjectsSection({ c, apiBase }: SectionProps) {
  const ep = c.projects.endpoints;

  return (
    <div className="space-y-6">
      <SectionHeading title={c.projects.title} description={c.projects.description} />

      <div className="space-y-3">
        <EndpointCard
          method="GET"
          path="/projects"
          description={ep.list.description}
          scope="projects:read"
          labels={c.labels}
          request={`curl "${apiBase}/projects" \\
  -H "Authorization: Bearer YOUR_KEY"`}
          response={`{
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "My App",
      "slug": "my-app",
      "status": "active",
      "gitRepoUrl": "https://github.com/user/my-app",
      "gitBranch": "main",
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ]
}`}
        />

        <EndpointCard
          method="GET"
          path="/projects/:projectId"
          description={ep.get.description}
          scope="projects:read"
          labels={c.labels}
          request={`curl "${apiBase}/projects/550e8400-e29b-41d4-a716-446655440000" \\
  -H "Authorization: Bearer YOUR_KEY"`}
          response={`{
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "My App",
    "slug": "my-app",
    "status": "active",
    "gitRepoUrl": "https://github.com/user/my-app",
    "gitBranch": "main",
    "buildCommand": "npm run build",
    "startCommand": "npm start",
    "port": 3000,
    "autoDeploy": true,
    "domains": [
      { "id": "b1b2b3b4-c5c6-4789-b012-345678901001", "domain": "my-app.pushify.dev", "isPrimary": true }
    ]
  }
}`}
        />

        <EndpointCard
          method="POST"
          path="/projects"
          description={ep.create.description}
          scope="projects:write"
          labels={c.labels}
          params={buildParams(PROJECT_CREATE_PARAM_DEFS, ep.create.params)}
          request={`curl -X POST "${apiBase}/projects" \\
  -H "Authorization: Bearer YOUR_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "name": "My New App",
    "gitRepoUrl": "https://github.com/user/app",
    "gitBranch": "main",
    "buildCommand": "npm run build",
    "startCommand": "npm start",
    "port": 3000
  }'`}
          response={`{
  "data": { "id": "550e8400-e29b-41d4-a716-446655440001", "name": "My New App", ... },
  "message": "Project created successfully"
}`}
        />

        <EndpointCard
          method="PATCH"
          path="/projects/:projectId"
          description={ep.update.description}
          scope="projects:write"
          labels={c.labels}
          request={`curl -X PATCH "${apiBase}/projects/550e8400-e29b-41d4-a716-446655440000" \\
  -H "Authorization: Bearer YOUR_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{ "buildCommand": "npm run build:prod" }'`}
          response={`{
  "data": { "id": "550e8400-e29b-41d4-a716-446655440000", "buildCommand": "npm run build:prod", ... },
  "message": "Project updated successfully"
}`}
        />

        <EndpointCard
          method="DELETE"
          path="/projects/:projectId"
          description={ep.remove.description}
          scope="projects:write"
          labels={c.labels}
          request={`curl -X DELETE "${apiBase}/projects/550e8400-e29b-41d4-a716-446655440000" \\
  -H "Authorization: Bearer YOUR_KEY"`}
          response={`{ "message": "Project deleted successfully" }`}
        />

        <EndpointCard
          method="GET"
          path="/projects/:projectId/webhook"
          description={ep.webhook.description}
          scope="projects:read"
          labels={c.labels}
          request={`curl "${apiBase}/projects/550e8400-e29b-41d4-a716-446655440000/webhook" \\
  -H "Authorization: Bearer YOUR_KEY"`}
          response={`{
  "data": {
    "webhookUrl": "https://api.pushify.dev/api/v1/webhooks/github/550e8400-e29b-41d4-a716-446655440000",
    "hasSecret": true
  }
}`}
        />
      </div>
    </div>
  );
}

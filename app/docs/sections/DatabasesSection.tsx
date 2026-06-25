'use client';

import { EndpointCard, SectionHeading } from '../components';
import {
  buildParams,
  DATABASE_CREATE_PARAM_DEFS,
  DATABASE_CONNECT_PARAM_DEFS,
  type SectionProps,
} from './shared';

export function DatabasesSection({ c, apiBase }: SectionProps) {
  const ep = c.databases.endpoints;

  return (
    <div className="space-y-6">
      <SectionHeading title={c.databases.title} description={c.databases.description} />

      <div className="space-y-3">
        <EndpointCard
          method="GET"
          path="/databases"
          description={ep.list.description}
          scope="databases:read"
          labels={c.labels}
          request={`curl "${apiBase}/databases" \\
  -H "Authorization: Bearer YOUR_KEY"`}
          response={`{
  "data": [
    {
      "id": "d1d2d3d4-e5e6-4789-d012-345678901001",
      "name": "main-postgres",
      "type": "postgresql",
      "version": "16",
      "status": "running",
      "host": "1.2.3.4",
      "port": 5432,
      "databaseName": "app_db",
      "server": { "id": "c1c2c3c4-d5d6-4789-c012-345678901001", "name": "production-1" }
    }
  ]
}`}
        />

        <EndpointCard
          method="POST"
          path="/databases"
          description={ep.create.description}
          scope="databases:write"
          labels={c.labels}
          params={buildParams(DATABASE_CREATE_PARAM_DEFS, ep.create.params)}
          request={`curl -X POST "${apiBase}/databases" \\
  -H "Authorization: Bearer YOUR_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "name": "my-database",
    "type": "postgresql",
    "serverId": "c1c2c3c4-d5d6-4789-c012-345678901001"
  }'`}
          response={`{
  "data": { "id": "d1d2d3d4-e5e6-4789-d012-345678901002", "name": "my-database", "status": "provisioning", ... },
  "message": "Database is being created"
}`}
        />

        <EndpointCard
          method="GET"
          path="/databases/:id/credentials"
          description={ep.credentials.description}
          scope="databases:read"
          labels={c.labels}
          request={`curl "${apiBase}/databases/d1d2d3d4-e5e6-4789-d012-345678901001/credentials" \\
  -H "Authorization: Bearer YOUR_KEY"`}
          response={`{
  "data": {
    "host": "1.2.3.4",
    "port": 5432,
    "username": "app_user",
    "password": "generated_password",
    "databaseName": "app_db",
    "connectionString": "postgresql://app_user:generated_password@1.2.3.4:5432/app_db"
  }
}`}
        />

        <EndpointCard
          method="POST"
          path="/databases/:id/connect"
          description={ep.connect.description}
          scope="databases:write"
          labels={c.labels}
          params={buildParams(DATABASE_CONNECT_PARAM_DEFS, ep.connect.params)}
          request={`curl -X POST "${apiBase}/databases/d1d2d3d4-e5e6-4789-d012-345678901001/connect" \\
  -H "Authorization: Bearer YOUR_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{ "projectId": "550e8400-e29b-41d4-a716-446655440000", "envPrefix": "DATABASE" }'`}
          response={`{
  "data": { "connectionId": "conn_001" },
  "message": "Database connected to project"
}`}
        />

        <EndpointCard
          method="POST"
          path="/databases/:id/start"
          description={ep.start.description}
          scope="databases:write"
          labels={c.labels}
          request={`curl -X POST "${apiBase}/databases/d1d2d3d4-e5e6-4789-d012-345678901001/start" \\
  -H "Authorization: Bearer YOUR_KEY"`}
          response={`{ "message": "Database is starting" }`}
        />

        <EndpointCard
          method="POST"
          path="/databases/:id/stop"
          description={ep.stop.description}
          scope="databases:write"
          labels={c.labels}
          request={`curl -X POST "${apiBase}/databases/d1d2d3d4-e5e6-4789-d012-345678901001/stop" \\
  -H "Authorization: Bearer YOUR_KEY"`}
          response={`{ "message": "Database is stopping" }`}
        />

        <EndpointCard
          method="POST"
          path="/databases/:id/backups"
          description={ep.backup.description}
          scope="databases:write"
          labels={c.labels}
          request={`curl -X POST "${apiBase}/databases/d1d2d3d4-e5e6-4789-d012-345678901001/backups" \\
  -H "Authorization: Bearer YOUR_KEY"`}
          response={`{
  "data": { "id": "e1e2e3e4-f5f6-4789-e012-345678901001", "status": "creating", "type": "manual", ... },
  "message": "Backup started"
}`}
        />

        <EndpointCard
          method="POST"
          path="/databases/:id/backups/:backupId/restore"
          description={ep.restore.description}
          scope="databases:write"
          labels={c.labels}
          request={`curl -X POST "${apiBase}/databases/d1d2d3d4-e5e6-4789-d012-345678901001/backups/e1e2e3e4-f5f6-4789-e012-345678901001/restore" \\
  -H "Authorization: Bearer YOUR_KEY"`}
          response={`{
  "data": { "id": "e1e2e3e4-f5f6-4789-e012-345678901001", "status": "restoring", ... },
  "message": "Restore started"
}`}
        />

        <EndpointCard
          method="DELETE"
          path="/databases/:id"
          description={ep.remove.description}
          scope="databases:write"
          labels={c.labels}
          request={`curl -X DELETE "${apiBase}/databases/d1d2d3d4-e5e6-4789-d012-345678901001" \\
  -H "Authorization: Bearer YOUR_KEY"`}
          response={`{ "message": "Database deleted" }`}
        />
      </div>
    </div>
  );
}

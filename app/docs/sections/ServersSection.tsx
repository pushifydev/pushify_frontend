'use client';

import { EndpointCard, SectionHeading, Callout } from '../components';
import { buildParams, SERVER_CREATE_PARAM_DEFS, type SectionProps } from './shared';

export function ServersSection({ c, apiBase }: SectionProps) {
  const ep = c.servers.endpoints;

  return (
    <div className="space-y-6">
      <SectionHeading title={c.servers.title} description={c.servers.description} />

      <Callout type="info" title={c.servers.sessionOnlyTitle}>
        {c.servers.sessionOnlyText}
      </Callout>

      <div className="space-y-3">
        <EndpointCard
          method="GET"
          path="/servers"
          description={ep.list.description}
          scope="servers:read"
          labels={c.labels}
          request={`curl "${apiBase}/servers" \\
  -H "Authorization: Bearer YOUR_KEY"`}
          response={`{
  "data": [
    {
      "id": "c1c2c3c4-d5d6-4789-c012-345678901001",
      "name": "production-1",
      "provider": "hetzner",
      "region": "eu-central",
      "ipv4": "1.2.3.4",
      "status": "running",
      "setupStatus": "completed",
      "specs": { "vcpu": 2, "memory": 4096, "disk": 40 },
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ]
}`}
        />

        <EndpointCard
          method="POST"
          path="/servers"
          description={ep.create.description}
          scope="servers:write"
          labels={c.labels}
          params={buildParams(SERVER_CREATE_PARAM_DEFS, ep.create.params)}
          request={`curl -X POST "${apiBase}/servers" \\
  -H "Authorization: Bearer YOUR_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "name": "production-2",
    "provider": "hetzner",
    "region": "eu-central",
    "size": "cx21"
  }'`}
          response={`{
  "data": { "id": "c1c2c3c4-d5d6-4789-c012-345678901002", "name": "production-2", "status": "provisioning", ... },
  "message": "Server is being provisioned"
}`}
        />

        <EndpointCard
          method="GET"
          path="/servers/:serverId"
          description={ep.get.description}
          scope="servers:read"
          labels={c.labels}
          request={`curl "${apiBase}/servers/c1c2c3c4-d5d6-4789-c012-345678901001" \\
  -H "Authorization: Bearer YOUR_KEY"`}
          response={`{
  "data": {
    "id": "c1c2c3c4-d5d6-4789-c012-345678901001",
    "name": "production-1",
    "provider": "hetzner",
    "region": "eu-central",
    "ipv4": "1.2.3.4",
    "status": "running",
    "setupStatus": "completed",
    "specs": { "vcpu": 2, "memory": 4096, "disk": 40 }
  }
}`}
        />

        <EndpointCard
          method="POST"
          path="/servers/:serverId/start"
          description={ep.start.description}
          scope="servers:write"
          labels={c.labels}
          request={`curl -X POST "${apiBase}/servers/c1c2c3c4-d5d6-4789-c012-345678901001/start" \\
  -H "Authorization: Bearer YOUR_KEY"`}
          response={`{ "message": "Server is starting" }`}
        />

        <EndpointCard
          method="POST"
          path="/servers/:serverId/stop"
          description={ep.stop.description}
          scope="servers:write"
          labels={c.labels}
          request={`curl -X POST "${apiBase}/servers/c1c2c3c4-d5d6-4789-c012-345678901001/stop" \\
  -H "Authorization: Bearer YOUR_KEY"`}
          response={`{ "message": "Server is stopping" }`}
        />

        <EndpointCard
          method="POST"
          path="/servers/:serverId/reboot"
          description={ep.reboot.description}
          scope="servers:write"
          labels={c.labels}
          request={`curl -X POST "${apiBase}/servers/c1c2c3c4-d5d6-4789-c012-345678901001/reboot" \\
  -H "Authorization: Bearer YOUR_KEY"`}
          response={`{ "message": "Server is rebooting" }`}
        />

        <EndpointCard
          method="DELETE"
          path="/servers/:serverId"
          description={ep.remove.description}
          scope="servers:write"
          labels={c.labels}
          request={`curl -X DELETE "${apiBase}/servers/c1c2c3c4-d5d6-4789-c012-345678901001" \\
  -H "Authorization: Bearer YOUR_KEY"`}
          response={`{ "message": "Server deleted" }`}
        />
      </div>
    </div>
  );
}

'use client';

import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useWebSocketEvent } from '@/providers/WebSocketProvider';
import { deploymentKeys } from './useDeployments';
import { metricsKeys } from './useMetrics';
import { serverKeys } from './useServers';
import { healthCheckKeys } from './useHealthCheck';
import { databaseKeys } from './useDatabases';

// ============ Deployment Events ============

interface DeploymentStatusData {
  projectId: string;
  deploymentId: string;
  status: string;
  message?: string;
}

/**
 * Subscribes to deployment status events for a project.
 * Invalidates React Query caches and shows toasts for terminal states.
 */
export function useDeploymentStatusEvents(projectId: string | undefined) {
  const queryClient = useQueryClient();

  useWebSocketEvent<DeploymentStatusData>(
    'deployment:status',
    (data) => {
      if (!projectId || data.projectId !== projectId) return;

      // Invalidate deployment queries
      queryClient.invalidateQueries({ queryKey: deploymentKeys.list(projectId) });
      queryClient.invalidateQueries({
        queryKey: deploymentKeys.detail(projectId, data.deploymentId),
      });

      // Show toast for terminal states
      if (data.status === 'running') {
        toast.success('Deployment successful', {
          description: `Deployment is now running`,
        });
      } else if (data.status === 'failed') {
        toast.error('Deployment failed', {
          description: data.message || 'Check logs for details',
        });
      }
    },
    { channel: projectId ? `project:${projectId}` : undefined }
  );
}

// ============ Metrics Events ============

interface MetricsUpdateData {
  projectId: string;
  cpuPercent: number;
  memoryPercent: number;
  memoryUsageBytes: number;
  memoryLimitBytes: number;
  networkRxBytes: number;
  networkTxBytes: number;
}

/**
 * Subscribes to metrics update events for a project.
 * Invalidates metrics cache so charts update in near real-time.
 */
export function useMetricsPushEvents(projectId: string | undefined) {
  const queryClient = useQueryClient();

  useWebSocketEvent<MetricsUpdateData>(
    'metrics:update',
    (data) => {
      if (!projectId || data.projectId !== projectId) return;

      // Invalidate metrics queries to trigger refetch
      queryClient.invalidateQueries({ queryKey: metricsKeys.summary(projectId) });
      queryClient.invalidateQueries({ queryKey: metricsKeys.overview() });
    },
    { channel: projectId ? `project:${projectId}` : undefined }
  );
}

// ============ Server Events ============

interface ServerStatusData {
  serverId: string;
  status: string;
  ipv4?: string;
  setupStatus?: string;
  statusMessage?: string;
}

/**
 * Subscribes to server status/setup events.
 * Invalidates server queries and shows toasts on completion/failure.
 */
export function useServerStatusEvents(serverId: string | undefined) {
  const queryClient = useQueryClient();

  useWebSocketEvent<ServerStatusData>(
    'server:status',
    (data) => {
      if (!serverId || data.serverId !== serverId) return;

      queryClient.invalidateQueries({ queryKey: serverKeys.detail(serverId) });
      queryClient.invalidateQueries({ queryKey: serverKeys.list() });

      if (data.status === 'running') {
        toast.success('Server is running', {
          description: data.ipv4 ? `IP: ${data.ipv4}` : undefined,
        });
      }
    },
    { channel: serverId ? `server:${serverId}` : undefined }
  );

  useWebSocketEvent<ServerStatusData>(
    'server:setup',
    (data) => {
      if (!serverId || data.serverId !== serverId) return;

      queryClient.invalidateQueries({ queryKey: serverKeys.detail(serverId) });
      queryClient.invalidateQueries({ queryKey: serverKeys.list() });

      if (data.setupStatus === 'completed') {
        toast.success('Server setup completed', {
          description: 'Docker and Nginx are ready',
        });
      } else if (data.setupStatus === 'failed') {
        toast.error('Server setup failed', {
          description: data.statusMessage || 'Check server logs',
        });
      }
    },
    { channel: serverId ? `server:${serverId}` : undefined }
  );
}

// ============ Health Check Events ============

interface HealthCheckData {
  projectId: string;
  healthy: boolean;
  responseTimeMs?: number;
  consecutiveFailures: number;
}

/**
 * Subscribes to health check result events for a project.
 * Invalidates health check logs cache.
 */
export function useHealthCheckEvents(projectId: string | undefined) {
  const queryClient = useQueryClient();

  useWebSocketEvent<HealthCheckData>(
    'healthcheck:result',
    (data) => {
      if (!projectId || data.projectId !== projectId) return;

      queryClient.invalidateQueries({ queryKey: healthCheckKeys.logs(projectId) });
    },
    { channel: projectId ? `project:${projectId}` : undefined }
  );
}

// ============ Backup Events ============

interface BackupStatusData {
  databaseId: string;
  backupId: string;
  status: 'creating' | 'completed' | 'failed' | 'restoring' | 'restored';
  sizeMb?: number;
  errorMessage?: string;
}

/**
 * Subscribes to backup status events for a database.
 * Invalidates backup queries and shows toasts on completion/failure.
 */
export function useBackupStatusEvents(databaseId: string | undefined) {
  const queryClient = useQueryClient();

  useWebSocketEvent<BackupStatusData>(
    'backup:status',
    (data) => {
      if (!databaseId || data.databaseId !== databaseId) return;

      // Invalidate backup queries
      queryClient.invalidateQueries({ queryKey: databaseKeys.backups(databaseId) });
      queryClient.invalidateQueries({ queryKey: databaseKeys.detail(databaseId) });

      // Show toast for terminal states
      if (data.status === 'completed') {
        toast.success('Backup completed', {
          description: data.sizeMb ? `Size: ${data.sizeMb} MB` : undefined,
        });
      } else if (data.status === 'failed') {
        toast.error('Backup failed', {
          description: data.errorMessage || 'Check logs for details',
        });
      } else if (data.status === 'restored') {
        toast.success('Database restored', {
          description: 'Database has been restored from backup',
        });
      }
    },
    { channel: databaseId ? `database:${databaseId}` : undefined }
  );
}

/** How the next connection of a container log stream should start. */
export interface LogStreamConnectPlan {
  /** Only ask the server for lines newer than this ISO timestamp; omitted = the normal tail. */
  since?: string;
  /** true: keep the lines already on screen and add to them; false: clear them first. */
  append: boolean;
}

export interface ContainerLogsReconnectState {
  /** When the last 'log' line arrived on the current stream (null = none yet). */
  lastEventAt: string | null;
  /** When the current stream (since the last fresh connect) was first established. */
  streamStartedAt: string | null;
}

/**
 * Container logs: after an unexpected disconnect, resume right after the last line we
 * received so nothing already on screen is fetched (and shown) again. With no line yet,
 * resume from when the stream opened; if it never opened, start over with the normal tail.
 */
export function containerLogsReconnectPlan(
  state: ContainerLogsReconnectState
): LogStreamConnectPlan {
  const since = state.lastEventAt ?? state.streamStartedAt;
  return since ? { since, append: true } : { append: false };
}

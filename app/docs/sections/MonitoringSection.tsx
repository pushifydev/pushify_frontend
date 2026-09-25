'use client';

import { Callout, DocsHeading, SectionHeading } from '../components';
import type { SectionProps } from './shared';

/**
 * What Pushify watches and when it will email you. Written because every one of these has a
 * threshold that decides whether a message arrives at 3am, and a setting nobody can guess from
 * the dashboard alone — how long logs are kept, how much data a backup interval risks.
 */
export function MonitoringSection({ c }: SectionProps) {
  const s = c.monitoring;

  return (
    <div className="space-y-8">
      <SectionHeading id="monitoring" title={s.title} description={s.description} />

      <div className="space-y-3">
        <DocsHeading id="monitoring-alerts">{s.alertsTitle}</DocsHeading>
        <p className="docs-p">{s.alertsText}</p>
        <dl className="docs-dl">
          {s.alerts.map((alert) => (
            <div key={alert.when}>
              <dt>{alert.when}</dt>
              <dd>{alert.detail}</dd>
            </div>
          ))}
        </dl>
        <Callout type="info" title={s.quietTitle}>
          {s.quietText}
        </Callout>
      </div>

      <div className="space-y-3">
        <DocsHeading id="monitoring-recipients">{s.recipientsTitle}</DocsHeading>
        <p className="docs-p">{s.recipientsText}</p>
      </div>

      <div className="space-y-3">
        <DocsHeading id="monitoring-logs">{s.logsTitle}</DocsHeading>
        <p className="docs-p">{s.logsText}</p>
        <div className="docs-table-wrap max-w-md">
          <table>
            <thead>
              <tr>
                <th scope="col">{c.labels.plan}</th>
                <th scope="col">{s.retentionLabel}</th>
              </tr>
            </thead>
            <tbody>
              {s.logRetention.map((row) => (
                <tr key={row.plan}>
                  <td style={{ color: 'var(--hp-ink)' }}>{row.plan}</td>
                  <td className="docs-td-type">{row.kept}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="space-y-3">
        <DocsHeading id="monitoring-autoscaling">{s.scalingTitle}</DocsHeading>
        <p className="docs-p">{s.scalingText}</p>
        <ul className="docs-ul">
          {s.scalingNotes.map((note, i) => (
            <li key={i}>{note}</li>
          ))}
        </ul>
      </div>

      <div className="space-y-3">
        <DocsHeading id="monitoring-backups">{s.backupsTitle}</DocsHeading>
        <p className="docs-p">{s.backupsText}</p>
        <ul className="docs-ul">
          {s.backupNotes.map((note, i) => (
            <li key={i}>{note}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

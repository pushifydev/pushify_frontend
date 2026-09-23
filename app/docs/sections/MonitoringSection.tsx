'use client';

import { Callout, SectionHeading } from '../components';
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
      <SectionHeading title={s.title} description={s.description} />

      <div className="space-y-3">
        <h3 className="docs-h3">{s.alertsTitle}</h3>
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
        <h3 className="docs-h3">{s.recipientsTitle}</h3>
        <p className="docs-p">{s.recipientsText}</p>
      </div>

      <div className="space-y-3">
        <h3 className="docs-h3">{s.logsTitle}</h3>
        <p className="docs-p">{s.logsText}</p>
        <dl className="docs-dl">
          {s.logRetention.map((row) => (
            <div key={row.plan}>
              <dt>{row.plan}</dt>
              <dd>{row.kept}</dd>
            </div>
          ))}
        </dl>
      </div>

      <div className="space-y-3">
        <h3 className="docs-h3">{s.scalingTitle}</h3>
        <p className="docs-p">{s.scalingText}</p>
        <ul className="docs-ol" style={{ listStyle: 'disc' }}>
          {s.scalingNotes.map((note, i) => (
            <li key={i}>{note}</li>
          ))}
        </ul>
      </div>

      <div className="space-y-3">
        <h3 className="docs-h3">{s.backupsTitle}</h3>
        <p className="docs-p">{s.backupsText}</p>
        <ul className="docs-ol" style={{ listStyle: 'disc' }}>
          {s.backupNotes.map((note, i) => (
            <li key={i}>{note}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

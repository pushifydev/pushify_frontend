'use client';

import { useTranslation } from '@/hooks';
import { Eyebrow } from './Eyebrow';

/**
 * Fifteen things Pushify does, one per card — a deploy, a preview, a rollback, autoscaling, an
 * off-site backup, a recovery. Each line is a step the platform really takes, checked against
 * the backend (rollback reuses the old image, previews live at pr-N-<app>, the autoscaler adds a
 * replica above 70% CPU over three readings, an app is "down" after three failed checks…).
 * Names like "shop" and a1b2c3d are examples; there are no timings or counts that could read as
 * a benchmark.
 */
type Kind = 'cmd' | 'step' | 'ok' | 'bad';
type Line = { kind: Kind; text: string };
type Tone = 'live' | 'event';
type CardData = { status: string; tone: Tone; topic: string; lines: Line[] };

const L = (kind: Kind, text: string): Line => ({ kind, text });

const CARDS: CardData[] = [
  { status: 'Live', tone: 'live', topic: 'Deploy · Next.js', lines: [
    L('cmd', '$ git push origin main'), L('step', '→ detected next.js'), L('step', '→ image built'),
    L('step', '→ new container beside the old one'), L('ok', '✓ health check passed'), L('ok', '✓ traffic switched') ] },
  { status: 'Preview', tone: 'live', topic: 'Pull request', lines: [
    L('step', '→ pull request #42 opened'), L('step', '→ preview built from the branch'),
    L('ok', '✓ pr-42-shop.pushify.dev'), L('step', '→ updates on every push'), L('step', '→ removed when the PR closes') ] },
  { status: 'Rolled back', tone: 'event', topic: 'Rollback', lines: [
    L('cmd', '$ rollback to a1b2c3d'), L('step', '→ reusing its image'), L('step', '→ no rebuild'),
    L('ok', '✓ health check passed'), L('ok', '✓ traffic switched back') ] },
  { status: 'Scaled up', tone: 'event', topic: 'Autoscale', lines: [
    L('step', '→ cpu above 70% over 3 readings'), L('step', '→ replicas 2 → 3'),
    L('step', '→ new container from the deploy spec'), L('ok', '✓ added to nginx'), L('step', '→ steps back down below 30%') ] },
  { status: 'Backed up', tone: 'event', topic: 'PostgreSQL', lines: [
    L('step', '→ pg_dump shop_db'), L('step', '→ streamed off the server'), L('ok', '✓ stored on your remote'),
    L('step', '→ restorable onto any server'), L('step', '→ old copies pruned after 30d') ] },
  { status: 'Secured', tone: 'live', topic: 'Domain', lines: [
    L('step', '→ shop.example.com added'), L('step', '→ dns points to the server'), L('ok', '✓ certificate issued'),
    L('ok', '✓ served over https'), L('step', '→ renewed automatically') ] },
  { status: 'Promoted', tone: 'event', topic: 'Staging', lines: [
    L('cmd', '$ git push origin staging'), L('step', '→ staging copy updated'), L('cmd', '$ promote to production'),
    L('step', '→ a1b2c3d rebuilt with prod vars'), L('ok', '✓ traffic switched') ] },
  { status: 'Recovered', tone: 'live', topic: 'Health', lines: [
    L('bad', '✕ GET / → 502'), L('bad', '✕ 3 checks failed · down'), L('step', '→ email to the team'),
    L('ok', '✓ answering again'), L('step', '→ recovery email, with the outage') ] },
  { status: 'Ran', tone: 'event', topic: 'Cron', lines: [
    L('step', '→ schedule 0 3 * * *'), L('cmd', '$ npm run cleanup'), L('step', '→ runs inside the app container'),
    L('ok', '✓ exit 0'), L('step', '→ next run tomorrow 03:00') ] },
  { status: 'Woke up', tone: 'live', topic: 'Sleep', lines: [
    L('step', '→ no traffic · app asleep'), L('step', '→ a request arrives'), L('step', '→ "waking up" page served'),
    L('step', '→ container started'), L('ok', '✓ request answered') ] },
  { status: 'Live', tone: 'live', topic: 'Docker Compose', lines: [
    L('cmd', '$ git push origin main'), L('step', '→ using compose.yaml'), L('step', '→ web · worker · redis'),
    L('step', '→ only web gets a public port'), L('ok', '✓ stack healthy') ] },
  { status: 'Restarted', tone: 'event', topic: 'Workers', lines: [
    L('step', '→ web switched to a1b2c3d'), L('step', '→ workers restarted from it'),
    L('ok', '✓ web and workers on one image'), L('step', '→ never running mixed versions') ] },
  { status: 'Balanced', tone: 'live', topic: 'Replicas', lines: [
    L('step', '→ replicas: 3'), L('step', '→ one container per port'), L('step', '→ nginx least_conn'),
    L('ok', '✓ 3 of 3 answering'), L('step', '→ a failing one is skipped') ] },
  { status: 'Alert', tone: 'event', topic: 'Memory', lines: [
    L('bad', '✕ memory over 90% of the limit'), L('bad', '✕ for 5 minutes'), L('step', '→ email to the team'),
    L('ok', '✓ back under the line'), L('step', '→ one more email: recovered') ] },
  { status: 'Live', tone: 'live', topic: 'Private image', lines: [
    L('step', '→ ghcr.io/you/api:1.4'), L('step', '→ registry login for this deploy'), L('ok', '✓ pulled'),
    L('step', '→ login removed afterwards'), L('ok', '✓ traffic switched') ] },
];

// Three rows, no card repeated across rows; each row loops its own five.
const ROWS = [CARDS.slice(0, 5), CARDS.slice(5, 10), CARDS.slice(10, 15)];

function Card({ status, tone, topic, lines }: CardData) {
  return (
    <div className="hp-card">
      <div className="hp-card-head">
        <span className={tone === 'live' ? 'hp-live' : undefined}>
          <span className="hp-dot" data-tone={tone} aria-hidden="true" />
          {status}
        </span>
        <span>{topic}</span>
      </div>
      <div className="hp-card-body">
        {lines.map((l) => (
          <div key={l.text} className={l.kind === 'step' ? undefined : l.kind}>
            {l.text}
          </div>
        ))}
      </div>
    </div>
  );
}

export function HomeDeploys() {
  const { t } = useTranslation();
  return (
    <section className="hp-section" aria-labelledby="hp-deploys-title">
      <div className="hp-wrap hp-center">
        <Eyebrow>{t('homepage', 'homeDeployEyebrow')}</Eyebrow>
        <h2 id="hp-deploys-title" className="hp-h2 mt-6">
          {t('homepage', 'homeDeployTitle')}
        </h2>
        <p className="hp-lead mt-5 max-w-[34rem]">{t('homepage', 'homeDeployLead')}</p>
      </div>
      <div className="mt-16 space-y-4" aria-hidden="true">
        {ROWS.map((row, i) => (
          <div key={i} className="hp-marquee">
            <div
              className="hp-marquee-track"
              data-reverse={i % 2 === 1}
              style={{ ['--hp-duration' as string]: `${60 + i * 12}s` }}
            >
              {[...row, ...row].map((c, j) => (
                <Card key={`${c.topic}-${j}`} {...c} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

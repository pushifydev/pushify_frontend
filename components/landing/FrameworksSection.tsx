'use client';

import { useTranslation } from '@/hooks';
import { LandingSectionHeader } from './LandingSectionHeader';

/* Framework SVG icons — unchanged */
const NextjsIcon = () => (
  <svg viewBox="0 0 180 180" fill="none" className="w-6 h-6"><mask id="nj" maskUnits="userSpaceOnUse" x="0" y="0" width="180" height="180"><circle cx="90" cy="90" r="90" fill="currentColor"/></mask><g mask="url(#nj)"><circle cx="90" cy="90" r="90" fill="currentColor"/><path d="M149.508 157.52L69.142 54H54v71.97h12.114V69.384l73.885 95.461a90.304 90.304 0 009.509-7.325z" fill="url(#ng1)"/><rect x="115" y="54" width="12" height="72" fill="url(#ng2)"/></g></svg>
);
const ReactIcon = () => (
  <svg viewBox="-11.5 -10.232 23 20.463" className="w-6 h-6" fill="none"><circle r="2.05" fill="#61DAFB"/><g stroke="#61DAFB" strokeWidth="1" fill="none"><ellipse rx="11" ry="4.2"/><ellipse rx="11" ry="4.2" transform="rotate(60)"/><ellipse rx="11" ry="4.2" transform="rotate(120)"/></g></svg>
);
const VueIcon = () => (
  <svg viewBox="0 0 261.76 226.69" className="w-6 h-6"><path d="M161.096.001l-30.224 52.35L100.647.001H0l130.872 226.69L261.76 0z" fill="#41B883"/><path d="M161.096.001l-30.224 52.35L100.647.001H52.346l78.526 136.01L209.398.001z" fill="#34495E"/></svg>
);
const NuxtIcon = () => (
  <svg viewBox="0 0 400 298" className="w-6 h-6" fill="none"><path d="M227.921 82.074L166.543 0 0 297.14h95.925s.673-1.283 1.897-3.467L166.543 28.14l61.378 53.934z" fill="#00DC82"/></svg>
);
const SvelteIcon = () => (
  <svg viewBox="0 0 98.1 118" className="w-6 h-6"><path d="M91.8 15.6C80.9-.5 59.2-4.7 43.7 5.1L16.3 22.8A31.2 31.2 0 003.5 38.9a32.8 32.8 0 003.1 24.9A31.1 31.1 0 002 75.1a32.9 32.9 0 005.5 24.6c10.9 16.1 32.6 20.3 48.1 10.5l27.4-17.7a31.2 31.2 0 0012.8-16.1 32.8 32.8 0 00-3.1-24.9 31.1 31.1 0 004.5-11.3 32.9 32.9 0 00-5.4-24.6" fill="#FF3E00"/></svg>
);
const AstroIcon = () => (
  <svg viewBox="0 0 85 107" className="w-6 h-6" fill="none"><path d="M27.5893 91.1365C22.7555 86.7 21.3292 78.5338 23.3107 72.1469C26.8138 76.1311 31.5979 77.8534 36.5946 78.8876C44.4257 80.4629 52.1159 79.9722 59.4665 76.4979C60.3484 76.0752 61.1592 75.5001 62.0797 75.0027C62.5765 76.885 62.7253 78.7915 62.4891 80.7309C61.8839 85.7812 59.2397 89.6125 55.1747 92.3736C53.4862 93.5273 51.6782 94.4979 49.9242 95.555C45.0702 98.4819 43.3424 102.093 44.6682 107.601L44.8614 108.369C43.0847 107.282 41.5662 106.139 40.3335 104.699C37.3512 101.209 36.1694 97.1518 36.3462 92.6764C36.4167 91.0574 36.3462 89.4242 36.2267 87.8053C36.0122 85.0233 34.8685 83.3326 32.5765 82.7151C30.0935 82.0453 27.8003 83.0844 26.7456 85.3974C26.6407 85.6227 26.5504 85.8552 26.4169 86.1955C26.7519 87.773 27.0896 89.3554 27.5893 91.1365Z" fill="#FF5D01"/></svg>
);
const RemixIcon = () => (
  <svg viewBox="0 0 800 800" className="w-6 h-6" fill="currentColor"><path d="M587.947 527.768c4.475 65.28 4.475 95.96 4.475 132.232H469.612c0-10.576.785-20.46 1.497-29.56 2.17-27.777 3.875-49.576-17.38-68.358-27.967-24.735-68.903-28.597-121.752-28.597H120V416.46h222.297c60.56 0 101.027-18.286 101.027-72.107 0-47.3-36.606-76.576-101.027-76.576H120V156h248.56c146.902 0 224.476 73.737 224.476 186.14 0 89.576-51.27 145.792-127.478 166.93 65.56 17.448 114.72 47.678 122.389 118.698z"/></svg>
);
const NodeIcon = () => (
  <svg viewBox="0 0 256 289" className="w-6 h-6"><path d="M128 288.464c-3.975 0-7.685-1.06-11.13-2.915l-35.247-20.936c-5.3-2.915-2.65-3.975-1.06-4.505 7.155-2.385 8.48-2.915 15.9-7.155.796-.53 1.856-.265 2.65.265l27.032 16.166c1.06.53 2.385.53 3.18 0l105.74-61.217c1.06-.53 1.59-1.59 1.59-2.915V83.08c0-1.325-.53-2.385-1.59-2.915l-105.74-60.952c-1.06-.53-2.385-.53-3.18 0L20.96 80.165c-1.06.53-1.59 1.855-1.59 2.915v122.17c0 1.06.53 2.385 1.59 2.915l28.887 16.695c15.636 7.95 25.44-1.325 25.44-10.6V93.68c0-1.59 1.325-3.18 3.18-3.18h13.516c1.59 0 3.18 1.325 3.18 3.18v120.58c0 20.936-11.396 33.127-31.272 33.127-6.095 0-10.865 0-24.38-6.625l-27.827-15.9C4.24 220.622 0 213.467 0 205.782V83.346C0 75.66 4.24 68.506 11.13 64.53L116.87 3.048c6.625-3.71 15.636-3.71 22.26 0L244.87 64.53C251.76 68.24 256 75.66 256 83.346v122.17c0 7.685-4.24 15.105-11.13 18.815L139.13 285.55c-3.445 1.855-7.42 2.915-11.13 2.915z" fill="#539E43"/></svg>
);
const PythonIcon = () => (
  <svg viewBox="0 0 256 255" className="w-6 h-6"><path d="M126.916.072c-64.832 0-60.784 28.115-60.784 28.115l.072 29.128h61.868v8.745H41.631S.145 61.355.145 126.77c0 65.417 36.21 63.097 36.21 63.097h21.61v-30.356s-1.165-36.21 35.632-36.21h61.362s34.475.557 34.475-33.319V33.97S194.67.072 126.916.072zM92.802 19.66a11.12 11.12 0 110 22.24 11.12 11.12 0 010-22.24z" fill="#366A96"/><path d="M128.757 254.126c64.832 0 60.784-28.115 60.784-28.115l-.072-29.127H127.6v-8.745h86.441s41.486 4.705 41.486-60.712c0-65.416-36.21-63.096-36.21-63.096h-21.61v30.355s1.165 36.21-35.632 36.21h-61.362s-34.475-.557-34.475 33.32v56.013s-5.235 33.897 62.518 33.897zm34.114-19.586a11.12 11.12 0 110-22.24 11.12 11.12 0 010 22.24z" fill="#FFC331"/></svg>
);
const GoIcon = () => (
  <svg viewBox="0 0 256 108" className="w-6 h-6"><path d="M11.156 47.543c-.208 0-.313-.104-.208-.312l1.356-1.772c.104-.208.416-.312.624-.312h22.96c.208 0 .312.208.208.416l-1.044 1.668c-.104.208-.416.416-.624.416l-23.272-.104z" fill="#00ACD7"/></svg>
);
const LaravelIcon = () => (
  <svg viewBox="0 0 256 264" className="w-6 h-6"><path d="M255.856 59.62c.095.351.144.713.144 1.077v56.568c0 1.478-.79 2.843-2.073 3.578L206.45 148.18v54.18c0 1.478-.79 2.843-2.073 3.578l-99.104 57.24c-.227.13-.468.234-.72.312-.065.02-.13.045-.197.066a3.994 3.994 0 01-2.737 0l-.197-.066a4.042 4.042 0 01-.72-.312L1.597 205.938C.314 205.203-.476 203.838-.476 202.36V32.656c0-.364.05-.726.145-1.077.025-.104.07-.2.1-.299.036-.12.07-.24.117-.356a4.032 4.032 0 01.612-1.076c.04-.057.098-.1.14-.157.063-.083.12-.17.19-.246l.04-.035L51.1.484a4.006 4.006 0 014.145 0l50.332 29.07.04.035c.07.076.127.163.19.247.042.056.1.1.14.156.234.323.43.674.612 1.076.047.117.081.236.117.357.03.098.075.195.1.299.095.35.144.712.144 1.076v106.123l41.182-23.787V57.62c0-.364.05-.726.145-1.076.025-.104.07-.2.1-.3.036-.12.07-.24.117-.356a4.032 4.032 0 01.612-1.076c.04-.056.098-.1.14-.156.063-.084.12-.171.19-.247l.04-.035 50.332-29.07a4.006 4.006 0 014.145 0l50.332 29.07.04.035c.07.076.128.163.191.247.04.056.098.1.14.156.233.323.43.674.612 1.076.046.117.08.237.116.357.03.098.076.195.1.299z" fill="#FF2D20"/></svg>
);

const FRAMEWORKS = [
  { name: 'Next.js', icon: <NextjsIcon /> },
  { name: 'React', icon: <ReactIcon /> },
  { name: 'Vue.js', icon: <VueIcon /> },
  { name: 'Nuxt', icon: <NuxtIcon /> },
  { name: 'Svelte', icon: <SvelteIcon /> },
  { name: 'Astro', icon: <AstroIcon /> },
  { name: 'Remix', icon: <RemixIcon /> },
  { name: 'Node.js', icon: <NodeIcon /> },
  { name: 'Python', icon: <PythonIcon /> },
  { name: 'Go', icon: <GoIcon /> },
  { name: 'Laravel', icon: <LaravelIcon /> },
];

function MarqueeRow({ items, reverse = false }: { items: typeof FRAMEWORKS; reverse?: boolean }) {
  const tripled = [...items, ...items, ...items];
  return (
    <div className="flex overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]">
      <div className={`flex gap-3 ${reverse ? 'animate-marquee-reverse' : 'animate-marquee'}`}>
        {tripled.map((fw, i) => (
          <div
            key={`${fw.name}-${i}`}
            className="flex shrink-0 items-center gap-2.5 px-4 py-2.5 rounded-lg border border-[var(--lp-border)] bg-[var(--lp-surface)]"
          >
            {fw.icon}
            <span className="text-sm font-medium whitespace-nowrap" style={{ color: 'var(--lp-ink)' }}>
              {fw.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function FrameworksSection() {
  const { t } = useTranslation();

  return (
    <section id="frameworks" className="lp-section">
      <div className="lp-container mb-12">
        <LandingSectionHeader
          label={t('landing', 'universalCompatibility')}
          title={
            <>
              {t('landing', 'worksWithEvery')} {t('landing', 'everyFramework')}.
            </>
          }
          description={t('landing', 'zeroConfigRequired')}
        />
      </div>

      <div className="space-y-3 mb-10">
        <MarqueeRow items={FRAMEWORKS} />
        <MarqueeRow items={[...FRAMEWORKS].reverse()} reverse />
      </div>

      <div className="lp-container flex items-center justify-between text-sm" style={{ color: 'var(--lp-muted)' }}>
        <span>{t('landing', 'frameworksSupported')}</span>
        <span className="font-semibold" style={{ color: 'var(--lp-ink)' }}>
          20+
        </span>
      </div>
    </section>
  );
}

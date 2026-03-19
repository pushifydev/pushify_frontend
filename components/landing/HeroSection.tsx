'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Rocket, ArrowRight, GitBranch, Terminal, Github } from 'lucide-react';
import { useTranslation } from '@/hooks';

function useTypewriter(lines: string[], typingSpeed = 50, lineDelay = 800) {
  const [displayedLines, setDisplayedLines] = useState<string[]>([]);
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [currentCharIndex, setCurrentCharIndex] = useState(0);
  const isComplete = currentLineIndex >= lines.length;

  useEffect(() => {
    if (isComplete) return;
    const currentLine = lines[currentLineIndex];
    if (currentCharIndex < currentLine.length) {
      const timeout = setTimeout(() => {
        setDisplayedLines(prev => {
          const newLines = [...prev];
          newLines[currentLineIndex] = currentLine.slice(0, currentCharIndex + 1);
          return newLines;
        });
        setCurrentCharIndex(prev => prev + 1);
      }, typingSpeed);
      return () => clearTimeout(timeout);
    } else {
      const timeout = setTimeout(() => {
        setCurrentLineIndex(prev => prev + 1);
        setCurrentCharIndex(0);
      }, lineDelay);
      return () => clearTimeout(timeout);
    }
  }, [currentLineIndex, currentCharIndex, lines, typingSpeed, lineDelay, isComplete]);

  return { displayedLines, isComplete };
}

export function HeroSection() {
  const { t } = useTranslation();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  const terminalLines = [
    '$ npx pushify init',
    '◆ Detected: Next.js 15 + TypeScript',
    '◆ Configuring build pipeline...',
    '$ npx pushify deploy --prod',
    '▸ Building optimized bundle...',
    '▸ Deploying to your server...',
    '✓ Live at https://app.pushify.dev',
  ];

  const { displayedLines, isComplete } = useTypewriter(terminalLines, 30, 600);

  return (
    <section className="relative min-h-screen pt-24 overflow-hidden">
      {/* Background — subtle gradient orbs */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/4 w-[1000px] h-[600px] bg-[var(--accent-cyan)] rounded-full blur-[300px] opacity-[0.06]" />
      <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-[var(--accent-purple)] rounded-full blur-[250px] opacity-[0.04]" />
      <div className="absolute inset-0 grid-pattern opacity-40" />

      <div className="relative z-10 max-w-7xl mx-auto px-6 pt-20 pb-32">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left — content */}
          <div className={`transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            {/* Badge */}
            <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-[var(--bg-secondary)] border border-[var(--glass-border)] mb-8">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--status-success)] opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--status-success)]" />
              </span>
              <span className="text-xs text-[var(--text-secondary)] terminal-text tracking-wide uppercase">
                {t('landing', 'openSourcePlatform')}
              </span>
            </div>

            {/* Headline */}
            <h1 className="text-5xl md:text-6xl lg:text-[4.25rem] font-extrabold tracking-[-0.035em] leading-[1.08] mb-6">
              <span className="block text-[var(--text-primary)]">{t('branding', 'deployAt')}</span>
              <span className="block gradient-text">{t('branding', 'speedOfThought')}</span>
            </h1>

            <p className="text-lg text-[var(--text-secondary)] max-w-lg mb-10 leading-relaxed">
              {t('branding', 'description')}
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-3 mb-14">
              <Link href="/register" className="btn btn-primary h-12 px-7 text-[15px] font-semibold group">
                <Rocket className="w-[18px] h-[18px]" />
                {t('landing', 'getStartedFree')}
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </Link>
              <a
                href="https://github.com/pushifydev"
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-secondary h-12 px-7 text-[15px] font-semibold"
              >
                <Github className="w-[18px] h-[18px]" />
                {t('landing', 'viewOnGithub')}
              </a>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-4 gap-6">
              {[
                { value: 'MIT', label: 'Open Source' },
                { value: '5+', label: t('landing', 'edgeLocations') },
                { value: '<60s', label: t('landing', 'deployTime') },
                { value: '0', label: t('landing', 'configRequired') },
              ].map((stat, i) => (
                <div
                  key={i}
                  className={`transition-all duration-700 delay-${(i + 1) * 100} ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
                >
                  <div className="text-xl md:text-2xl font-bold text-[var(--accent-cyan)] terminal-text">{stat.value}</div>
                  <div className="text-xs text-[var(--text-muted)] mt-0.5">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right — Terminal */}
          <div className={`relative transition-all duration-700 delay-200 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <div className="relative rounded-2xl overflow-hidden bg-[var(--bg-secondary)] border border-[var(--glass-border-md)] shadow-2xl shadow-black/20">
              {/* Terminal header */}
              <div className="flex items-center justify-between px-4 py-3 bg-[var(--bg-tertiary)] border-b border-[var(--glass-border)]">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-[#ff5f57]" />
                  <div className="w-3 h-3 rounded-full bg-[#febc2e]" />
                  <div className="w-3 h-3 rounded-full bg-[#28c840]" />
                </div>
                <div className="flex items-center gap-1.5 text-xs text-[var(--text-muted)] terminal-text">
                  <Terminal className="w-3 h-3" />
                  pushify-cli
                </div>
                <div className="w-16" />
              </div>

              {/* Terminal content */}
              <div className="p-5 min-h-[300px] terminal-text text-[13px] leading-6">
                {displayedLines.map((line, i) => (
                  <div
                    key={i}
                    className={
                      line.startsWith('$') ? 'text-[var(--text-primary)]' :
                      line.startsWith('✓') ? 'text-[var(--status-success)]' :
                      line.startsWith('▸') ? 'text-[var(--accent-cyan)]' :
                      line.startsWith('◆') ? 'text-[var(--accent-purple)]' :
                      'text-[var(--text-secondary)]'
                    }
                  >
                    {line}
                    {i === displayedLines.length - 1 && !isComplete && (
                      <span className="inline-block w-2 h-4 bg-[var(--accent-cyan)] ml-0.5 animate-pulse" />
                    )}
                  </div>
                ))}
                {isComplete && (
                  <div className="mt-4 p-3 rounded-lg bg-[var(--status-success)]/10 border border-[var(--status-success)]/20">
                    <div className="flex items-center gap-2 text-[var(--status-success)] text-sm">
                      <Rocket className="w-3.5 h-3.5" />
                      <span className="font-medium">Deployed successfully!</span>
                    </div>
                    <span className="text-[var(--accent-cyan)] text-xs mt-1 block">https://app.pushify.dev →</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

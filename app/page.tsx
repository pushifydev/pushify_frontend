'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Zap,
  Shield,
  GitBranch,
  Rocket,
  ArrowRight,
  Activity,
  Users,
  Terminal,
  Globe,
  Lock,
  Cpu,
} from 'lucide-react';
import { useTranslation } from '@/hooks';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { LogoMark } from '@/components/logo';

// Typewriter hook for terminal animation
function useTypewriter(lines: string[], typingSpeed = 50, lineDelay = 800) {
  const [displayedLines, setDisplayedLines] = useState<string[]>([]);
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [currentCharIndex, setCurrentCharIndex] = useState(0);
  const isComplete = currentLineIndex >= lines.length;

  useEffect(() => {
    if (isComplete) {
      return;
    }

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

// Generate stable particle positions
function generateParticlePositions(count: number) {
  const positions = [];
  for (let i = 0; i < count; i++) {
    positions.push({
      left: (i * 17 + 5) % 100,
      top: (i * 23 + 10) % 100,
      duration: 15 + (i % 5) * 4,
      delay: (i % 10) * 1,
    });
  }
  return positions;
}

const particlePositions = generateParticlePositions(20);

// Floating particles component
function FloatingParticles() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particlePositions.map((pos, i) => (
        <div
          key={i}
          className="absolute w-1 h-1 rounded-full bg-[var(--accent-cyan)] opacity-20"
          style={{
            left: `${pos.left}%`,
            top: `${pos.top}%`,
            animation: `float-particle ${pos.duration}s linear infinite`,
            animationDelay: `${pos.delay}s`,
          }}
        />
      ))}
    </div>
  );
}

// Custom hook for mount animation
function useMounted() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Use requestAnimationFrame to defer state update
    const frame = requestAnimationFrame(() => {
      setMounted(true);
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  return mounted;
}

export default function LandingPage() {
  const { t } = useTranslation();
  const mounted = useMounted();

  const terminalLines = [
    '$ npx pushify init',
    '◆ Detected: Next.js 15 + TypeScript',
    '◆ Configuring edge runtime...',
    '$ npx pushify deploy --prod',
    '▸ Building optimized bundle...',
    '▸ Deploying to 50+ edge locations...',
    '✓ Live at https://app.pushify.dev',
  ];

  const { displayedLines, isComplete } = useTypewriter(terminalLines, 30, 600);

  const features = [
    {
      icon: <Zap className="w-6 h-6" />,
      title: t('branding', 'zeroConfig'),
      description: t('branding', 'zeroConfigDesc'),
      accent: 'cyan',
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: t('branding', 'autoHttps'),
      description: t('branding', 'autoHttpsDesc'),
      accent: 'purple',
    },
    {
      icon: <Activity className="w-6 h-6" />,
      title: t('branding', 'realTimeLogs'),
      description: t('branding', 'realTimeLogsDesc'),
      accent: 'cyan',
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: t('branding', 'teamCollab'),
      description: t('branding', 'teamCollabDesc'),
      accent: 'purple',
    },
  ];

  const frameworks = [
    { name: 'Next.js', icon: '▲' },
    { name: 'React', icon: '⚛' },
    { name: 'Vue', icon: '◆' },
    { name: 'Nuxt', icon: '◇' },
    { name: 'Svelte', icon: '◈' },
    { name: 'Astro', icon: '✦' },
    { name: 'Remix', icon: '◉' },
    { name: 'Node.js', icon: '⬡' },
  ];

  const stats = [
    { value: '50+', label: t('landing', 'edgeLocations') },
    { value: '<50ms', label: t('landing', 'deployTime') },
    { value: '99.99%', label: t('landing', 'uptimeSla') },
    { value: '0', label: t('landing', 'configRequired') },
  ];

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] overflow-x-hidden">
      {/* Custom styles for this page */}
      <style jsx global>{`
        @keyframes float-particle {
          0%, 100% { transform: translateY(0) translateX(0); opacity: 0; }
          10% { opacity: 0.3; }
          90% { opacity: 0.3; }
          100% { transform: translateY(-100vh) translateX(50px); opacity: 0; }
        }

        @keyframes scan-line {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(100vh); }
        }

        @keyframes glow-pulse {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 1; }
        }

        @keyframes text-flicker {
          0%, 100% { opacity: 1; }
          92% { opacity: 1; }
          93% { opacity: 0.8; }
          94% { opacity: 1; }
          95% { opacity: 0.9; }
          96% { opacity: 1; }
        }

        @keyframes terminal-blink {
          0%, 50% { opacity: 1; }
          51%, 100% { opacity: 0; }
        }

        @keyframes slide-up-fade {
          from { opacity: 0; transform: translateY(40px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes gradient-shift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }

        .animate-slide-up {
          animation: slide-up-fade 0.8s ease-out forwards;
        }

        .animate-slide-up-delay-1 {
          animation: slide-up-fade 0.8s ease-out 0.1s forwards;
          opacity: 0;
        }

        .animate-slide-up-delay-2 {
          animation: slide-up-fade 0.8s ease-out 0.2s forwards;
          opacity: 0;
        }

        .animate-slide-up-delay-3 {
          animation: slide-up-fade 0.8s ease-out 0.3s forwards;
          opacity: 0;
        }

        .animate-slide-up-delay-4 {
          animation: slide-up-fade 0.8s ease-out 0.4s forwards;
          opacity: 0;
        }

        .terminal-cursor::after {
          content: '▊';
          animation: terminal-blink 1s step-end infinite;
          color: var(--accent-cyan);
        }

        .glow-text {
          text-shadow: 0 0 40px rgba(34, 211, 238, 0.5), 0 0 80px rgba(34, 211, 238, 0.3);
        }

        .gradient-border {
          position: relative;
        }

        .gradient-border::before {
          content: '';
          position: absolute;
          inset: 0;
          padding: 1px;
          background: linear-gradient(135deg, var(--accent-cyan), var(--accent-purple), transparent);
          -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
          border-radius: inherit;
          pointer-events: none;
        }

        .hero-gradient {
          background: radial-gradient(ellipse 80% 50% at 50% -20%, rgba(34, 211, 238, 0.15), transparent),
                      radial-gradient(ellipse 60% 50% at 80% 50%, rgba(167, 139, 250, 0.1), transparent);
        }

        .diagonal-lines {
          background-image: repeating-linear-gradient(
            -45deg,
            transparent,
            transparent 10px,
            rgba(255, 255, 255, 0.01) 10px,
            rgba(255, 255, 255, 0.01) 11px
          );
        }

        /* Marquee animations */
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-33.333%); }
        }

        @keyframes marquee-reverse {
          0% { transform: translateX(-33.333%); }
          100% { transform: translateX(0); }
        }

        .animate-marquee {
          animation: marquee 40s linear infinite;
        }

        .animate-marquee-reverse {
          animation: marquee-reverse 40s linear infinite;
        }

        /* Slow spin animations */
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @keyframes spin-slow-reverse {
          from { transform: rotate(360deg); }
          to { transform: rotate(0deg); }
        }

        .animate-spin-slow {
          animation: spin-slow 20s linear infinite;
        }

        .animate-spin-slow-reverse {
          animation: spin-slow-reverse 15s linear infinite;
        }

        /* Float animations */
        @keyframes float-slow {
          0%, 100% { transform: translateY(0) translateX(0); }
          25% { transform: translateY(-20px) translateX(10px); }
          50% { transform: translateY(0) translateX(20px); }
          75% { transform: translateY(20px) translateX(10px); }
        }

        @keyframes float-slow-reverse {
          0%, 100% { transform: translateY(0) translateX(0); }
          25% { transform: translateY(20px) translateX(-10px); }
          50% { transform: translateY(0) translateX(-20px); }
          75% { transform: translateY(-20px) translateX(-10px); }
        }

        .animate-float-slow {
          animation: float-slow 15s ease-in-out infinite;
        }

        .animate-float-slow-reverse {
          animation: float-slow-reverse 18s ease-in-out infinite;
        }

        /* Scan line animation */
        @keyframes scan {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(100vh); }
        }

        .animate-scan {
          animation: scan 8s linear infinite;
        }

        /* Gradient rotate */
        @keyframes gradient-rotate {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        .animate-gradient-rotate {
          animation: gradient-rotate 3s ease infinite;
        }

        /* Pulse animations */
        @keyframes pulse-slow {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.05); }
        }

        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 20px rgba(34, 211, 238, 0.3); }
          50% { box-shadow: 0 0 40px rgba(34, 211, 238, 0.6), 0 0 60px rgba(167, 139, 250, 0.3); }
        }

        @keyframes ping-slow {
          0% { transform: scale(1); opacity: 0.3; }
          75%, 100% { transform: scale(2); opacity: 0; }
        }

        .animate-pulse-slow {
          animation: pulse-slow 4s ease-in-out infinite;
        }

        .animate-pulse-glow {
          animation: pulse-glow 2s ease-in-out infinite;
        }

        .animate-ping-slow {
          animation: ping-slow 3s ease-out infinite;
        }

        /* Bounce slow */
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }

        .animate-bounce-slow {
          animation: bounce-slow 2s ease-in-out infinite;
        }
      `}</style>

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-transparent backdrop-blur-3xl border-b border-transparent">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <LogoMark size={40} className="transform group-hover:scale-110 transition-transform duration-300" />
            <span className="text-xl font-bold tracking-tight">Pushify</span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm text-[var(--text-muted)] hover:text-[var(--accent-cyan)] transition-colors">
              {t('landing', 'features')}
            </a>
            <a href="#frameworks" className="text-sm text-[var(--text-muted)] hover:text-[var(--accent-cyan)] transition-colors">
              {t('landing', 'frameworks')}
            </a>
            <a href="https://github.com/pushify" target="_blank" rel="noopener noreferrer" className="text-sm text-[var(--text-muted)] hover:text-[var(--accent-cyan)] transition-colors">
              {t('branding', 'github')}
            </a>
          </div>

          <div className="flex items-center gap-4">
            <LanguageSwitcher />
            <Link
              href="/login"
              className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors hidden sm:block"
            >
              {t('auth', 'signIn')}
            </Link>
            <Link href="/register" className="btn btn-primary h-10 text-sm">
              {t('auth', 'signUp')}
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section - Asymmetric Layout */}
      <section className="relative min-h-screen pt-24 hero-gradient">
        {/* Background elements */}
        <div className="absolute inset-0 grid-pattern opacity-50" />
        <div className="absolute inset-0 diagonal-lines" />
        <FloatingParticles />

        {/* Accent orbs */}
        <div className="absolute top-32 left-[10%] w-[500px] h-[500px] bg-[var(--accent-cyan)] rounded-full blur-[150px] opacity-[0.07]" />
        <div className="absolute bottom-32 right-[5%] w-[600px] h-[600px] bg-[var(--accent-purple)] rounded-full blur-[180px] opacity-[0.07]" />

        <div className="relative z-10 max-w-7xl mx-auto px-6 pt-20 pb-32">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left side - Text content */}
            <div className={mounted ? 'animate-slide-up' : 'opacity-0'}>
              {/* Status badge */}
              <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-[var(--bg-secondary)]/80 border border-[var(--border-subtle)] mb-8 backdrop-blur-sm">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--status-success)] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--status-success)]"></span>
                </span>
                <span className="text-sm text-[var(--text-secondary)] terminal-text">{t('landing', 'openSourcePlatform')}</span>
              </div>

              {/* Main headline */}
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.1] mb-6">
                <span className="block text-[var(--text-primary)]">{t('branding', 'deployAt')}</span>
                <span className="block gradient-text glow-text">{t('branding', 'speedOfThought')}</span>
              </h1>

              <p className="text-lg md:text-xl text-[var(--text-secondary)] max-w-lg mb-10 leading-relaxed">
                {t('branding', 'description')}
              </p>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row gap-4 mb-16">
                <Link href="/register" className="btn btn-primary h-14 px-8 text-base font-semibold group">
                  <Rocket className="w-5 h-5 group-hover:translate-x-[-2px] transition-transform" />
                  {t('landing', 'getStartedFree')}
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <a
                  href="https://github.com/pushify"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-secondary h-14 px-8 text-base font-semibold"
                >
                  <GitBranch className="w-5 h-5" />
                  {t('landing', 'viewOnGithub')}
                </a>
              </div>

              {/* Stats row */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {stats.map((stat, i) => (
                  <div key={i} className={`${mounted ? `animate-slide-up-delay-${i + 1}` : 'opacity-0'}`}>
                    <div className="text-2xl md:text-3xl font-bold text-[var(--accent-cyan)] terminal-text">
                      {stat.value}
                    </div>
                    <div className="text-sm text-[var(--text-muted)]">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right side - Terminal */}
            <div className={`relative ${mounted ? 'animate-slide-up-delay-2' : 'opacity-0'}`}>
              {/* Floating decoration */}
              <div className="absolute -top-8 -right-8 w-24 h-24 border border-[var(--accent-cyan)]/20 rounded-xl transform rotate-12" />
              <div className="absolute -bottom-6 -left-6 w-16 h-16 border border-[var(--accent-purple)]/20 rounded-lg transform -rotate-6" />

              {/* Terminal window */}
              <div className="relative gradient-border rounded-2xl overflow-hidden bg-[var(--bg-secondary)] shadow-2xl shadow-[var(--accent-cyan)]/10">
                {/* Terminal header */}
                <div className="flex items-center justify-between px-5 py-4 bg-[var(--bg-tertiary)] border-b border-[var(--border-subtle)]">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-[#ff5f57]" />
                    <div className="w-3 h-3 rounded-full bg-[#febc2e]" />
                    <div className="w-3 h-3 rounded-full bg-[#28c840]" />
                  </div>
                  <div className="flex items-center gap-2 text-xs text-[var(--text-muted)] terminal-text">
                    <Terminal className="w-3 h-3" />
                    pushify-cli
                  </div>
                  <div className="w-16" />
                </div>

                {/* Terminal content */}
                <div className="p-6 min-h-[320px] terminal-text text-sm">
                  {displayedLines.map((line, i) => (
                    <div
                      key={i}
                      className={`mb-2 ${
                        line.startsWith('$') ? 'text-[var(--text-primary)]' :
                        line.startsWith('✓') ? 'text-[var(--status-success)]' :
                        line.startsWith('▸') ? 'text-[var(--accent-cyan)]' :
                        line.startsWith('◆') ? 'text-[var(--accent-purple)]' :
                        'text-[var(--text-secondary)]'
                      }`}
                    >
                      {line}
                      {i === displayedLines.length - 1 && !isComplete && (
                        <span className="terminal-cursor" />
                      )}
                    </div>
                  ))}
                  {isComplete && (
                    <div className="mt-6 p-4 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--status-success)]/30">
                      <div className="flex items-center gap-2 text-[var(--status-success)] mb-2">
                        <Rocket className="w-4 h-4" />
                        <span className="font-semibold">Deployed successfully!</span>
                      </div>
                      <a href="#" className="text-[var(--accent-cyan)] hover:underline">
                        https://app.pushify.dev →
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Frameworks Section - Infinite Marquee */}
      <section id="frameworks" className="relative py-32 border-y border-[var(--border-subtle)] overflow-hidden">
        {/* Animated gradient background */}
        <div className="absolute inset-0 bg-[var(--bg-secondary)]/30" />
        <div className="absolute inset-0 bg-gradient-to-r from-[var(--bg-primary)] via-transparent to-[var(--bg-primary)] z-10 pointer-events-none" />

        {/* Glowing orbs */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-[var(--accent-cyan)] rounded-full blur-[200px] opacity-[0.05]" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[var(--accent-purple)] rounded-full blur-[200px] opacity-[0.05]" />

        <div className="relative z-10">
          <div className="text-center mb-16 px-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--accent-purple)]/10 border border-[var(--accent-purple)]/20 mb-6">
              <Globe className="w-4 h-4 text-[var(--accent-purple)]" />
              <span className="text-sm text-[var(--accent-purple)] terminal-text">{t('landing', 'universalCompatibility')}</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
              {t('landing', 'worksWithEvery')} <span className="gradient-text">{t('landing', 'everyFramework')}</span>
            </h2>
            <p className="text-lg text-[var(--text-secondary)] max-w-xl mx-auto">
              {t('landing', 'zeroConfigRequired')}
            </p>
          </div>

          {/* Marquee container */}
          <div className="relative">
            {/* First row - scrolls left */}
            <div className="flex animate-marquee mb-6">
              {[...frameworks, ...frameworks, ...frameworks].map((fw, i) => (
                <div
                  key={`row1-${i}`}
                  className="group relative flex-shrink-0 mx-3"
                >
                  <div className="relative px-8 py-6 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] hover:border-[var(--accent-cyan)]/50 transition-all duration-500 cursor-pointer overflow-hidden transform hover:scale-105 hover:-translate-y-1">
                    {/* Glow effect on hover */}
                    <div className="absolute inset-0 bg-gradient-to-br from-[var(--accent-cyan)]/10 to-[var(--accent-purple)]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <div className="absolute -inset-1 bg-gradient-to-r from-[var(--accent-cyan)] to-[var(--accent-purple)] rounded-2xl blur-xl opacity-0 group-hover:opacity-20 transition-opacity duration-500" />

                    <div className="relative flex items-center gap-4">
                      <span className="text-4xl transform group-hover:scale-110 group-hover:rotate-12 transition-transform duration-300">
                        {fw.icon}
                      </span>
                      <div>
                        <span className="block text-xl font-semibold text-[var(--text-primary)] group-hover:text-[var(--accent-cyan)] transition-colors">
                          {fw.name}
                        </span>
                        <span className="block text-xs text-[var(--text-muted)] terminal-text">
                          {t('landing', 'autoDetected')}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Second row - scrolls right */}
            <div className="flex animate-marquee-reverse">
              {[...frameworks.slice().reverse(), ...frameworks.slice().reverse(), ...frameworks.slice().reverse()].map((fw, i) => (
                <div
                  key={`row2-${i}`}
                  className="group relative flex-shrink-0 mx-3"
                >
                  <div className="relative px-8 py-6 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] hover:border-[var(--accent-purple)]/50 transition-all duration-500 cursor-pointer overflow-hidden transform hover:scale-105 hover:-translate-y-1">
                    <div className="absolute inset-0 bg-gradient-to-br from-[var(--accent-purple)]/10 to-[var(--accent-cyan)]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <div className="absolute -inset-1 bg-gradient-to-r from-[var(--accent-purple)] to-[var(--accent-cyan)] rounded-2xl blur-xl opacity-0 group-hover:opacity-20 transition-opacity duration-500" />

                    <div className="relative flex items-center gap-4">
                      <span className="text-4xl transform group-hover:scale-110 group-hover:-rotate-12 transition-transform duration-300">
                        {fw.icon}
                      </span>
                      <div>
                        <span className="block text-xl font-semibold text-[var(--text-primary)] group-hover:text-[var(--accent-purple)] transition-colors">
                          {fw.name}
                        </span>
                        <span className="block text-xs text-[var(--text-muted)] terminal-text">
                          {t('landing', 'zeroConfig')}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Framework count badge */}
          <div className="text-center mt-12 px-6">
            <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-[var(--bg-tertiary)] border border-[var(--border-subtle)]">
              <span className="text-3xl font-bold gradient-text">20+</span>
              <span className="text-[var(--text-secondary)]">{t('landing', 'frameworksSupported')}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section - Bento Grid */}
      <section id="features" className="relative py-32 overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 grid-pattern opacity-30" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[var(--accent-cyan)] rounded-full blur-[300px] opacity-[0.03]" />

        <div className="relative z-10 max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--accent-cyan)]/10 border border-[var(--accent-cyan)]/20 mb-6">
              <Cpu className="w-4 h-4 text-[var(--accent-cyan)]" />
              <span className="text-sm text-[var(--accent-cyan)] terminal-text">{t('landing', 'platformFeatures')}</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
              {t('landing', 'everythingYouNeed')}<br />
              <span className="gradient-text">{t('landing', 'shipFaster')}</span>
            </h2>
            <p className="text-lg text-[var(--text-secondary)] max-w-2xl mx-auto">
              {t('landing', 'featuresDescription')}
            </p>
          </div>

          {/* Bento Grid Layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {/* Feature 1 - Large card spanning 2 columns */}
            <div className="group relative lg:col-span-2 p-8 md:p-10 rounded-3xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] hover:border-[var(--accent-cyan)]/40 transition-all duration-500 overflow-hidden min-h-[280px]">
              {/* Animated background gradient */}
              <div className="absolute inset-0 bg-gradient-to-br from-[var(--accent-cyan)]/10 via-transparent to-[var(--accent-purple)]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

              {/* Floating decoration */}
              <div className="absolute top-4 right-4 w-32 h-32 border border-[var(--accent-cyan)]/10 rounded-full transform group-hover:scale-150 group-hover:rotate-45 transition-all duration-700 opacity-50" />
              <div className="absolute bottom-4 right-8 w-20 h-20 border border-[var(--accent-purple)]/10 rounded-full transform group-hover:scale-125 transition-all duration-500" />

              <div className="relative z-10 flex flex-col h-full">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--accent-cyan)] to-[var(--accent-cyan-dim)] flex items-center justify-center text-[var(--bg-primary)] mb-6 group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-[var(--accent-cyan)]/30 transition-all duration-300">
                  <Zap className="w-8 h-8" />
                </div>
                <h3 className="text-2xl md:text-3xl font-bold mb-4 group-hover:text-[var(--accent-cyan)] transition-colors">{features[0].title}</h3>
                <p className="text-[var(--text-secondary)] text-lg leading-relaxed max-w-lg">{features[0].description}</p>

                {/* Terminal preview */}
                <div className="mt-auto pt-6">
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border-subtle)] terminal-text text-sm">
                    <span className="text-[var(--accent-cyan)]">$</span>
                    <span className="text-[var(--text-muted)]">npx pushify deploy</span>
                    <span className="text-[var(--status-success)]">✓</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Feature 2 - Tall card */}
            <div className="group relative p-8 rounded-3xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] hover:border-[var(--accent-purple)]/40 transition-all duration-500 overflow-hidden min-h-[280px] lg:row-span-2">
              <div className="absolute inset-0 bg-gradient-to-b from-[var(--accent-purple)]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

              {/* Shield animation */}
              <div className="absolute inset-0 flex items-center justify-center opacity-5 group-hover:opacity-10 transition-opacity">
                <Shield className="w-64 h-64 transform group-hover:scale-110 transition-transform duration-700" />
              </div>

              <div className="relative z-10 flex flex-col h-full">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--accent-purple)] to-[var(--accent-purple-dim)] flex items-center justify-center text-[var(--bg-primary)] mb-6 group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-[var(--accent-purple)]/30 transition-all duration-300">
                  <Shield className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold mb-4 group-hover:text-[var(--accent-purple)] transition-colors">{features[1].title}</h3>
                <p className="text-[var(--text-secondary)] leading-relaxed mb-6">{features[1].description}</p>

                {/* Security badges */}
                <div className="mt-auto space-y-3">
                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-8 h-8 rounded-lg bg-[var(--status-success)]/10 flex items-center justify-center">
                      <Lock className="w-4 h-4 text-[var(--status-success)]" />
                    </div>
                    <span className="text-[var(--text-muted)]">{t('landing', 'sslCertificates')}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-8 h-8 rounded-lg bg-[var(--status-success)]/10 flex items-center justify-center">
                      <Globe className="w-4 h-4 text-[var(--status-success)]" />
                    </div>
                    <span className="text-[var(--text-muted)]">{t('landing', 'customDomains')}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-8 h-8 rounded-lg bg-[var(--status-success)]/10 flex items-center justify-center">
                      <Shield className="w-4 h-4 text-[var(--status-success)]" />
                    </div>
                    <span className="text-[var(--text-muted)]">{t('landing', 'ddosProtection')}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Feature 3 - Medium card */}
            <div className="group relative p-8 rounded-3xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] hover:border-[var(--accent-cyan)]/40 transition-all duration-500 overflow-hidden min-h-[280px]">
              <div className="absolute inset-0 bg-gradient-to-br from-[var(--accent-cyan)]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

              {/* Animated pulse rings */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                <div className="w-32 h-32 rounded-full border border-[var(--accent-cyan)]/20 animate-ping-slow opacity-20" />
              </div>

              <div className="relative z-10">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--accent-cyan)] to-[var(--accent-cyan-dim)] flex items-center justify-center text-[var(--bg-primary)] mb-6 group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-[var(--accent-cyan)]/30 transition-all duration-300">
                  <Activity className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold mb-4 group-hover:text-[var(--accent-cyan)] transition-colors">{features[2].title}</h3>
                <p className="text-[var(--text-secondary)] leading-relaxed mb-6">{features[2].description}</p>

                {/* Live metrics preview */}
                <div className="flex items-center gap-4">
                  <div className="flex-1 h-2 rounded-full bg-[var(--bg-tertiary)] overflow-hidden">
                    <div className="h-full w-3/4 rounded-full bg-gradient-to-r from-[var(--accent-cyan)] to-[var(--accent-purple)] animate-pulse" />
                  </div>
                  <span className="text-sm text-[var(--accent-cyan)] terminal-text">{t('landing', 'live')}</span>
                </div>
              </div>
            </div>

            {/* Feature 4 - Medium card */}
            <div className="group relative p-8 rounded-3xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] hover:border-[var(--accent-purple)]/40 transition-all duration-500 overflow-hidden min-h-[280px]">
              <div className="absolute inset-0 bg-gradient-to-br from-[var(--accent-purple)]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

              <div className="relative z-10">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--accent-purple)] to-[var(--accent-purple-dim)] flex items-center justify-center text-[var(--bg-primary)] mb-6 group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-[var(--accent-purple)]/30 transition-all duration-300">
                  <Users className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold mb-4 group-hover:text-[var(--accent-purple)] transition-colors">{features[3].title}</h3>
                <p className="text-[var(--text-secondary)] leading-relaxed mb-6">{features[3].description}</p>

                {/* Team avatars */}
                <div className="flex items-center">
                  <div className="flex -space-x-3">
                    {[...Array(4)].map((_, i) => (
                      <div
                        key={i}
                        className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--accent-cyan)] to-[var(--accent-purple)] border-2 border-[var(--bg-secondary)] flex items-center justify-center text-xs font-bold text-[var(--bg-primary)]"
                        style={{ opacity: 1 - i * 0.2 }}
                      >
                        {['A', 'B', 'C', '+'][i]}
                      </div>
                    ))}
                  </div>
                  <span className="ml-4 text-sm text-[var(--text-muted)]">{t('landing', 'unlimitedTeamMembers')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section - Dramatic */}
      <section className="relative py-40 overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0 hero-gradient" />
        <div className="absolute inset-0 grid-pattern opacity-30" />

        {/* Floating orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[var(--accent-cyan)] rounded-full blur-[200px] opacity-[0.08] animate-float-slow" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[var(--accent-purple)] rounded-full blur-[200px] opacity-[0.08] animate-float-slow-reverse" />

        {/* Animated scan lines */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-30">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[var(--accent-cyan)]/5 to-transparent h-32 animate-scan" />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-6">
          {/* Main CTA card */}
          <div className="relative rounded-[2.5rem] overflow-hidden">
            {/* Animated gradient border */}
            <div className="absolute inset-0 bg-gradient-to-r from-[var(--accent-cyan)] via-[var(--accent-purple)] to-[var(--accent-cyan)] p-[2px] rounded-[2.5rem] animate-gradient-rotate bg-[length:200%_100%]" />

            <div className="relative m-[2px] p-12 md:p-20 rounded-[calc(2.5rem-2px)] bg-[var(--bg-secondary)] backdrop-blur-xl">
              {/* Background glow */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[var(--accent-cyan)] rounded-full blur-[200px] opacity-[0.07]" />
              <div className="absolute bottom-0 right-0 translate-x-1/4 translate-y-1/4 w-[400px] h-[400px] bg-[var(--accent-purple)] rounded-full blur-[150px] opacity-[0.07]" />

              {/* Floating decorations */}
              <div className="absolute top-8 left-8 w-24 h-24 border border-[var(--accent-cyan)]/20 rounded-full animate-spin-slow" />
              <div className="absolute top-8 left-8 w-16 h-16 border border-[var(--accent-purple)]/20 rounded-full animate-spin-slow-reverse" />
              <div className="absolute bottom-8 right-8 w-32 h-32 border border-[var(--accent-purple)]/20 rounded-2xl transform rotate-45 animate-pulse-slow" />

              <div className="relative z-10 text-center">
                {/* Animated icon */}
                <div className="relative w-24 h-24 mx-auto mb-10">
                  <div className="absolute inset-0 bg-gradient-to-br from-[var(--accent-cyan)] to-[var(--accent-purple)] rounded-3xl animate-pulse-glow" />
                  <div className="absolute inset-1 bg-[var(--bg-secondary)] rounded-[calc(1.5rem-4px)] flex items-center justify-center">
                    <Rocket className="w-10 h-10 text-[var(--accent-cyan)] animate-bounce-slow" />
                  </div>
                  {/* Orbiting dots */}
                  <div className="absolute inset-0 animate-spin-slow">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-[var(--accent-cyan)] rounded-full shadow-lg shadow-[var(--accent-cyan)]/50" />
                  </div>
                  <div className="absolute inset-0 animate-spin-slow-reverse">
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-2 h-2 bg-[var(--accent-purple)] rounded-full shadow-lg shadow-[var(--accent-purple)]/50" />
                  </div>
                </div>

                {/* Headline with glow */}
                <h2 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6 glow-text">
                  {t('landing', 'readyToLaunch')} <span className="gradient-text">{t('landing', 'launch')}</span>?
                </h2>

                <p className="text-xl text-[var(--text-secondary)] mb-12 max-w-2xl mx-auto leading-relaxed">
                  {t('landing', 'ctaDescription')}
                  <br />
                  <span className="text-[var(--text-primary)] font-medium">{t('landing', 'deployInSeconds')}</span>
                </p>

                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10">
                  <Link
                    href="/register"
                    className="group relative h-16 px-12 rounded-2xl font-semibold text-lg overflow-hidden bg-gradient-to-r from-[var(--accent-cyan)] to-[var(--accent-purple)] text-[var(--bg-primary)] flex items-center gap-3 hover:shadow-xl hover:shadow-[var(--accent-cyan)]/30 transition-all duration-300 hover:scale-105"
                  >
                    {/* Shine effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                    <Rocket className="w-6 h-6 relative z-10" />
                    <span className="relative z-10">{t('landing', 'startDeployingFree')}</span>
                    <ArrowRight className="w-6 h-6 relative z-10 group-hover:translate-x-1 transition-transform" />
                  </Link>

                  <a
                    href="https://github.com/pushify"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="h-16 px-10 rounded-2xl font-semibold text-lg border-2 border-[var(--border-default)] text-[var(--text-primary)] flex items-center gap-3 hover:border-[var(--accent-cyan)] hover:bg-[var(--accent-cyan)]/5 transition-all duration-300"
                  >
                    <GitBranch className="w-5 h-5" />
                    {t('landing', 'starOnGithub')}
                  </a>
                </div>

                {/* Trust badges */}
                <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-[var(--text-muted)]">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-[var(--status-success)] animate-pulse" />
                    <span>{t('landing', 'uptime')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Lock className="w-4 h-4 text-[var(--accent-cyan)]" />
                    <span>{t('landing', 'soc2Compliant')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-[var(--accent-purple)]" />
                    <span>{t('landing', 'freeForeverPlan')}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative py-16 border-t border-[var(--border-subtle)]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex items-center gap-3">
              <LogoMark size={40} />
              <div>
                <span className="font-bold text-lg">Pushify</span>
                <p className="text-xs text-[var(--text-muted)]">{t('landing', 'openSourcePlatform')}</p>
              </div>
            </div>

            <div className="flex items-center gap-8 text-sm">
              <a href="#" className="text-[var(--text-muted)] hover:text-[var(--accent-cyan)] transition-colors">
                {t('branding', 'documentation')}
              </a>
              <a href="#" className="text-[var(--text-muted)] hover:text-[var(--accent-cyan)] transition-colors">
                {t('branding', 'github')}
              </a>
              <a href="#" className="text-[var(--text-muted)] hover:text-[var(--accent-cyan)] transition-colors">
                {t('branding', 'status')}
              </a>
              <a href="#" className="text-[var(--text-muted)] hover:text-[var(--accent-cyan)] transition-colors">
                {t('landing', 'twitter')}
              </a>
            </div>

            <p className="text-sm text-[var(--text-muted)]">
              &copy; {new Date().getFullYear()} Pushify. {t('landing', 'openSourceUnderMit')}.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

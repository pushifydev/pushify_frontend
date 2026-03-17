/**
 * Framework configuration used in project creation wizard.
 * Moved from projects/new/page.tsx to eliminate hardcoded config in page files.
 */

export interface FrameworkConfig {
  id: string;
  name: string;
  icon: string;
  buildCommand: string;
  outputDirectory: string;
  installCommand: string;
  startCommand?: string;
  dockerfilePath?: string;
}

export const FRAMEWORKS: FrameworkConfig[] = [
  { id: 'nextjs',  name: 'Next.js',  icon: '▲', buildCommand: 'npm run build', outputDirectory: '.next',    installCommand: 'npm install' },
  { id: 'react',   name: 'React',    icon: '⚛', buildCommand: 'npm run build', outputDirectory: 'build',    installCommand: 'npm install' },
  { id: 'vue',     name: 'Vue',      icon: '◆', buildCommand: 'npm run build', outputDirectory: 'dist',     installCommand: 'npm install' },
  { id: 'nuxt',    name: 'Nuxt',     icon: '◇', buildCommand: 'npm run build', outputDirectory: '.output',  installCommand: 'npm install' },
  { id: 'svelte',  name: 'Svelte',   icon: '◈', buildCommand: 'npm run build', outputDirectory: 'build',    installCommand: 'npm install' },
  { id: 'astro',   name: 'Astro',    icon: '✦', buildCommand: 'npm run build', outputDirectory: 'dist',     installCommand: 'npm install' },
  { id: 'remix',   name: 'Remix',    icon: '◉', buildCommand: 'npm run build', outputDirectory: 'build',    installCommand: 'npm install' },
  { id: 'nodejs',  name: 'Node.js',  icon: '⬡', buildCommand: '',              outputDirectory: '',          installCommand: 'npm install', startCommand: 'npm start' },
  { id: 'static',  name: 'Static',   icon: '📄', buildCommand: '',              outputDirectory: '.',         installCommand: '' },
  { id: 'docker',  name: 'Docker',   icon: '🐳', buildCommand: '',              outputDirectory: '',          installCommand: '', dockerfilePath: 'Dockerfile' },
  { id: 'other',   name: 'Other',    icon: '⚙', buildCommand: '',              outputDirectory: '',          installCommand: '' },
];

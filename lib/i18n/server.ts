import 'server-only';
import { type SupportedLocale, installDictionary } from './index';

/**
 * Put a dictionary where the page render can find it, before any of it is rendered.
 *
 * Server components and client-components-rendered-on-the-server are separate module graphs, so
 * loading a dictionary in the layout does not reach the components that actually print the text.
 * `globalThis` is shared by both within the process, which is what `installDictionary` writes to.
 */
export async function ensureDictionaryOnServer(locale: SupportedLocale): Promise<void> {
  if (locale !== 'tr') return;
  const { tr } = await import('./locales/tr');
  installDictionary('tr', tr);
}

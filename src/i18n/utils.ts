import { ui, defaultLang } from './ui';

export function getLangFromUrl(url: URL) {
  const [, lang] = url.pathname.split('/');
  if (lang in ui) return lang as keyof typeof ui;
  return defaultLang;
}

type UIKey = keyof typeof ui[typeof defaultLang]

export function useTranslations(lang: keyof typeof ui) {
  return function t(key: UIKey) {
    return ui[lang][key] || ui[defaultLang][key];
  }
}

// Every string whose key starts with `prefix`, keyed without the prefix:
// Translations<'othello.'> is { play: string, 'your-turn': string, ... }
export type Translations<Prefix extends string> = {
  [K in UIKey as K extends `${Prefix}${infer Rest}` ? Rest : never]: string
}

// Picks a group of strings to hand to a client-side island, so the island
// gets only what it needs instead of importing the whole ui.ts
export function pickTranslations<Prefix extends string>(
  lang: keyof typeof ui,
  prefix: Prefix,
): Translations<Prefix> {
  const t = useTranslations(lang)
  const keys = (Object.keys(ui[defaultLang]) as UIKey[]).filter((key) =>
    key.startsWith(prefix),
  )
  return Object.fromEntries(
    keys.map((key) => [key.slice(prefix.length), t(key)]),
  ) as Translations<Prefix>
}
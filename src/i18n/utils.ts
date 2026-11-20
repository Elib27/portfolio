import { ui, defaultLang } from './ui';

export function getLangFromUrl(url: URL) {
  const [, lang] = url.pathname.split('/');
  if (lang in ui) return lang as keyof typeof ui;
  return defaultLang;
}

export function useTranslations(lang: keyof typeof ui) {
  return function t(key: keyof typeof ui[typeof defaultLang]) {
    // Keys missing from a language (e.g. the frozen French copy) fall back to the default one
    return (ui[lang] as Partial<(typeof ui)[typeof defaultLang]>)[key] || ui[defaultLang][key];
  }
}

import { translations, Language } from "./translations";

export function useTranslations(language?: string) {
  const lang = (language === "es" ? "es" : "en") as Language;
  return translations[lang];
}

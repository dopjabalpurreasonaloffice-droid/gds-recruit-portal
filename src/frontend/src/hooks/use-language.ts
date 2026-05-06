import { type Lang, TRANSLATIONS } from "@/lib/translations";
import { useCallback, useEffect, useState } from "react";

function getNestedValue(obj: Record<string, unknown>, path: string): string {
  return (
    (path.split(".").reduce<unknown>((acc, key) => {
      if (acc && typeof acc === "object") {
        return (acc as Record<string, unknown>)[key];
      }
      return undefined;
    }, obj) as string) ?? path
  );
}

export function useLanguage() {
  const [lang, setLangState] = useState<Lang>(() => {
    const stored = localStorage.getItem("portal-lang");
    return stored === "hi" || stored === "en" ? stored : "en";
  });

  useEffect(() => {
    localStorage.setItem("portal-lang", lang);
  }, [lang]);

  const setLang = useCallback((newLang: Lang) => {
    setLangState(newLang);
  }, []);

  const t = useCallback(
    (key: string): string => {
      const translations = TRANSLATIONS[lang] as unknown as Record<
        string,
        unknown
      >;
      return getNestedValue(translations, key) || key;
    },
    [lang],
  );

  const tNested = useCallback(
    (section: string, key: string): string => {
      return t(`${section}.${key}`);
    },
    [t],
  );

  return { lang, setLang, t, tNested };
}

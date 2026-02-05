export type AppLang = "en" | "es";

export const normalizeLang = (value?: string | null): AppLang =>
  value === "es" ? "es" : "en";

export const resolveLang = (searchParams?: URLSearchParams | null): AppLang => {
  const param = searchParams?.get("lang");
  if (param === "en" || param === "es") {
    return param;
  }
  if (typeof window !== "undefined") {
    const stored =
      window.localStorage.getItem("dash_lang") ||
      window.sessionStorage.getItem("dash_lang");
    if (stored === "en" || stored === "es") {
      return stored;
    }
  }
  return "en";
};

export const persistLang = (lang: AppLang) => {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem("dash_lang", lang);
  } catch {}
  try {
    window.sessionStorage.setItem("dash_lang", lang);
  } catch {}
};

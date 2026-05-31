import { getSingletonHighlighter } from "shiki";

let highlighterPromise: ReturnType<typeof getSingletonHighlighter> | null =
  null;

function getHighlighter() {
  if (!highlighterPromise) {
    highlighterPromise = getSingletonHighlighter({
      themes: ["github-dark"],
      langs: [],
    });
  }
  return highlighterPromise;
}

export async function highlightCode(
  code: string,
  lang: string
): Promise<string> {
  try {
    const highlighter = await getHighlighter();
    const loadedLangs = highlighter.getLoadedLanguages();
    if (!loadedLangs.includes(lang as never)) {
      await highlighter.loadLanguage(lang as never).catch(() => null);
    }
    const finalLang = highlighter.getLoadedLanguages().includes(lang as never)
      ? lang
      : "text";
    return highlighter.codeToHtml(code, {
      lang: finalLang,
      theme: "github-dark",
    });
  } catch {
    return "";
  }
}

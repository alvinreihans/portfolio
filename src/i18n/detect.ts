// Language rules from specs/03-i18n.md ("Pemilihan bahasa").

export const LANGUAGES = ['id', 'en'] as const;
export type Language = (typeof LANGUAGES)[number];

export function isLanguage(value: unknown): value is Language {
  return value === 'id' || value === 'en';
}

// `in` is the legacy ISO code for Indonesian that some older systems still report.
const ALIASES: Record<string, Language> = { id: 'id', in: 'id', en: 'en' };

/**
 * Initial language: the saved choice, else the first browser language that is
 * Indonesian or English, else English (visitors with any other language, Q3.6).
 */
export function detectLanguage(
  saved: string | null,
  browserLanguages: readonly string[],
): Language {
  if (isLanguage(saved)) return saved;

  for (const tag of browserLanguages) {
    const match = ALIASES[tag.toLowerCase().split('-')[0]];
    if (match) return match;
  }
  return 'en';
}

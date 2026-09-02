import bookNamesData from './books.json';

export const protestantBookNamesMap: Record<string, Record<string, string>> = bookNamesData;

export function getProtestantBookName(lang: string, abbrev: string): string | undefined {
  const langMap = protestantBookNamesMap[lang];
  if (langMap && langMap[abbrev]) {
    return langMap[abbrev];
  }
  return undefined;
}

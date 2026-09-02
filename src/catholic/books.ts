import bookNamesData from './books/books.json';

export const catholicBookNamesMap: Record<string, Record<string, string>> = bookNamesData;

export function getCatholicBookName(lang: string, abbrev: string): string | undefined {
  const langMap = catholicBookNamesMap[lang];
  if (langMap && langMap[abbrev]) {
    return langMap[abbrev];
  }
  return undefined;
}

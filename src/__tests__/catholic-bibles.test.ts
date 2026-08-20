import { describe, it, expect } from "bun:test";

import { catholicBookIds_ptbr } from "../catholic/books/books_ptbr";
import { catholicBookIds_es } from "../catholic/books/books_es";
import { catholicBookIds_en } from "../catholic/books/books_en";
import { catholicBookIds_fr } from "../catholic/books/books_fr";
import { catholicBookIds_it } from "../catholic/books/books_it";
import { catholicBookIds_la } from "../catholic/books/books_la";
import { catholicBookIds_de } from "../catholic/books/books_de";

import { getCategory_ptbr } from "../catholic/book-category/book-category_ptbr";
import { getCategory_es } from "../catholic/book-category/book-category_es";
import { getCategory_en } from "../catholic/book-category/book-category_en";
import { getCategory_fr } from "../catholic/book-category/book-category_fr";
import { getCategory_it } from "../catholic/book-category/book-category_it";
import { getCategory_la } from "../catholic/book-category/book-category_la";
import { getCategory_de } from "../catholic/book-category/book-category_de";

import rawVersions from "../catholic/version.json";
import type { BookCategory, VersionGroup } from "../types";

const catholicVersions = rawVersions as unknown as VersionGroup[];

const CATHOLIC_BOOK_COUNT = 73;
const CATHOLIC_OT_COUNT = 46;
const CATHOLIC_NT_COUNT = 27;

const NT_CATEGORIES = new Set<BookCategory>([
  "Gospels", "History", "Pauline Epistles", "General Epistles", "Prophetic"
]);

const EXPECTED_CATEGORY_COUNTS: Record<BookCategory, number> = {
  "Pentateuch": 5,
  "Historical Books": 16,
  "Poetry and Wisdom": 7,
  "Major Prophets": 6,
  "Minor Prophets": 12,
  "Gospels": 4,
  "History": 1,
  "Pauline Epistles": 13,
  "General Epistles": 8,
  "Prophetic": 1,
};

type BookEntry = { id: string; name: string; size: number };
type CategoryFn = (code: string) => BookCategory;

type LanguageData = {
  lang: string;
  name: string;
  books: BookEntry[];
  getCategory: CategoryFn;
};

const languageData: LanguageData[] = [
  { lang: "pt-BR", name: "Portuguese", books: catholicBookIds_ptbr, getCategory: getCategory_ptbr },
  { lang: "es", name: "Spanish", books: catholicBookIds_es, getCategory: getCategory_es },
  { lang: "en", name: "English", books: catholicBookIds_en, getCategory: getCategory_en },
  { lang: "fr", name: "French", books: catholicBookIds_fr, getCategory: getCategory_fr },
  { lang: "it", name: "Italian", books: catholicBookIds_it, getCategory: getCategory_it },
  { lang: "la", name: "Latin", books: catholicBookIds_la, getCategory: getCategory_la },
  { lang: "de", name: "German", books: catholicBookIds_de, getCategory: getCategory_de },
];

describe("Catholic Bible - Book Count", () => {
  for (const { lang, name, books } of languageData) {
    it(`${name} (${lang}) has ${CATHOLIC_BOOK_COUNT} books`, () => {
      expect(books).toHaveLength(CATHOLIC_BOOK_COUNT);
    });
  }
});

describe("Catholic Bible - OT/NT Split", () => {
  for (const { lang, name, books, getCategory } of languageData) {
    it(`${name} (${lang}) has ${CATHOLIC_OT_COUNT} OT and ${CATHOLIC_NT_COUNT} NT books`, () => {
      const otCount = books.filter(b => !NT_CATEGORIES.has(getCategory(b.id))).length;
      const ntCount = books.filter(b => NT_CATEGORIES.has(getCategory(b.id))).length;
      expect(otCount).toBe(CATHOLIC_OT_COUNT);
      expect(ntCount).toBe(CATHOLIC_NT_COUNT);
    });
  }
});

describe("Catholic Bible - Unique Book IDs", () => {
  for (const { lang, name, books } of languageData) {
    it(`${name} (${lang}) has unique book IDs`, () => {
      const ids = books.map(b => b.id);
      expect(new Set(ids).size).toBe(ids.length);
    });
  }
});

describe("Catholic Bible - Category Coverage", () => {
  for (const { lang, name, books, getCategory } of languageData) {
    it(`${name} (${lang}) category function maps all ${books.length} books`, () => {
      for (const book of books) {
        expect(() => getCategory(book.id)).not.toThrow();
      }
    });
  }
});

describe("Catholic Bible - Category Distribution", () => {
  for (const { lang, name, books, getCategory } of languageData) {
    it(`${name} (${lang}) has correct category distribution`, () => {
      const counts = new Map<string, number>();
      for (const book of books) {
        const cat = getCategory(book.id);
        counts.set(cat, (counts.get(cat) ?? 0) + 1);
      }
      for (const [category, expected] of Object.entries(EXPECTED_CATEGORY_COUNTS)) {
        expect(counts.get(category) ?? 0).toBe(expected);
      }
    });
  }
});

describe("Catholic Bible - Chapter Sizes", () => {
  for (const { lang, name, books } of languageData) {
    it(`${name} (${lang}) all books have size > 0`, () => {
      for (const book of books) {
        expect(book.size).toBeGreaterThan(0);
      }
    });

    it(`${name} (${lang}) first book (Genesis) has 50 chapters`, () => {
      expect(books[0].size).toBe(50);
    });

    it(`${name} (${lang}) last book (Revelation/Apocalypse) has 22 chapters`, () => {
      expect(books[books.length - 1].size).toBe(22);
    });

    it(`${name} (${lang}) Psalms has 150 chapters`, () => {
      const psalms = books.find(b => b.size === 150);
      expect(psalms).toBeDefined();
      expect(psalms!.size).toBe(150);
    });
  }
});

describe("Catholic Bible - Versions", () => {
  it("all version groups have Catholic category", () => {
    for (const group of catholicVersions) {
      expect(group.category).toBe("Catholic");
    }
  });

  it("all version groups have a name and at least one language", () => {
    for (const group of catholicVersions) {
      expect(group.name).toBeTruthy();
      const langCode = Object.keys(group).find(k => k !== "name" && k !== "category");
      expect(langCode).toBeDefined();
    }
  });

  it("all versions have name and abbrev", () => {
    for (const group of catholicVersions) {
      const langCode = Object.keys(group).find(k => k !== "name" && k !== "category")!;
      const versions = group[langCode] as unknown as { name: string; abbrev: string }[];
      expect(versions.length).toBeGreaterThan(0);
      for (const v of versions) {
        expect(v.name).toBeTruthy();
        expect(v.abbrev).toBeTruthy();
      }
    }
  });

  it("all version abbrevs are unique within each language", () => {
    for (const group of catholicVersions) {
      const langCode = Object.keys(group).find(k => k !== "name" && k !== "category")!;
      const versions = group[langCode] as unknown as { abbrev: string }[];
      const abbrevs = versions.map(v => v.abbrev);
      expect(new Set(abbrevs).size).toBe(abbrevs.length);
    }
  });

  it("every bible with a pre-defined book list has 73 books (Catholic canon)", () => {
    const definedLangs = new Set(languageData.map(d => d.lang));
    for (const { books } of languageData) {
      expect(books).toHaveLength(CATHOLIC_BOOK_COUNT);
    }
    for (const group of catholicVersions) {
      const langCode = Object.keys(group).find(k => k !== "name" && k !== "category")!;
      if (definedLangs.has(langCode)) {
        const versions = group[langCode] as unknown as { name: string }[];
        expect(versions.length).toBeGreaterThan(0);
      }
    }
  });

  it("languages without pre-defined book lists are documented", () => {
    const definedLangs = new Set(languageData.map(d => d.lang));
    const allLangs = new Set<string>();
    for (const group of catholicVersions) {
      const langCode = Object.keys(group).find(k => k !== "name" && k !== "category");
      if (langCode) allLangs.add(langCode);
    }
    const missing = [...allLangs].filter(l => !definedLangs.has(l));
    const knownMissing = ["gr", "pl", "hr", "hu", "fi", "ro"];
    expect(missing.sort()).toEqual(knownMissing.sort());
  });
});

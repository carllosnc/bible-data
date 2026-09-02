import { describe, it, expect } from "bun:test";
import { readdirSync, existsSync } from "node:fs";
import { join } from "node:path";

import { catholicBookIds_ptbr } from "../catholic/books/books_ptbr";
import { catholicBookIds_es } from "../catholic/books/books_es";
import { catholicBookIds_en } from "../catholic/books/books_en";
import { catholicBookIds_fr } from "../catholic/books/books_fr";
import { catholicBookIds_it } from "../catholic/books/books_it";
import { catholicBookIds_la } from "../catholic/books/books_la";
import { catholicBookIds_de } from "../catholic/books/books_de";
import { catholicBookIds_gr } from "../catholic/books/books_gr";
import { catholicBookIds_pl } from "../catholic/books/books_pl";
import { catholicBookIds_hr } from "../catholic/books/books_hr";
import { catholicBookIds_hu } from "../catholic/books/books_hu";
import { catholicBookIds_fi } from "../catholic/books/books_fi";

// ---------------------------------------------------------------------------
// Canon reference data
// ---------------------------------------------------------------------------

const PROTESTANT_OT_COUNT = 39;
const PROTESTANT_NT_COUNT = 27;
const PROTESTANT_BOOK_COUNT = 66;
const CATHOLIC_BOOK_COUNT = 73;

// Protestant canon — 66 books with standard chapter counts.
// Uses short abbreviations from bibliaonline.com.br.
const PROTESTANT_BOOKS: [string, number][] = [
  // Old Testament (39)
  ["gn", 50], ["ex", 40], ["lv", 27], ["nm", 36], ["dt", 34],
  ["js", 24], ["jz", 21], ["rt", 4], ["1sm", 31], ["2sm", 24],
  ["1rs", 22], ["2rs", 25], ["1cr", 29], ["2cr", 36], ["ed", 10],
  ["ne", 13], ["et", 10], ["jó", 42], ["sl", 150], ["pv", 31],
  ["ec", 12], ["ct", 8], ["is", 66], ["jr", 52], ["lm", 5],
  ["ez", 48], ["dn", 12], ["os", 14], ["jl", 3], ["am", 9],
  ["ob", 1], ["jn", 4], ["mq", 7], ["na", 3], ["hc", 3],
  ["sf", 3], ["ag", 2], ["zc", 14], ["ml", 4],
  // New Testament (27)
  ["mt", 28], ["mc", 16], ["lc", 24], ["jo", 21], ["atos", 28],
  ["rm", 16], ["1co", 16], ["2co", 13], ["gl", 6], ["ef", 6],
  ["fp", 4], ["cl", 4], ["1ts", 5], ["2ts", 3], ["1tm", 6],
  ["2tm", 4], ["tt", 3], ["fm", 1], ["hb", 13], ["tg", 5],
  ["1pe", 5], ["2pe", 3], ["1jo", 5], ["2jo", 1], ["3jo", 1],
  ["jd", 1], ["ap", 22],
];

const protestantCanon = new Map(PROTESTANT_BOOKS);
const protestantOTCanon = new Map(PROTESTANT_BOOKS.slice(0, PROTESTANT_OT_COUNT));
const protestantNTCanon = new Map(PROTESTANT_BOOKS.slice(PROTESTANT_OT_COUNT));

// ---------------------------------------------------------------------------
// Catholic canon — language-specific book IDs
// ---------------------------------------------------------------------------

type BookDef = { id: string; name: string; size: number };

const catholicBookData: Record<string, BookDef[]> = {
  "pt-BR": catholicBookIds_ptbr,
  es: catholicBookIds_es,
  en: catholicBookIds_en,
  fr: catholicBookIds_fr,
  it: catholicBookIds_it,
  la: catholicBookIds_la,
  de: catholicBookIds_de,
  gr: catholicBookIds_gr,
  pl: catholicBookIds_pl,
  hr: catholicBookIds_hr,
  hu: catholicBookIds_hu,
  fi: catholicBookIds_fi,
};

function buildCatholicCanon(lang: string): Map<string, number> | null {
  const books = catholicBookData[lang];
  if (!books) return null;

  const map = new Map<string, number>();
  for (const book of books) {
    map.set(book.id, book.size);
  }
  return map;
}

// ---------------------------------------------------------------------------
// Types & helpers
// ---------------------------------------------------------------------------

type BibleBook = { abbrev: string; name: string; chapters: string[][] };
type Bible = { id: string; name: string; category: string; lang: string; books: BibleBook[] };

const OUTPUT_DIR = join(import.meta.dir, "..", "..", "output");

function findJsonFiles(dir: string): string[] {
  if (!existsSync(dir)) return [];
  const entries = readdirSync(dir, { recursive: true }) as string[];
  return entries
    .filter((f) => f.endsWith(".json"))
    .map((f) => join(dir, f.replace(/\\/g, "/")));
}

async function readBible(filePath: string): Promise<Bible> {
  return await Bun.file(filePath).json();
}

function shortPath(filePath: string): string {
  const parts = filePath.replace(/\\/g, "/").split("/output/");
  return parts.length > 1 ? parts[1] : filePath;
}

function validateAgainstCanon(bible: Bible, canon: Map<string, number>): string[] {
  const errors: string[] = [];

  if (bible.books.length === 0) {
    errors.push("bible has 0 books (empty / failed scrape)");
    return errors;
  }

  const seen = new Set<string>();

  for (const book of bible.books) {
    if (seen.has(book.abbrev)) {
      errors.push(`duplicate book abbreviation "${book.abbrev}"`);
    }
    seen.add(book.abbrev);

    const expected = canon.get(book.abbrev);
    if (expected === undefined) {
      errors.push(`book "${book.abbrev}" ("${book.name}") is not in the expected canon`);
      continue;
    }

    if (book.chapters.length !== expected) {
      errors.push(
        `book "${book.abbrev}" ("${book.name}") has ${book.chapters.length} chapters, expected ${expected}`,
      );
    }

    for (let i = 0; i < book.chapters.length; i++) {
      const ch = book.chapters[i];
      if (!ch || !Array.isArray(ch)) {
        errors.push(`book "${book.abbrev}" chapter ${i + 1} is missing or not an array`);
        continue;
      }
      if (ch.length === 0) {
        errors.push(`book "${book.abbrev}" chapter ${i + 1} has 0 verses`);
        continue;
      }
      for (let j = 0; j < ch.length; j++) {
        if (typeof ch[j] !== "string" || ch[j].trim().length === 0) {
          errors.push(`book "${book.abbrev}" chapter ${i + 1} verse ${j + 1} is empty`);
        }
      }
    }
  }

  return errors;
}

// Extract language code from file path: .../json/<lang>/bible-*.json
function langFromPath(filePath: string): string {
  const normalized = filePath.replace(/\\/g, "/");
  const match = normalized.match(/json\/([^/]+)\/bible-/);
  return match ? match[1] : "";
}

// ---------------------------------------------------------------------------
// File discovery
// ---------------------------------------------------------------------------

const protestantFiles = findJsonFiles(join(OUTPUT_DIR, "protestant", "json"));
const allCatholicFiles = findJsonFiles(join(OUTPUT_DIR, "catholic", "json"));
const septuagintFiles = allCatholicFiles.filter((f) => langFromPath(f) === "gr");
const pureCatholicFiles = allCatholicFiles.filter((f) => langFromPath(f) !== "gr");

// ---------------------------------------------------------------------------
// Tests — Protestant
// ---------------------------------------------------------------------------

describe("Protestant Bibles — Output Validation", () => {
  if (protestantFiles.length === 0) {
    it.skip("no Protestant output files found", () => {});
    return;
  }

  for (const filePath of protestantFiles) {
    const label = shortPath(filePath);

    it(`[${label}] books, chapters and verses are valid`, async () => {
      const bible = await readBible(filePath);

      // Pick the canon subset based on book count
      let canon: Map<string, number>;
      let expectedCount: number;

      if (bible.books.length === PROTESTANT_BOOK_COUNT) {
        canon = protestantCanon;
        expectedCount = PROTESTANT_BOOK_COUNT;
      } else if (bible.books.length === PROTESTANT_NT_COUNT) {
        canon = protestantNTCanon;
        expectedCount = PROTESTANT_NT_COUNT;
      } else if (bible.books.length === PROTESTANT_OT_COUNT) {
        canon = protestantOTCanon;
        expectedCount = PROTESTANT_OT_COUNT;
      } else {
        // Partial bible — validate whatever books exist against the full canon
        canon = protestantCanon;
        expectedCount = -1;
      }

      const errors = validateAgainstCanon(bible, canon);

      if (expectedCount > 0 && bible.books.length !== expectedCount) {
        errors.unshift(
          `book count ${bible.books.length} does not match expected ${expectedCount}`,
        );
      }

      expect(errors).toEqual([]);
    });
  }
});

// ---------------------------------------------------------------------------
// Tests — Catholic (excluding Septuagint)
// ---------------------------------------------------------------------------

describe("Catholic Bibles — Output Validation", () => {
  if (pureCatholicFiles.length === 0) {
    it.skip("no Catholic output files found", () => {});
    return;
  }

  for (const filePath of pureCatholicFiles) {
    const label = shortPath(filePath);
    const lang = langFromPath(filePath);
    const canon = buildCatholicCanon(lang);

    it(`[${label}] books, chapters and verses are valid`, async () => {
      const bible = await readBible(filePath);
      const errors: string[] = [];

      if (bible.books.length !== CATHOLIC_BOOK_COUNT) {
        errors.push(
          `book count ${bible.books.length} does not match expected ${CATHOLIC_BOOK_COUNT}`,
        );
      }

      if (canon) {
        errors.push(...validateAgainstCanon(bible, canon));
      } else {
        // No definition file for this language (e.g. Romanian)
        // Still check basic verse integrity
        for (const book of bible.books) {
          for (let i = 0; i < book.chapters.length; i++) {
            const ch = book.chapters[i];
            if (!ch || ch.length === 0) {
              errors.push(`book "${book.abbrev}" chapter ${i + 1} has 0 verses`);
              continue;
            }
            for (let j = 0; j < ch.length; j++) {
              if (typeof ch[j] !== "string" || ch[j].trim().length === 0) {
                errors.push(`book "${book.abbrev}" chapter ${i + 1} verse ${j + 1} is empty`);
              }
            }
          }
        }
      }

      expect(errors).toEqual([]);
    });
  }
});

// ---------------------------------------------------------------------------
// Tests — Septuagint
// ---------------------------------------------------------------------------

describe("Septuagint — Output Validation", () => {
  if (septuagintFiles.length === 0) {
    it.skip("no Septuagint output files found", () => {});
    return;
  }

  for (const filePath of septuagintFiles) {
    const label = shortPath(filePath);
    const canon = buildCatholicCanon("gr");

    it(`[${label}] books, chapters and verses are valid`, async () => {
      const bible = await readBible(filePath);
      const errors: string[] = [];

      if (bible.books.length !== CATHOLIC_BOOK_COUNT) {
        errors.push(
          `book count ${bible.books.length} does not match expected ${CATHOLIC_BOOK_COUNT}`,
        );
      }

      if (canon) {
        errors.push(...validateAgainstCanon(bible, canon));
      }

      expect(errors).toEqual([]);
    });
  }
});

// ---------------------------------------------------------------------------
// Tests — Canon reference integrity (self-check)
// ---------------------------------------------------------------------------

describe("Canon Reference Data Integrity", () => {
  it("Protestant canon has exactly 66 books", () => {
    expect(PROTESTANT_BOOKS).toHaveLength(PROTESTANT_BOOK_COUNT);
  });

  it("Protestant OT has 39 and NT has 27 books", () => {
    expect(PROTESTANT_BOOKS.slice(0, PROTESTANT_OT_COUNT)).toHaveLength(PROTESTANT_OT_COUNT);
    expect(PROTESTANT_BOOKS.slice(PROTESTANT_OT_COUNT)).toHaveLength(PROTESTANT_NT_COUNT);
  });

  it("all Protestant abbreviations are unique", () => {
    const a = PROTESTANT_BOOKS.map(([k]) => k);
    expect(new Set(a).size).toBe(a.length);
  });

  it("all Protestant chapter counts > 0", () => {
    for (const [, c] of PROTESTANT_BOOKS) expect(c).toBeGreaterThan(0);
  });

  it("Daniel: 12 (Protestant) vs 14 (Catholic)", () => {
    expect(protestantCanon.get("dn")).toBe(12);
    expect(catholicBookData["pt-BR"].find((b) => b.id === "daniel")?.size).toBe(14);
  });

  it("Malachi: 4 (Protestant) vs 3 (Catholic pt-BR)", () => {
    expect(protestantCanon.get("ml")).toBe(4);
    expect(catholicBookData["pt-BR"].find((b) => b.id === "malaquias")?.size).toBe(3);
  });

  it("Psalms: 150 in both canons", () => {
    expect(protestantCanon.get("sl")).toBe(150);
    expect(catholicBookData["pt-BR"].find((b) => b.id === "salmos")?.size).toBe(150);
  });

  it("Catholic canon includes 7 deuterocanonical books", () => {
    const deutero = ["tobias", "judite", "sabedoria", "eclesiastico", "baruc", "i-macabeus", "ii-macabeus"];
    for (const id of deutero) {
      expect(catholicBookData["pt-BR"].find((b) => b.id === id)).toBeDefined();
    }
  });

  it("all 12 Catholic language definitions have 73 books", () => {
    for (const books of Object.values(catholicBookData)) {
      expect(books).toHaveLength(CATHOLIC_BOOK_COUNT);
    }
  });

  it("all Catholic book IDs are unique within each language", () => {
    for (const books of Object.values(catholicBookData)) {
      const ids = books.map((b) => b.id);
      expect(new Set(ids).size).toBe(ids.length);
    }
  });

  it("Latin Vulgate Esther has 16 chapters (deuterocanonical additions)", () => {
    const esther = catholicBookData.la.find((b) => b.id === "liber-esther");
    expect(esther?.size).toBe(16);
  });

  it("Job=42 and Psalms=150 in all Catholic definitions", () => {
    const jobIds = ["jo", "job", "knjiga-o-jobu", "job-konyve", "ksiega-hioba", "giobbe", "liber-iob", "das-buch-ijob"];
    const psalmIds = ["salmos", "psalmit", "psalmi", "zsoltarok-konyve", "ksiega-psalmow", "liber-psalmorum", "psalms", "psaumes", "salmi", "die-psalmen"];
    for (const books of Object.values(catholicBookData)) {
      const job = books.find((b) => jobIds.includes(b.id));
      expect(job).toBeDefined();
      expect(job!.size).toBe(42);
      const psalms = books.find((b) => psalmIds.includes(b.id));
      expect(psalms).toBeDefined();
      expect(psalms!.size).toBe(150);
    }
  });
});

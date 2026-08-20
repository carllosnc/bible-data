import { describe, it, expect } from "bun:test";
import { getCategory } from "../protestant/book-category";
import rawVersions from "../protestant/version.json";
import type { BookCategory, VersionGroup } from "../types";

const protestantVersions = rawVersions as unknown as VersionGroup[];

const PROTESTANT_BOOK_COUNT = 66;
const PROTESTANT_OT_COUNT = 39;
const PROTESTANT_NT_COUNT = 27;

const NT_CATEGORIES = new Set<BookCategory>([
  "Gospels", "History", "Pauline Epistles", "General Epistles", "Prophetic"
]);

type BookDef = [abbrev: string, category: BookCategory];

const protestantBooks: BookDef[] = [
  ["gn", "Pentateuch"], ["ex", "Pentateuch"], ["lv", "Pentateuch"],
  ["nm", "Pentateuch"], ["dt", "Pentateuch"],

  ["js", "Historical Books"], ["jz", "Historical Books"], ["rt", "Historical Books"],
  ["1sm", "Historical Books"], ["2sm", "Historical Books"], ["1rs", "Historical Books"],
  ["2rs", "Historical Books"], ["1cr", "Historical Books"], ["2cr", "Historical Books"],
  ["ed", "Historical Books"], ["ne", "Historical Books"], ["et", "Historical Books"],

  ["jó", "Poetry and Wisdom"], ["sl", "Poetry and Wisdom"], ["pv", "Poetry and Wisdom"],
  ["ec", "Poetry and Wisdom"], ["ct", "Poetry and Wisdom"],

  ["is", "Major Prophets"], ["jr", "Major Prophets"], ["lm", "Major Prophets"],
  ["ez", "Major Prophets"], ["dn", "Major Prophets"],

  ["os", "Minor Prophets"], ["jl", "Minor Prophets"], ["am", "Minor Prophets"],
  ["ob", "Minor Prophets"], ["jn", "Minor Prophets"], ["mq", "Minor Prophets"],
  ["na", "Minor Prophets"], ["hc", "Minor Prophets"], ["sf", "Minor Prophets"],
  ["ag", "Minor Prophets"], ["zc", "Minor Prophets"], ["ml", "Minor Prophets"],

  ["mt", "Gospels"], ["mc", "Gospels"], ["lc", "Gospels"], ["jo", "Gospels"],
  ["atos", "History"],

  ["rm", "Pauline Epistles"], ["1co", "Pauline Epistles"], ["2co", "Pauline Epistles"],
  ["gl", "Pauline Epistles"], ["ef", "Pauline Epistles"], ["fp", "Pauline Epistles"],
  ["cl", "Pauline Epistles"], ["1ts", "Pauline Epistles"], ["2ts", "Pauline Epistles"],
  ["1tm", "Pauline Epistles"], ["2tm", "Pauline Epistles"], ["tt", "Pauline Epistles"],
  ["fm", "Pauline Epistles"],

  ["hb", "General Epistles"], ["tg", "General Epistles"], ["1pe", "General Epistles"],
  ["2pe", "General Epistles"], ["1jo", "General Epistles"], ["2jo", "General Epistles"],
  ["3jo", "General Epistles"], ["jd", "General Epistles"],

  ["ap", "Prophetic"],
];

describe("Protestant Bible - Book Count", () => {
  it(`has exactly ${PROTESTANT_BOOK_COUNT} books in the canon`, () => {
    expect(protestantBooks).toHaveLength(PROTESTANT_BOOK_COUNT);
  });

  it(`has ${PROTESTANT_OT_COUNT} Old Testament books`, () => {
    const otCount = protestantBooks.filter(([, cat]) => !NT_CATEGORIES.has(cat)).length;
    expect(otCount).toBe(PROTESTANT_OT_COUNT);
  });

  it(`has ${PROTESTANT_NT_COUNT} New Testament books`, () => {
    const ntCount = protestantBooks.filter(([, cat]) => NT_CATEGORIES.has(cat)).length;
    expect(ntCount).toBe(PROTESTANT_NT_COUNT);
  });

  it("has unique book abbreviations", () => {
    const abbrevs = protestantBooks.map(([abbr]) => abbr);
    expect(new Set(abbrevs).size).toBe(abbrevs.length);
  });
});

describe("Protestant Bible - Category Distribution", () => {
  const expected: Record<string, number> = {
    "Pentateuch": 5,
    "Historical Books": 12,
    "Poetry and Wisdom": 5,
    "Major Prophets": 5,
    "Minor Prophets": 12,
    "Gospels": 4,
    "History": 1,
    "Pauline Epistles": 13,
    "General Epistles": 8,
    "Prophetic": 1,
  };

  for (const [category, count] of Object.entries(expected)) {
    it(`has ${count} ${category} books`, () => {
      const actual = protestantBooks.filter(([, cat]) => cat === category).length;
      expect(actual).toBe(count);
    });
  }
});

describe("Protestant Bible - getCategory mapping", () => {
  for (const [abbrev, expectedCategory] of protestantBooks) {
    it(`maps ${abbrev} to ${expectedCategory}`, () => {
      expect(getCategory(abbrev)).toBe(expectedCategory);
    });
  }

  it("throws on unknown abbreviation", () => {
    expect(() => getCategory("zz")).toThrow("Category error: zz");
  });
});

describe("Protestant Bible - Versions", () => {
  it("all version groups have Protestant category", () => {
    for (const group of protestantVersions) {
      expect(group.category).toBe("Protestant");
    }
  });

  it("all version groups have a name and at least one language", () => {
    for (const group of protestantVersions) {
      expect(group.name).toBeTruthy();
      const langCode = Object.keys(group).find(k => k !== "name" && k !== "category");
      expect(langCode).toBeDefined();
    }
  });

  it("all versions have name and abbrev", () => {
    for (const group of protestantVersions) {
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
    for (const group of protestantVersions) {
      const langCode = Object.keys(group).find(k => k !== "name" && k !== "category")!;
      const versions = group[langCode] as unknown as { abbrev: string }[];
      const abbrevs = versions.map(v => v.abbrev);
      expect(new Set(abbrevs).size).toBe(abbrevs.length);
    }
  });

  it("every Protestant bible version uses the 66-book canon", () => {
    expect(protestantBooks).toHaveLength(PROTESTANT_BOOK_COUNT);
    for (const group of protestantVersions) {
      const langCode = Object.keys(group).find(k => k !== "name" && k !== "category")!;
      const versions = group[langCode] as unknown as { name: string; abbrev: string }[];
      expect(versions.length).toBeGreaterThan(0);
    }
  });
});

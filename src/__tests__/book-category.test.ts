import { describe, it, expect } from "bun:test";
import { getCategory } from "../protestant/book-category";
import { getCategory_es } from "../catholic/book-category/book-category_es";

describe("Protestant getCategory", () => {
  const allBooks = [
    ["gn", "Pentateuch"], ["ex", "Pentateuch"], ["lv", "Pentateuch"],
    ["nm", "Pentateuch"], ["dt", "Pentateuch"],

    ["js", "Historical Books"], ["jz", "Historical Books"],
    ["rt", "Historical Books"], ["1sm", "Historical Books"],
    ["2sm", "Historical Books"], ["1rs", "Historical Books"],
    ["2rs", "Historical Books"], ["1cr", "Historical Books"],
    ["2cr", "Historical Books"], ["ed", "Historical Books"],
    ["ne", "Historical Books"], ["et", "Historical Books"],

    ["jó", "Poetry and Wisdom"], ["sl", "Poetry and Wisdom"],
    ["pv", "Poetry and Wisdom"], ["ec", "Poetry and Wisdom"],
    ["ct", "Poetry and Wisdom"],

    ["is", "Major Prophets"], ["jr", "Major Prophets"],
    ["lm", "Major Prophets"], ["ez", "Major Prophets"],
    ["dn", "Major Prophets"],

    ["os", "Minor Prophets"], ["jl", "Minor Prophets"],
    ["am", "Minor Prophets"], ["ob", "Minor Prophets"],
    ["jn", "Minor Prophets"], ["mq", "Minor Prophets"],
    ["na", "Minor Prophets"], ["hc", "Minor Prophets"],
    ["sf", "Minor Prophets"], ["ag", "Minor Prophets"],
    ["zc", "Minor Prophets"], ["ml", "Minor Prophets"],

    ["mt", "Gospels"], ["mc", "Gospels"],
    ["lc", "Gospels"], ["jo", "Gospels"],

    ["atos", "History"],

    ["rm", "Pauline Epistles"], ["1co", "Pauline Epistles"],
    ["2co", "Pauline Epistles"], ["gl", "Pauline Epistles"],
    ["ef", "Pauline Epistles"], ["fp", "Pauline Epistles"],
    ["cl", "Pauline Epistles"], ["1ts", "Pauline Epistles"],
    ["2ts", "Pauline Epistles"], ["1tm", "Pauline Epistles"],
    ["2tm", "Pauline Epistles"], ["tt", "Pauline Epistles"],
    ["fm", "Pauline Epistles"],

    ["hb", "General Epistles"], ["tg", "General Epistles"],
    ["1pe", "General Epistles"], ["2pe", "General Epistles"],
    ["1jo", "General Epistles"], ["2jo", "General Epistles"],
    ["3jo", "General Epistles"], ["jd", "General Epistles"],

    ["ap", "Prophetic"],
  ] as const;

  for (const [abbrev, expectedCategory] of allBooks) {
    it(`maps ${abbrev} to ${expectedCategory}`, () => {
      expect(getCategory(abbrev)).toBe(expectedCategory);
    });
  }

  it("throws on unknown abbreviation", () => {
    expect(() => getCategory("zz")).toThrow("Category error: zz");
  });
});

describe("Spanish Catholic getCategory_es", () => {
  it("maps nahun to Minor Prophets", () => {
    expect(getCategory_es("nahun")).toBe("Minor Prophets");
  });

  it("maps genesis to Pentateuch", () => {
    expect(getCategory_es("genesis")).toBe("Pentateuch");
  });

  it("maps apocalipsis to Prophetic", () => {
    expect(getCategory_es("apocalipsis")).toBe("Prophetic");
  });

  it("throws on unknown code", () => {
    expect(() => getCategory_es("xx")).toThrow();
  });
});

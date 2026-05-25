import type { Bible, BookCategory } from "../types";
import { describe, it, expect, beforeAll, afterAll } from "bun:test";
import { rmSync, existsSync } from "node:fs";
import { mkdir } from "node:fs/promises";

const TEST_CATEGORY: "Protestant" = "Protestant";
const TEST_LANG = "en";
const TEST_ID = "test-bible";
const TEST_DIR = `output/${TEST_CATEGORY.toLowerCase()}/sqlite/${TEST_LANG}/`;
const TEST_OUTPUT = `${TEST_DIR}bible-${TEST_ID}.sqlite`;

beforeAll(async () => {
  if (existsSync(TEST_DIR)) {
    rmSync(TEST_DIR, { recursive: true, force: true });
  }
  await mkdir(TEST_DIR, { recursive: true });
});

afterAll(() => {
  try { rmSync(TEST_DIR, { recursive: true, force: true }); } catch {}
});

describe("saveAsSqlite", () => {
  it("creates SQLite with correct schema", async () => {
    const { saveAsSqlite } = await import("../sqlite-action");
    const { Database } = await import("bun:sqlite");

    const bible = {
      id: TEST_ID,
      name: "Test Bible",
      category: TEST_CATEGORY,
      lang: TEST_LANG,
      books: [
        {
          name: "Genesis",
          link: "/test/gn",
          category: "Pentateuch" as BookCategory,
          abbrev: "gn",
          testament: 0,
          chapters: [["In the beginning...", "And the earth was..."]],
        },
      ],
    } satisfies Bible;

    await saveAsSqlite(bible);

    const db = new Database(TEST_OUTPUT);
    const tables = db
      .query("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name")
      .all() as { name: string }[];
    const tableNames = tables.map((t) => t.name);

    expect(tableNames).toContain("info");
    expect(tableNames).toContain("books");
    expect(tableNames).toContain("verses");

    const info = db.query("SELECT * FROM info").all() as {
      id: string;
      name: string;
      lang: string;
      category: string;
    }[];
    expect(info).toHaveLength(1);
    expect(info[0].id).toBe(TEST_ID);

    const books = db.query("SELECT * FROM books").all() as {
      name: string;
      abbrev: string;
    }[];
    expect(books).toHaveLength(1);
    expect(books[0].abbrev).toBe("gn");

    const verses = db.query("SELECT * FROM verses").all() as {
      content: string;
      book_abbrev: string;
    }[];
    expect(verses).toHaveLength(2);
    expect(verses[0].content).toBe("In the beginning...");

    db.close();
  });
});

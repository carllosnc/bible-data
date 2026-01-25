# Bible Data

[![bible-data](https://github.com/carllosnc/bible-data/actions/workflows/node.js.yml/badge.svg)](https://github.com/carllosnc/bible-data/actions/workflows/node.js.yml)

> Extract content from [Biblia online](https://www.bibliaonline.com.br) and transform to Json, Gzip and Sqlite.

## Getting Started

To install dependencies:

```bash
bun install
```

To run the scraper:

```bash
bun run src/main.ts
```

## Output Formats

### JSON format

```json
{
  "id": "string",
  "name": "string",
  "category": "string",
  "lang": "string",
  "books": [
    {
      "name": "string",
      "link": "string",
      "category": "string",
      "abbrev": "string",
      "testament": "number",
      "chapters": [
        [
          "string" // verses
        ]
      ]
    }
  ]
}
```

### SQLite schema

```sql
CREATE TABLE IF NOT EXISTS info (
  id TEXT NOT NULL,
  name TEXT NOT NULL,
  lang TEXT NOT NULL,
  category TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS books (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  link TEXT NOT NULL,
  category TEXT NOT NULL,
  abbrev TEXT NOT NULL,
  testament INTEGER NOT NULL CHECK (testament IN (0, 1)),
  UNIQUE(abbrev)
);

CREATE TABLE IF NOT EXISTS verses (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  content TEXT NOT NULL,
  book_abbrev TEXT NOT NULL,
  book_name TEXT NOT NULL,
  chapter_number INTEGER NOT NULL,
  verse_number INTEGER NOT NULL,
  FOREIGN KEY (book_abbrev) REFERENCES books(abbrev)
);
```

## What's inside

- [Bun](https://bun.sh)
- [TypeScript](https://www.typescriptlang.org)
- [Cheerio](https://cheerio.js.org)

---

Carlos Costa @ 2025

# Bible Data Scraper

![License](https://img.shields.io/github/license/carllosnc/bible-data)
[![Status](https://github.com/carllosnc/bible-data/actions/workflows/node.js.yml/badge.svg)](https://github.com/carllosnc/bible-data/actions/workflows/node.js.yml)

A high-performance Bible scraper written in **TypeScript** using **Bun**. This tool extracts Bible content from [Biblia Online](https://www.bibliaonline.com.br), transforming it into multiple useful formats for developers.

## Features

- **Fast Extraction**: Powered by Bun and Cheerio.
- **Multiple Output Formats**:
  - **JSON**: Hierarchical structure (Book > Chapter > Verse).
  - **Gzip**: Compressed JSON for efficient storage/transport.
  - **SQLite**: Relational database ready for querying.
- **Smart Categorization**: Automatically categorizes books (Pentateuch, Gospels, etc.).

## Prerequisites

- [Bun](https://bun.sh) (v1.0 or later)

## Getting Started

1. **Install dependencies:**

   ```bash
   bun install
   ```

2. **Run the scraper:**

   ```bash
   bun run src/main.ts
   ```

   The data will be saved in the `output/` directory.

## Configuration

To download a different Bible version, modify the `main` function in `src/main.ts`:

```typescript
await saveBible({
  id: 'your-version-id', // e.g., 'nvi', 'acf', 'kjv'
  name: 'your-version-name',
  lang: 'en', // or 'pt-BR', etc.
  category: 'Protestant', // or 'Catholic'
  books: []
}, getBible)
```

The `id` must match the version identifier used in the URL on [Biblia Online](https://www.bibliaonline.com.br) (e.g., `https://www.bibliaonline.com.br/acf` -> id is `acf`).

## Output Formats

### JSON Structure

```json
{
  "id": "acv",
  "name": "A Conservative Version",
  "category": "Protestant",
  "lang": "en",
  "books": [
    {
      "name": "Genesis",
      "link": ".../gn",
      "category": "Pentateuch",
      "abbrev": "gn",
      "testament": 0, // 0 = Old, 1 = New
      "chapters": [
        [
          "In the beginning...", // Verse 1
          "And the earth was..." // Verse 2
        ]
      ]
    }
  ]
}
```

### SQLite Schema

The generated SQLite database (`output/sqlite/<lang>/bible-<name>.sqlite`) includes the following schema:

```sql
CREATE TABLE info (
  id TEXT NOT NULL,
  name TEXT NOT NULL,
  lang TEXT NOT NULL,
  category TEXT NOT NULL
);

CREATE TABLE books (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  link TEXT NOT NULL,
  category TEXT NOT NULL,
  abbrev TEXT NOT NULL UNIQUE,
  testament INTEGER NOT NULL CHECK (testament IN (0, 1))
);

CREATE TABLE verses (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  content TEXT NOT NULL,
  book_abbrev TEXT NOT NULL,
  book_name TEXT NOT NULL,
  chapter_number INTEGER NOT NULL,
  verse_number INTEGER NOT NULL,
  FOREIGN KEY (book_abbrev) REFERENCES books(abbrev)
);
```

## Tech Stack

- **Runtime**: [Bun](https://bun.sh)
- **Language**: [TypeScript](https://www.typescriptlang.org)
- **Scraping**: [Cheerio](https://cheerio.js.org)
- **Database**: [bun:sqlite](https://bun.sh/docs/api/sqlite)

---

Developed by [Carlos Costa](https://github.com/carllosnc)

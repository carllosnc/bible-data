# Bible Data Scraper

[![Status](https://github.com/carllosnc/bible-data/actions/workflows/node.js.yml/badge.svg)](https://github.com/carllosnc/bible-data/actions/workflows/node.js.yml)

A high-performance Bible scraper written in **TypeScript** using **Bun**. This tool extracts Bible content from:
- [Biblia Online](https://www.bibliaonline.com.br) (Protestant versions)
- [Bíblia Católica](https://www.bibliacatolica.com.br) (Catholic versions)

It transforms the data into multiple useful formats for developers.

## Features

- **Fast Extraction**: Powered by Bun and Cheerio.
- **Support for Multiple Sources**: Dedicated scrapers for Protestant and Catholic bibles.
- **Interactive CLI**: Easy version selection via command-line prompts.
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

2. **Interactive Mode:**

   Run the main CLI to select a category and download a specific bible version:

   ```bash
   bun start
   # Or run in watch mode for development:
   bun run dev
   ```

   Follow the prompts to select Protestant/Catholic, Language, and Version.

3. **Bulk Download:**
   
   To download ALL available bibles at once:

   ```bash
   # Download all Protestant bibles
   bun run download:protestant

   # Download all Catholic bibles
   bun run download:catholic
   
   # Download ALL bibles
   bun run download:all
   ```

   The data will be saved in the `output/<category>/` directory (e.g., `output/protestant/` or `output/catholic/`).

## Output Formats

The output is organized by category (protestant/catholic), format (json/gzip/sqlite), and language.

### JSON Structure

File path: `output/<category>/json/<lang>/bible-<id>.json`

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

File path: `output/<category>/sqlite/<lang>/bible-<id>.sqlite`

The generated SQLite database includes the following schema:

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
- **CLI**: [Inquirer](https://github.com/SBoudrias/Inquirer.js)

---

Developed by [Carlos Costa](https://github.com/carllosnc)

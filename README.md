# Bible Data Scraper

[![Status](https://github.com/carllosnc/bible-data/actions/workflows/node.js.yml/badge.svg)](https://github.com/carllosnc/bible-data/actions/workflows/node.js.yml)

A high-performance Bible scraper written in **TypeScript** using **Bun**. This tool extracts Bible content from:
- [Biblia Online](https://www.bibliaonline.com.br) (Protestant versions)
- [BibleGateway](https://www.biblegateway.com) (Catholic versions)

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
- **Python 3.10+** with `curl_cffi` and `nodriver` (only required by the Catholic
  source, which sits behind a Cloudflare managed challenge — see
  [Cloudflare Bypass](#cloudflare-bypass-catholic-source) below)

## Getting Started

1. **Install dependencies:**

   ```bash
   bun install
   pip install -r scripts/requirements.txt
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
  category TEXT NOT NULL,
  PRIMARY KEY (id, lang)
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
  FOREIGN KEY (book_abbrev) REFERENCES books(abbrev),
  UNIQUE(book_abbrev, chapter_number, verse_number)
);
```

## Cloudflare Bypass (Catholic Source)

The Catholic source (`bibliacatolica.com.br`) is behind a Cloudflare managed
challenge ("Just a moment..."). Bun's `fetch` and plain `curl` get HTTP 403, so
the Catholic scraper delegates fetching to a small Python helper that bypasses
the challenge using a hybrid strategy:

1. **Solve once** — [`nodriver`](https://github.com/ultrafunkamsterdam/nodriver)
   (an undetected Chrome) loads the site, lets the challenge auto-resolve, and
   captures the `cf_clearance` cookie plus a real (non-headless) Chrome
   User-Agent. The `HeadlessChrome` token in the default headless UA is what
   Cloudflare flags on replay, so the helper overrides it at launch.
2. **Serve fast** — [`curl_cffi`](https://github.com/lexiforest/curl_cffi)
   performs every subsequent request impersonating Chrome's TLS/HTTP2 fingerprint
   and reusing the cached cookie/UA. This is roughly as fast as a normal HTTP
   request, so scraping thousands of chapters stays practical.
3. **Auto-refresh** — if a request comes back 403 (cookie expired, ~1h), the
   helper re-solves the challenge and retries automatically.

The cookie cache lives in `scripts/.cf-cache.json` (gitignored).

### Setup

```bash
pip install -r scripts/requirements.txt   # curl_cffi + nodriver
```

A Chromium-based browser must be installed (Chrome, Edge, Brave, ...). `nodriver`
locates it automatically.

### Configuration

The TypeScript wrapper (`src/cf-fetch.ts`) launches Python with sensible
defaults. Override them via environment variables if needed:

| Variable       | Default (Windows) | Default (other) | Purpose                                      |
|----------------|-------------------|-----------------|----------------------------------------------|
| `PYTHON_BIN`   | `py`              | `python3`       | Python executable to invoke                  |
| `PYTHON_ARGS`  | `-3.12`           | *(none)*        | Extra args passed to the Python interpreter  |

For example, if `py` is unavailable, point directly at a Python 3.12 binary:

```bash
$env:PYTHON_BIN = "C:\Path\To\python.exe"
$env:PYTHON_ARGS = ""
```

The Protestant source (`bibliaonline.com.br`) is not Cloudflare-protected and
keeps using the original Bun `fetch` path.

---



The following sources have been verified for scraping viability. Each provides free, public-domain translations of apocryphal, gnostic, and pseudepigraphal texts in HTML format.

### 1. Early Christian Writings — `earlychristianwritings.com`

**Status:** Viable

The most complete collection of pre-Nicene Christian texts. Organized into categories: New Testament, Apocrypha, Gnostics, Church Fathers.

- **Coverage:** ~60 texts including Gospel of Thomas, Gospel of Mary, Gospel of Peter, Gospel of Judas, Apocryphon of John, Gospel of Philip, Didache, Shepherd of Hermas, Acts of Paul and Thecla, Apocalypse of Peter, Pistis Sophia, and more.
- **Language:** English
- **Structure:**
  - Index pages (`/apocrypha.html`, `/gnostics.html`) list all texts with links.
  - Info pages (`/<text>.html`) contain metadata (dating, genre) and links to translations under `<h2>Text</h2>`.
  - Text pages (`/text/<text>.html`) contain the actual content with chapters (`#### Chapter N`) and numbered verses (`N) text...`).
- **Scraping notes:** Simple HTML, no JavaScript rendering required. No anti-bot protection observed. Each text page is self-contained.

### 2. Sacred Texts Archive — `sacred-texts.com`

**Status:** Viable

A large archive of public-domain religious and esoteric texts. Two relevant sections:

- **Apocrypha** (`/chr/apo/`): Book of Enoch (108 chapters, one HTML page per chapter), Book of Jubilees, Forgotten Books of Eden (Testaments of the Twelve Patriarchs, Books of Adam and Eve, Psalms of Solomon), Lost Books of the Bible, Biblical Antiquities of Philo, Didache, Sibylline Oracles.
- **Gnosticism** (`/gno/`): Pistis Sophia, Gospel of Thomas (114 sayings with numbered format), Gospel of Mary excerpts, Corpus Hermeticum, Hymn of Jesus.
- **Language:** English
- **Structure:**
  - Index pages list chapters as individual links (`boe004.htm`, `boe005.htm`, etc.).
  - Each chapter is a separate HTML page with verse-numbered paragraphs (e.g., `1. The words of the blessing...`).
  - Gospel of Thomas uses `N)  Jesus said, "..."` format for sayings.
- **Scraping notes:** Clean HTML, no anti-bot protection. Multi-page texts require iterating chapter links from the index.

### 3. Wikisource — `wikisource.org`

**Status:** Viable (with caveats)

Wikimedia's free-content library with community-verified transcriptions of public-domain texts.

- **Coverage:** The Apocryphal New Testament (1924) by M.R. James — a comprehensive collection including Protevangelium of James, Infancy Gospel of Thomas, Gospel of Peter, Gospel of Nicodemus (Acts of Pilate), Acts of John, Acts of Paul, Acts of Peter, Acts of Andrew, Acts of Thomas, Epistle to the Laodiceans, Apocalypse of Peter, Apocalypse of Paul, and more. Available in multiple languages (English, Portuguese, Spanish, French).
- **Language:** Multilingual
- **Structure:**
  - Works are organized hierarchically: `The Apocryphal New Testament (1924)/Infancy Gospels/The Book of James`.
  - Each text is a separate wiki page with chapter headings and paragraphs.
  - MediaWiki API (`/w/api.php`) provides structured JSON access to page content.
- **Scraping notes:** Use the MediaWiki API for reliable access. Some texts are marked as "incomplete". Page naming conventions vary — search via API recommended.

### Comparison

| Source | Texts | Language | Anti-bot | Structure | Best for |
|--------|-------|----------|----------|-----------|----------|
| Early Christian Writings | ~60 | English | None | Info page → Text page | Gnostic texts, Nag Hammadi |
| Sacred Texts | ~30+ | English | None | Index → Chapter pages | Book of Enoch, OT pseudepigrapha |
| Wikisource | ~20+ | Multi | None (API) | Wiki pages / API | M.R. James collection, multilingual |

---

Developed by [Carlos Costa](https://github.com/carllosnc)

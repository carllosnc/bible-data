# Bible Data

>Extract content from [Biblia online](https://www.bibliaonline.com.br) and transform to Json and gzip and Sqlite.

### Json format
```js
{
  lang: string,
  books: {
    [
      {
        name: string,
        link: string,
        abbrev: string,
        testament: number
        chapters: string[][];
      }
    ]
  }
}
```

### SQLite schema
```sql
CREATE TABLE IF NOT EXISTS language (
  lang_code TEXT PRIMARY KEY
);

CREATE TABLE IF NOT EXISTS books (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  link TEXT NOT NULL,
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

---

Carlos Costa @ 2025

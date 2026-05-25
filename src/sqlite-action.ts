import { Database } from "bun:sqlite"
import { mkdir } from "node:fs/promises"
import type { Bible } from './types'

export async function saveAsSqlite(bible: Bible): Promise<void> {
  const category = bible.category.toLowerCase();
  const outputDir = `output/${category}/sqlite/${bible.lang}/`
  await mkdir(outputDir, {recursive: true})

  const db = new Database(`${outputDir}bible-${bible.id}.sqlite`)

  // Create tables
  db.exec(`
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
  `)

  // Insert bible info using parameterized query
  const insertInfoStmt = db.prepare(`
    INSERT INTO info (id, name, lang, category)
    VALUES (?, ?, ?, ?);
  `)
  insertInfoStmt.run(bible.id, bible.name, bible.lang, bible.category)

  // Prepare statements for better performance
  const insertBookStmt = db.prepare(`
    INSERT INTO books (name, link, abbrev, testament, category)
    VALUES (?, ?, ?, ?, ?);
  `)

  const insertVerseStmt = db.prepare(`
    INSERT INTO verses (content, book_abbrev, book_name, chapter_number, verse_number)
    VALUES (?, ?, ?, ?, ?);
  `)

  // Insert books
  db.exec('BEGIN TRANSACTION;')
  for (const book of bible.books) {
    insertBookStmt.run(book.name, book.link, book.abbrev, book.testament, book.category)
  }
  db.exec('COMMIT;')

  // Insert verses
  db.exec('BEGIN TRANSACTION;')

  for (const book of bible.books) {
    for (let chapterIndex = 0; chapterIndex < book.chapters.length; chapterIndex++) {
      const chapter = book.chapters[chapterIndex]
      const chapterNumber = chapterIndex + 1

      for (let verseIndex = 0; verseIndex < chapter.length; verseIndex++) {
        const verse = chapter[verseIndex]
        const verseNumber = verseIndex + 1

        insertVerseStmt.run(verse, book.abbrev, book.name, chapterNumber, verseNumber)
      }
    }
  }

  db.exec('COMMIT;')
  db.close()
}

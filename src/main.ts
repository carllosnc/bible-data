import { Database } from "bun:sqlite"
import { mkdir } from "node:fs/promises"
import type { Bible } from './types'
import { getBible } from './providers/protestant'

async function saveAsSqlite(bible: Bible): Promise<void> {
  const outputDir = `output/sqlite/${bible.lang}/`
  await mkdir(outputDir, {recursive: true})

  const db = new Database(`${outputDir}bible-${bible.name}.sqlite`)

  // Create tables in a transaction
  db.exec(`
    BEGIN TRANSACTION;

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

    INSERT INTO info (id, name, lang, category)
    VALUES ("${bible.id}", "${bible.name}", "${bible.lang}", "${bible.category}");

    COMMIT;
  `)

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

async function saveBible(bible: Bible, action: (bible: Bible) => Promise<Bible>): Promise<void> {
  try {
    console.log(`Starting to save Bible: ${bible.name} (${bible.name})`)

    const bibleResult = await action(bible)

    // Create output directories
    await mkdir(`output/json/${bible.lang}/`, {recursive: true})
    await mkdir(`output/gzip/${bible.lang}/`, {recursive: true})

    // Save as JSON
    console.log('Saving as JSON...')
    const fileJson = Bun.file(`output/json/${bible.lang}/bible-${bible.name}.json`)
    await fileJson.write(JSON.stringify(bibleResult))

    // Save as gzipped JSON
    console.log('Saving as gzipped JSON...')
    const fileGz = Bun.file(`output/gzip/${bible.lang}/bible-${bible.name}.gz`)
    await fileGz.write(Bun.gzipSync(JSON.stringify(bibleResult)))

    // Save as SQLite
    console.log('Saving as SQLite...')
    await saveAsSqlite(bibleResult)

    console.log(`Bible ${bible.name} (${bible.lang}) saved successfully.`)
  } catch (error) {
    console.error(`Failed to save Bible ${bible.name}:`, error)
  }
}

// Run the scraper
async function main() {
  // await saveBible({
  //   id: 'bkj',
  //   name: 'king-james',
  //   lang: 'pt-BR',
  //   category: 'Protestant',
  //   books: []
  // }, getBible)

  await saveBible({
    id: 'acv',
    name: 'A Conservative Version',
    lang: 'en',
    category: 'Protestant',
    books: []
  }, getBible)
}

main().catch(console.error)

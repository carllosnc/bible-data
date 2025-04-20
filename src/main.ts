import { fetch } from 'bun'
import * as cheerio from 'cheerio'
import { Database } from "bun:sqlite"
import { mkdir } from "node:fs/promises"
import type { Bible, Book } from './types'

const BASE_URL = 'https://www.bibliaonline.com.br'

async function fetchContent(url: string): Promise<cheerio.CheerioAPI> {
  try {
    const response = await fetch(url)
    const data = await response.text()
    return cheerio.load(data)
  } catch (error) {
    console.error(`Failed to fetch ${url}:`, error)
    throw error
  }
}

async function getBookLinks(bibleId: string): Promise<Book[]> {
  const $ = await fetchContent(`${BASE_URL}/${bibleId}`)
  const books = $('div.page_grid__uDXdO a')

  return books.toArray().map((item, index) => {
    const bookName = $(item).contents().first().text()
    const bookLink = $(item).attr('href')!
    const abbrev = bookLink.split('/').pop()!

    return {
      name: bookName,
      link: bookLink,
      abbrev: abbrev,
      testament: index <= 38 ? 0 : 1,
      chapters: []
    }
  })
}

async function getChapterContent(chapterUrl: string): Promise<string[]> {
  const $ = await fetchContent(chapterUrl)
  const verses: string[] = []

  $('span.t').each((_, item) => {
    verses.push($(item).text())
  })

  return verses
}

async function getBookChapters(bookUrl: string): Promise<string[][]> {
  const $ = await fetchContent(bookUrl)
  const chapLinks = $('ul.page_chapters__rtw7B a').toArray()
  const chapters: string[][] = []

  for (const item of chapLinks) {
    const chapterLink = $(item).attr('href')!
    const chapter = await getChapterContent(chapterLink)
    chapters.push(chapter)
  }

  return chapters
}

async function getBible(bibleId: string, bibleLang: string): Promise<Bible> {
  console.log(`Starting to scrape Bible: ${bibleId} (${bibleLang})`)

  const books = await getBookLinks(bibleId)
  const bible: Bible = { lang: bibleLang, books }

  for (const book of bible.books) {
    console.log(`Processing book: ${book.name}`)
    book.chapters = await getBookChapters(book.link)
  }

  return bible
}

async function saveAsSqlite(bible: Bible, bibleName: string): Promise<void> {
  const outputDir = `output/sqlite/${bible.lang}/`
  await mkdir(outputDir, {recursive: true})

  const db = new Database(`${outputDir}bible-${bibleName}.sqlite`)

  // Create tables in a transaction
  db.exec(`
    BEGIN TRANSACTION;

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

    INSERT INTO language (lang_code) VALUES ("${bible.lang}");

    COMMIT;
  `)

  // Prepare statements for better performance
  const insertBookStmt = db.prepare(`
    INSERT INTO books (name, link, abbrev, testament) VALUES (?, ?, ?, ?);
  `)

  const insertVerseStmt = db.prepare(`
    INSERT INTO verses (content, book_abbrev, book_name, chapter_number, verse_number)
    VALUES (?, ?, ?, ?, ?);
  `)

  // Insert books
  db.exec('BEGIN TRANSACTION;')
  for (const book of bible.books) {
    insertBookStmt.run(book.name, book.link, book.abbrev, book.testament)
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

async function saveBible(bibleId: string, bibleName: string, bibleLang: string): Promise<void> {
  try {
    console.log(`Starting to save Bible: ${bibleName} (${bibleLang})`)

    const bible = await getBible(bibleId, bibleLang)

    // Create output directories
    await mkdir(`output/json/${bibleLang}/`, {recursive: true})
    await mkdir(`output/gzip/${bibleLang}/`, {recursive: true})

    // Save as JSON
    console.log('Saving as JSON...')
    const fileJson = Bun.file(`output/json/${bibleLang}/bible-${bibleName}.json`)
    await fileJson.write(JSON.stringify(bible))

    // Save as gzipped JSON
    console.log('Saving as gzipped JSON...')
    const fileGz = Bun.file(`output/gzip/${bibleLang}/bible-${bibleName}.json.gz`)
    await fileGz.write(Bun.gzipSync(JSON.stringify(bible)))

    // Save as SQLite
    console.log('Saving as SQLite...')
    await saveAsSqlite(bible, bibleName)

    console.log(`Bible ${bibleName} (${bibleLang}) saved successfully.`)
  } catch (error) {
    console.error(`Failed to save Bible ${bibleName}:`, error)
  }
}

// Run the scraper
async function main() {
  await saveBible('bkj', 'king-james', 'pt-BR')
  // Uncomment to scrape additional Bibles
  // await saveBible('vc', 'versao-catolica', 'pt-BR')
}

main().catch(console.error)
import { fetch } from 'bun'
import * as cheerio from 'cheerio'
import type { Bible } from './types'
import { Database } from "bun:sqlite"
import { mkdir } from "node:fs/promises"

async function get_bible(bibleId: string, bibleLang: string){
  const base_url: string = 'https://www.bibliaonline.com.br'
  const bible: Bible = {
    lang: bibleLang,
    books: []
  }

  async function get_links_of_books(bibleId: string){
    const response = await fetch(`${base_url}/${bibleId}`)
    const data = await response.text()

    const $ = cheerio.load(data)

    const books = $('div.page_grid__uDXdO a')

    for await (const item of books.toArray()) {
      const bookName = $(item).contents().first().text()
      const bookLink = $(item).attr('href')
      const abbrev = bookLink!.split('/').pop()!
      const index = books.toArray().indexOf(item)

      bible.books.push({
        name: bookName,
        link: bookLink!,
        abbrev: abbrev,
        testament: index <= 38 ? 0 : 1,
        chapters: []
      })

      console.log("✅", bookName, "-", bibleId, bibleLang)

      await get_cap_links(bookLink!, abbrev)
    }
  }

  async function get_cap_links(bookUrl: string, abbrev: string){
    const response = await fetch(bookUrl)
    const data = await response.text()

    const $ = cheerio.load(data)

    const caps = $('ul.page_chapters__rtw7B a')

    for await (const item of caps.toArray()) {
      const chapterLink = $(item).attr('href')
      await get_chapters(chapterLink!, abbrev)
    }
  }

  async function get_chapters(chapterUrl: string, abbrev: string){
    const response = await fetch(chapterUrl)
    const data = await response.text()
    const chapter: string[] = []

    const $ = cheerio.load(data)

    const verses = $('span.t')

    verses.each((i, item) => {
      const verse = $(item).text()
      chapter.push(verse)
    })

    bible.books.find(book => book.abbrev === abbrev)!.chapters.push(chapter)
  }

  await get_links_of_books(bibleId)

  return bible
}

async function save_as_sqlite(bible: Bible, bibleName: string){
  await mkdir(`output/sqlite/${bible.lang}/`, {recursive: true})
  const db = new Database(`output/sqlite/${bible.lang}/bible-${bibleName}.sqlite`)

  db.exec(`
    CREATE TABLE IF NOT EXISTS language (
      lang_code TEXT PRIMARY KEY
    );
  `)

  db.exec(`
    CREATE TABLE IF NOT EXISTS books (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      link TEXT NOT NULL,
      abbrev TEXT NOT NULL,
      testament INTEGER NOT NULL CHECK (testament IN (0, 1)),
      UNIQUE(abbrev)
    );
  `)

  db.exec(`
    CREATE TABLE IF NOT EXISTS verses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      content TEXT NOT NULL,
      book_abbrev INTEGER NOT NULL,
      book_name TEXT NOT NULL,
      chapter_number INTEGER NOT NULL,
      verse_number INTEGER NOT NULL,
      FOREIGN KEY (book_abbrev) REFERENCES books(abbrev)
    );
  `)

  db.exec(`
    INSERT INTO language (lang_code) VALUES ("${bible.lang}");
  `)

  for (const book of bible.books) {
    db.exec(`
      INSERT INTO books (name, link, abbrev, testament)
      VALUES ("${book.name}", "${book.link}", "${book.abbrev}", ${book.testament});
    `)
  }

  for (const book of bible.books) {
    for (const chapter of book.chapters) {
      for (const verse of chapter) {
        db.exec(`
          INSERT INTO verses (content, book_abbrev, book_name, chapter_number, verse_number)
          VALUES (?, ?, ?, ?, ?);
        `, [`${verse}`, `${book.abbrev}`, `${book.name}`, `${book.chapters.indexOf(chapter) + 1}`, `${chapter.indexOf(verse) + 1}`])
      }
    }
  }

  db.close()
}

async function save_bible(bibleId: string, bibleName: string, bibleLang: string){
  let bible = await get_bible(bibleId, bibleLang)

  //json
  let file_json = Bun.file(`output/json/${bibleLang}/bible-${bibleName}.json`)
  await file_json.write(JSON.stringify(bible))

  //gzip
  let file_gz = Bun.file(`output/gzip/${bibleLang}/bible-${bibleName}.json.gz`)
  await file_gz.write(Bun.gzipSync(JSON.stringify(bible)))

  //sqlite
  await save_as_sqlite(bible, bibleName)
}

await save_bible('bkj', 'king-james', 'pt-BR')
// await save_bible('vc', 'versao-catolica', 'pt-BR')

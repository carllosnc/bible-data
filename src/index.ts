import { fetch } from 'bun'
import * as cheerio from 'cheerio'
import type { Bible } from './types'

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
      const abbrev = bookLink!.slice(-2)

      bible.books.push({
        name: bookName,
        link: bookLink!,
        abbrev: abbrev,
        testament: 1,
        chapters: []
      })

      console.log("✅", bookName)

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

    const $ = cheerio.load(data)

    const verses = $('span.t')

    verses.each((i, item) => {
      const verse = $(item).text()
      bible.books.find(book => book.abbrev === abbrev)!.chapters.push(verse)
    })
  }

  await get_links_of_books(bibleId)

  return bible
}

async function save_bible(bibleId: string, bibleName: string, bibleLang: string){
  let bible = await get_bible(bibleId, bibleLang)

  //json
  let file_json = Bun.file(`output/json/${bibleLang}/bible-${bibleName}.json`)
  await file_json.write(JSON.stringify(bible))

  //gzip
  let file_gz = Bun.file(`output/gzip/${bibleLang}/bible-${bibleName}.json.gz`)
  await file_gz.write(Bun.gzipSync(JSON.stringify(bible)))

  console.log("\nDone\n!")
}

await save_bible('bkj', 'king-james', 'pt-BR')
await save_bible('vc', 'versao-catolica', 'pt-BR')

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

      await getCapLinks(bookLink!, abbrev)
    }
  }

  async function getCapLinks(bookUrl: string, abbrev: string){
    const response = await fetch(bookUrl)
    const data = await response.text()

    const $ = cheerio.load(data)

    const caps = $('ul.page_chapters__rtw7B a')

    for await (const item of caps.toArray()) {
      const chapterLink = $(item).attr('href')
      await getChapters(chapterLink!, abbrev)
    }
  }

  async function getChapters(chapterUrl: string, abbrev: string){
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

async function saveAsJson(bibleId: string, bibleName: string, bibleLang: string){
  let bible = await get_bible(bibleId, bibleLang)

  let file = Bun.file(`output/json/${bibleLang}/bible-${bibleName}.json`)
  await file.write(JSON.stringify(bible))
  console.log("\nDone!")
}

// saveAsJson('bkj', 'king-james', 'pt-BR')
// saveAsJson('vc', 'versao-catolica', 'pt-BR')

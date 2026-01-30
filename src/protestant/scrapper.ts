import type { Bible, Book } from '../types'
import { getCategory } from './utils'
import { loadingEnd, loadingStart } from '../loading'
import { fetchContent } from '../fetch-content'

const BASE_URL = 'https://www.bibliaonline.com.br'

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
      category: getCategory(abbrev),
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

export async function getBible(bible: Bible): Promise<Bible> {
  console.log(`Starting to scrape Bible: ${bible.id} (${bible.lang})`)

  const books = await getBookLinks(bible.id)

  for (const book of books) {
    let timer = loadingStart(`Processing: ${book.name}`)
    book.chapters = await getBookChapters(book.link)
    loadingEnd(timer, "")
    console.log(`${book.name}`)
  }

  bible.books = books

  return bible
}

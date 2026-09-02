import type { Bible, Book } from '../types'
import { getCategory } from './book-category'
import { loadingEnd, loadingStart } from '../loading'
import { fetchContent } from '../fetch-content'
import { getProtestantBookName } from './books'

const BASE_URL = 'https://www.bibliaonline.com.br'

async function getBookLinks(bibleId: string, lang?: string): Promise<Book[]> {
  const $ = await fetchContent(`${BASE_URL}/${bibleId}/livros`)
  const links = $(`main ul li a[href^="/${bibleId}/"]`).toArray()
  const books: Book[] = []
  const seen = new Set<string>()

  for (const item of links) {
    const bookLink = $(item).attr('href')!
    const parts = bookLink.split('/').filter(Boolean)
    if (parts.length !== 2) continue
    if (seen.has(bookLink)) continue
    seen.add(bookLink)

    const abbrev = parts[1]
    let bookName = $(item).text().trim()

    if (lang) {
      const nativeName = getProtestantBookName(lang, abbrev)
      if (nativeName) {
        bookName = nativeName
      }
    }

    books.push({
      name: bookName,
      link: bookLink,
      category: getCategory(abbrev),
      abbrev: abbrev,
      testament: books.length <= 38 ? 0 : 1,
      chapters: []
    })
  }

  return books
}

async function getChapterContent(chapterUrl: string): Promise<string[]> {
  const $ = await fetchContent(chapterUrl)
  const verseMap = new Map<string, string>()
  const order: string[] = []

  $('main p[data-v]').each((_, p) => {
    $(p).children('span[data-v]').each((_, span) => {
      const $span = $(span)
      if ($span.attr('data-vn') !== undefined || $span.attr('data-vb') !== undefined) return

      const key = $span.attr('data-v')!
      if (!verseMap.has(key)) {
        verseMap.set(key, '')
        order.push(key)
      }
      verseMap.set(key, verseMap.get(key)! + $span.text())
    })
  })

  const verses: string[] = []
  for (const key of order) {
    const text = verseMap.get(key)!.trim()
    if (text) verses.push(text)
  }

  return verses
}

async function getBookChapters(bookUrl: string): Promise<{ nativeName?: string; chapters: string[][] }> {
  const $ = await fetchContent(`${BASE_URL}${bookUrl}`)
  const h1 = $('h1').text().trim()
  const nativeName = h1 && !h1.includes('Página não encontrada') ? h1 : undefined

  const chapLinks = $(`main a[href^="${bookUrl}/"]`).toArray()
  const chapters: string[][] = []

  for (const item of chapLinks) {
    const chapterLink = $(item).attr('href')!
    const parts = chapterLink.split('/').filter(Boolean)
    if (parts.length !== 3) continue
    if (!/^\d+$/.test(parts[2])) continue

    const chapter = await getChapterContent(`${BASE_URL}${chapterLink}`)
    chapters.push(chapter)
  }

  return { nativeName, chapters }
}

export async function getBible(bible: Bible): Promise<Bible> {
  console.log(`Starting to scrape Bible: ${bible.id} (${bible.lang})`)

  const books = await getBookLinks(bible.id, bible.lang)

  for (const book of books) {
    let timer = loadingStart(`Processing: ${book.name}`)
    const { nativeName, chapters } = await getBookChapters(book.link)
    if (nativeName) {
      book.name = nativeName
    }
    book.chapters = chapters
    loadingEnd(timer, "")
    console.log(`${book.name}`)
  }

  bible.books = books

  return bible
}

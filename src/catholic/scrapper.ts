import type { Bible, Book, BookCategory } from '../types'
import { loadingEnd, loadingStart } from '../loading'
import { cfFetchContent as fetchContent } from '../cf-fetch'

import { catholicBookIds_ptbr } from './books/books_ptbr'
import { catholicBookIds_es } from './books/books_es'
import { catholicBookIds_en } from './books/books_en'
import { catholicBookIds_fr } from './books/books_fr'
import { catholicBookIds_it } from './books/books_it'
import { catholicBookIds_la } from './books/books_la'
import { catholicBookIds_de } from './books/books_de'
import { catholicBookIds_gr } from './books/books_gr'
import { catholicBookIds_pl } from './books/books_pl'
import { catholicBookIds_hr } from './books/books_hr'
import { catholicBookIds_hu } from './books/books_hu'
import { catholicBookIds_fi } from './books/books_fi'

import { getCategory_ptbr } from './book-category/book-category_ptbr'
import { getCategory_es } from './book-category/book-category_es'
import { getCategory_en } from './book-category/book-category_en'
import { getCategory_fr } from './book-category/book-category_fr'
import { getCategory_it } from './book-category/book-category_it'
import { getCategory_la } from './book-category/book-category_la'
import { getCategory_de } from './book-category/book-category_de'

const BASE_URL = 'https://www.bibliacatolica.com.br'

const NT_CATEGORIES = new Set<BookCategory>([
  'Gospels', 'History', 'Pauline Epistles', 'General Epistles', 'Prophetic'
])

type BookDef = { id: string; name: string; size: number }
type CategoryFn = (code: string) => BookCategory

const bookLists: Record<string, BookDef[]> = {
  'pt-BR': catholicBookIds_ptbr,
  'es': catholicBookIds_es,
  'en': catholicBookIds_en,
  'fr': catholicBookIds_fr,
  'it': catholicBookIds_it,
  'la': catholicBookIds_la,
  'de': catholicBookIds_de,
  'gr': catholicBookIds_gr,
  'pl': catholicBookIds_pl,
  'hr': catholicBookIds_hr,
  'hu': catholicBookIds_hu,
  'fi': catholicBookIds_fi,
}

const categoryFns: Record<string, CategoryFn> = {
  'pt-BR': getCategory_ptbr,
  'es': getCategory_es,
  'en': getCategory_en,
  'fr': getCategory_fr,
  'it': getCategory_it,
  'la': getCategory_la,
  'de': getCategory_de,
}

function getCategoryByPosition(index: number): BookCategory {
  if (index <= 4) return "Pentateuch"
  if (index <= 20) return "Historical Books"
  if (index <= 27) return "Poetry and Wisdom"
  if (index <= 33) return "Major Prophets"
  if (index <= 45) return "Minor Prophets"
  if (index <= 49) return "Gospels"
  if (index === 50) return "History"
  if (index <= 63) return "Pauline Epistles"
  if (index <= 71) return "General Epistles"
  return "Prophetic"
}

async function getBookLinks(bibleId: string): Promise<{ id: string; name: string }[]> {
  const $ = await fetchContent(`${BASE_URL}/${bibleId}/`)
  const links = $(`a[href*="/${bibleId}/"]`).toArray()
  const books: { id: string; name: string }[] = []
  const seen = new Set<string>()

  for (const item of links) {
    const href = $(item).attr('href')!
    const url = new URL(href, BASE_URL)
    const parts = url.pathname.split('/').filter(Boolean)
    if (parts.length < 2 || parts[0] !== bibleId) continue
    const bookId = parts[1]
    if (/^\d+$/.test(bookId)) continue
    if (seen.has(bookId)) continue
    seen.add(bookId)

    const name = $(item).text().trim()
    if (name) {
      books.push({ id: bookId, name })
    }
  }

  return books
}

async function getChapterCount(bibleId: string, bookId: string): Promise<number> {
  const $ = await fetchContent(`${BASE_URL}/${bibleId}/${bookId}/`)
  const links = $(`a[href*="/${bibleId}/${bookId}/"]`).toArray()
  let maxChapter = 0

  for (const item of links) {
    const href = $(item).attr('href')!
    const url = new URL(href, BASE_URL)
    const parts = url.pathname.split('/').filter(Boolean)
    if (parts.length === 3 && parts[0] === bibleId && parts[1] === bookId && /^\d+$/.test(parts[2])) {
      const num = parseInt(parts[2], 10)
      if (num > maxChapter) maxChapter = num
    }
  }

  return maxChapter
}

async function getChapterVerses(url: string): Promise<{ verses: string[]; h1: string }> {
  const $ = await fetchContent(url)
  const verses: string[] = []

  $('section.entry p').each((_, item) => {
    const el = $(item)
    el.find('strong').remove()
    const text = el.text().trim()
    if (text) verses.push(text)
  })

  const h1 = $('h1').text().trim()
  return { verses, h1 }
}

async function scrapeBook(
  bibleId: string,
  bookId: string,
  bookName: string,
  chapterCount: number,
  category: BookCategory,
  testament: number
): Promise<Book> {
  const bookTimer = loadingStart(`Processing: ${bookName}`)
  const chapters: string[][] = []
  let nativeName: string | undefined

  for (let c = 1; c <= chapterCount; c++) {
    const url = `${BASE_URL}/${bibleId}/${bookId}/${c}/`
    try {
      const { verses, h1 } = await getChapterVerses(url)
      if (verses.length > 0) {
        chapters.push(verses)
      } else {
        console.warn(`Warning: No verses found for ${bookName} chapter ${c}`)
      }
      if (c === 1 && h1 && !h1.includes('Página não encontrada')) {
        nativeName = h1.replace(/,\s*\d+$/, '').trim()
      }
    } catch (e) {
      console.error(`Error fetching ${bookName} ${c}:`, e)
    }
  }

  const finalName = nativeName || bookName

  loadingEnd(bookTimer, "")
  console.log(`${finalName} (${chapters.length} chapters)`)

  return {
    name: finalName,
    link: `${BASE_URL}/${bibleId}/${bookId}/`,
    category,
    abbrev: bookId,
    testament,
    chapters
  }
}

export async function getBible(bible: Bible): Promise<Bible> {
  console.log(`Starting to scrape Bible: ${bible.id} (${bible.lang})`)

  const bookList = bookLists[bible.lang]
  const books: Book[] = []

  if (bookList) {
    const categoryFn = categoryFns[bible.lang] ?? ((code: string) => {
      const index = bookList.findIndex(b => b.id === code)
      return getCategoryByPosition(index >= 0 ? index : 0)
    })
    console.log(`Using pre-defined book list for ${bible.lang} (${bookList.length} books)`)

    for (const bookDef of bookList) {
      const category = categoryFn(bookDef.id)
      const testament = NT_CATEGORIES.has(category) ? 1 : 0
      books.push(await scrapeBook(
        bible.id, bookDef.id, bookDef.name, bookDef.size, category, testament
      ))
    }
  } else {
    console.log(`No pre-defined book list for ${bible.lang}, scraping from site...`)

    const bookLinks = await getBookLinks(bible.id)
    console.log(`Found ${bookLinks.length} books`)

    for (const [index, bookDef] of bookLinks.entries()) {
      const category = getCategoryByPosition(index)
      const testament = NT_CATEGORIES.has(category) ? 1 : 0
      const chapterCount = await getChapterCount(bible.id, bookDef.id)
      books.push(await scrapeBook(
        bible.id, bookDef.id, bookDef.name, chapterCount, category, testament
      ))
    }
  }

  bible.books = books
  return bible
}

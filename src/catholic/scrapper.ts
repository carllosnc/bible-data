import type { Bible, Book, BookCategory } from '../types'
import { loadingEnd, loadingStart } from '../loading'
import { fetchContent } from '../fetch-content'

const BASE_URL = 'https://www.bibliacatolica.com.br'

function getCategoryByPosition(index: number): BookCategory {
  if (index <= 4) return "Pentateuch"
  if (index <= 20) return "Historical Books"
  if (index <= 27) return "Poetry and Wisdom"
  if (index <= 33) return "Major Prophets"
  if (index <= 45) return "Minor Prophets"
  if (index <= 49) return "Gospels"
  if (index === 50) return "History"
  if (index <= 64) return "Pauline Epistles"
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
    const parts = href.replace(`/${bibleId}/`, '').split('/').filter(Boolean)
    if (parts.length !== 1) continue
    if (/^\d+$/.test(parts[0])) continue
    if (seen.has(parts[0])) continue
    seen.add(parts[0])

    const name = $(item).text().trim()
    if (name) {
      books.push({ id: parts[0], name })
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
    const parts = href.replace(`/${bibleId}/${bookId}/`, '').split('/').filter(Boolean)
    if (parts.length === 1 && /^\d+$/.test(parts[0])) {
      const num = parseInt(parts[0], 10)
      if (num > maxChapter) maxChapter = num
    }
  }

  return maxChapter
}

async function getChapterVerses(url: string): Promise<string[]> {
  const $ = await fetchContent(url)
  const verses: string[] = []

  $('section.entry p').each((_, item) => {
    const el = $(item)
    el.find('strong').remove()
    const text = el.text().trim()
    if (text) verses.push(text)
  })

  return verses
}

export async function getBible(bible: Bible): Promise<Bible> {
  console.log(`Starting to scrape Bible: ${bible.id} (${bible.lang})`)

  const bookLinks = await getBookLinks(bible.id)
  console.log(`Found ${bookLinks.length} books`)

  const books: Book[] = []

  for (const [index, bookDef] of bookLinks.entries()) {
    const bookTimer = loadingStart(`Processing: ${bookDef.name}`)
    const chapters: string[][] = []

    const chapterCount = await getChapterCount(bible.id, bookDef.id)

    for (let c = 1; c <= chapterCount; c++) {
      const url = `${BASE_URL}/${bible.id}/${bookDef.id}/${c}/`
      try {
        const verses = await getChapterVerses(url)
        if (verses.length > 0) {
          chapters.push(verses)
        } else {
          console.warn(`Warning: No verses found for ${bookDef.name} chapter ${c}`)
        }
      } catch (e) {
        console.error(`Error fetching ${bookDef.name} ${c}:`, e)
      }
    }

    loadingEnd(bookTimer, "")
    console.log(`${bookDef.name} (${chapters.length} chapters)`)

    books.push({
      name: bookDef.name,
      link: `${BASE_URL}/${bible.id}/${bookDef.id}/`,
      category: getCategoryByPosition(index),
      abbrev: bookDef.id,
      testament: index <= 45 ? 0 : 1,
      chapters
    })
  }

  bible.books = books
  return bible
}

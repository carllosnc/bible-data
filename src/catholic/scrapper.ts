import type { Bible, Book } from '../types'
import { getCategory } from './book-category'
import { loadingEnd, loadingStart } from '../loading'
import { fetchContent } from '../fetch-content'
import { catholicBookIds } from './books'

const BASE_URL = 'https://www.bibliacatolica.com.br'

export async function getBible(bible: Bible): Promise<Bible> {
  console.log(`Starting to scrape Bible: ${bible.id} (${bible.lang})`)

  const books: Book[] = []

  for (const [index, bookDef] of catholicBookIds.entries()) {
    const bookTimer = loadingStart(`Processing ${bookDef.name}`)
    const chapters: string[][] = []
    let bookProperName = bookDef.name

    for (let c = 1; c <= bookDef.size; c++) {
        const url = `${BASE_URL}/${bible.id}/${bookDef.id}/${c}/`
        try {
            const $ = await fetchContent(url)

            const verses: string[] = []
            const section = $('section.entry')

            section.find('p').each((_, item) => {
                const el = $(item)
                el.find('strong').remove()

                let text = el.text().trim()

                if (text) {
                    verses.push(text)
                }
            })

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
    console.log(bookDef.name)

    books.push({
      name: bookProperName, // capitalized proper name
      link: `${BASE_URL}/${bible.id}/${bookDef.id}/`,
      category: getCategory(bookDef.id),
      abbrev: bookDef.id,
      testament: index <= 45 ? 0 : 1, // 0-45 (46 books) is OT in Catholic canon
      chapters: chapters
    })
  }

  bible.books = books
  return bible
}
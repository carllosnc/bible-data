import type { Bible, Book } from '../types'
import { getCategory } from './book-category'
import { loadingEnd, loadingStart } from '../loading'
import { fetchContent } from '../fetch-content'
import { catholicBookIds } from './books'
import version from './version.json'

const BASE_URL = 'https://www.bibliacatolica.com.br'

export async function getBible(bible: Bible): Promise<Bible> {
  console.log(`Starting to scrape Bible: ${bible.id} (${bible.lang})`)

  const books: Book[] = []

  // Iterate over the books defined in our list
  for (const [index, bookDef] of catholicBookIds.entries()) {
    const bookTimer = loadingStart(`Processing ${bookDef.name}`)
    const chapters: string[][] = []
    let bookProperName = bookDef.name // Default to slug

    // Iterate chapters 1 to size
    for (let c = 1; c <= bookDef.size; c++) {
        const url = `${BASE_URL}/${bible.id}/${bookDef.name}/${c}/`
        try {
            const $ = await fetchContent(url)

            // Try to grab a better book name from the first chapter page
            if (c === 1) {
                // Usually there's an h1 like "Gênesis, 1"
                const title = $('h1').text().trim()
                if (title) {
                    // Split by comma or number to get just the name
                    // simplistic approach: "Gênesis, 1" -> "Gênesis"
                    bookProperName = title.split(',')[0].trim()
                    if (!bookProperName) bookProperName = bookDef.name
                }
            }

            const verses: string[] = []
            const section = $('section.entry')

            section.find('p').each((_, item) => {
                const el = $(item)
                // Remove the verse number which is inside <strong>
                el.find('strong').remove()

                // Clean up text
                let text = el.text().trim()

                // Sometimes text might be empty or just whitespace
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
    // console.log(`${bookProperName}: ${chapters.length} chapters`)

    books.push({
      name: bookProperName, // capitalized proper name
      link: `${BASE_URL}/${bible.id}/${bookDef.name}/`,
      category: getCategory(bookDef.name),
      abbrev: bookDef.name,
      testament: index <= 45 ? 0 : 1, // 0-45 (46 books) is OT in Catholic canon
      chapters: chapters
    })
  }

  bible.books = books
  return bible
}
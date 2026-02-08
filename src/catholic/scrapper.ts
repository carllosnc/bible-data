import type { Bible, Book } from '../types'
import { getCategory_ptbr } from './book-category/book-category_ptbr'
import { getCategory_en } from './book-category/book-category_en'
import { getCategory_es } from './book-category/book-category_es'
import { getCategory_fr } from './book-category/book-category_fr'
import { getCategory_it } from './book-category/book-category_it'
import { loadingEnd, loadingStart } from '../loading'
import { fetchContent } from '../fetch-content'
import { catholicBookIds_ptbr } from './books/books_ptbr'
import { catholicBookIds_en } from './books/books_en'
import { catholicBookIds_es } from './books/books_es'
import { catholicBookIds_fr } from './books/books_fr'
import { catholicBookIds_it } from './books/books_it'

const BASE_URL = 'https://www.bibliacatolica.com.br'

export async function getBible(bible: Bible): Promise<Bible> {
  console.log(`Starting to scrape Bible: ${bible.id} (${bible.lang})`)

  const books: Book[] = []

  let bookIds = catholicBookIds_ptbr
  let getCategory = getCategory_ptbr

  if (bible.lang === 'en') {
    bookIds = catholicBookIds_en
    getCategory = getCategory_en
  } else if (bible.lang === 'es') {
    bookIds = catholicBookIds_es
    getCategory = getCategory_es
  } else if (bible.lang === 'fr') {
    bookIds = catholicBookIds_fr
    getCategory = getCategory_fr
  } else if (bible.lang === 'it') {
    bookIds = catholicBookIds_it
    getCategory = getCategory_it
  }

  for (const [index, bookDef] of bookIds.entries()) {
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
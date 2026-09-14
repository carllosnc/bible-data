import type { Bible, Book } from '../types'
import { saveBible } from '../save'
import { getSource, parsePages, SOURCE } from './scrapper'

const BOOK_ABBREV = 'mar'

function buildBook(pages: string[][], lang: 'en' | 'pt-BR'): Book {
  return {
    name: lang === 'pt-BR' ? 'O Evangelho de Maria' : 'The Gospel of Mary',
    link: SOURCE.url,
    category: 'Gospels',
    abbrev: BOOK_ABBREV,
    testament: 0,
    chapters: pages,
  }
}

function buildBible(pages: string[][], lang: 'en' | 'pt-BR'): Bible {
  return {
    id: 'mary',
    name: lang === 'pt-BR' ? 'O Evangelho de Maria' : 'The Gospel of Mary',
    category: 'Apocryphal',
    lang,
    books: [buildBook(pages, lang)],
  }
}

async function main(): Promise<void> {
  const force = process.argv.includes('--force')

  console.log('Downloading English source (gospels.net)...')
  const htmlEn = await getSource('en', force)

  console.log('Parsing English pages...')
  const pagesEn = parsePages(htmlEn)
  console.log(`Found ${pagesEn.length} pages (EN)`)

  const enChapters: string[][] = []
  for (const page of pagesEn) {
    enChapters.push([...page.paragraphs])
  }

  console.log('Loading Portuguese translation...')
  const htmlPt = await getSource('pt', force)

  console.log('Parsing Portuguese pages...')
  const pagesPt = parsePages(htmlPt)
  console.log(`Found ${pagesPt.length} pages (PT)`)

  const ptChapters: string[][] = []
  for (const page of pagesPt) {
    ptChapters.push([...page.paragraphs])
  }

  const enBible = buildBible(enChapters, 'en')
  const ptBible = buildBible(ptChapters, 'pt-BR')

  await saveBible(enBible, async (b) => b)
  await saveBible(ptBible, async (b) => b)

  console.log('Done.')
}

await main()

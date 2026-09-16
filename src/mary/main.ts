import type { Bible, Book } from '../types'
import { saveBible } from '../save'
import { getSource, parsePages, SOURCE } from './scrapper'

const BOOK_ABBREV = 'mar'

function buildBook(pages: string[][], lang: 'en' | 'pt-BR', notes?: string[][]): Book {
  return {
    name: lang === 'pt-BR' ? 'O Evangelho de Maria' : 'The Gospel of Mary',
    link: SOURCE.url,
    category: 'Gospels',
    abbrev: BOOK_ABBREV,
    testament: 0,
    chapters: pages,
    notes,
  }
}

function buildBible(pages: string[][], lang: 'en' | 'pt-BR', notes?: string[][]): Bible {
  return {
    id: 'mary',
    name: lang === 'pt-BR' ? 'O Evangelho de Maria' : 'The Gospel of Mary',
    category: 'Apocryphal',
    lang,
    books: [buildBook(pages, lang, notes)],
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
  const enNotes: string[][] = []
  for (const page of pagesEn) {
    enChapters.push([...page.paragraphs])
    enNotes.push([...page.notes])
  }

  console.log('Loading Portuguese translation...')
  const htmlPt = await getSource('pt', force)

  console.log('Parsing Portuguese pages...')
  const pagesPt = parsePages(htmlPt)
  console.log(`Found ${pagesPt.length} pages (PT)`)

  const ptChapters: string[][] = []
  const ptNotes: string[][] = []
  for (const page of pagesPt) {
    ptChapters.push([...page.paragraphs])
    ptNotes.push([...page.notes])
  }

  const enBible = buildBible(enChapters, 'en', enNotes)
  const ptBible = buildBible(ptChapters, 'pt-BR', ptNotes)

  await saveBible(enBible, async (b) => b)
  await saveBible(ptBible, async (b) => b)

  console.log('Done.')
}

await main()

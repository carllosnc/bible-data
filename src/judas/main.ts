import type { Bible, Book } from '../types'
import { saveBible } from '../save'
import { getSource, parseSections, SOURCE } from './scrapper'

const BOOK_ABBREV = 'jud'
const CANONICAL_PAGES = 26

function buildBook(chapters: string[][], lang: 'en' | 'pt-BR', notes?: string[][]): Book {
  return {
    name: lang === 'pt-BR' ? 'O Evangelho de Judas' : 'The Gospel of Judas',
    link: SOURCE.url,
    category: 'Gospels',
    abbrev: BOOK_ABBREV,
    testament: 0,
    chapters,
    notes,
  }
}

function buildBible(chapters: string[][], lang: 'en' | 'pt-BR', notes?: string[][]): Bible {
  return {
    id: 'judas',
    name: lang === 'pt-BR' ? 'O Evangelho de Judas' : 'The Gospel of Judas',
    category: 'Apocryphal',
    lang,
    books: [buildBook(chapters, lang, notes)],
  }
}

async function main(): Promise<void> {
  const force = process.argv.includes('--force')

  console.log('Downloading source (gospels.net)...')
  const html = await getSource(force)

  console.log('Parsing English sections...')
  const sections = parseSections(html)
  console.log(`Found ${sections.length} sections (pages 33-${33 + sections.length - 1})`)

  const enChapters: string[][] = []
  const enNotes: string[][] = []
  for (const section of sections) {
    enChapters.push([...section.paragraphs])
    enNotes.push([...section.notes])
  }

  console.log('Loading Portuguese translation...')
  const ptPages: Record<string, string[]> = await Bun.file('output/apocryphal/judas/raw/pages-pt.json').json()
  const ptChapters: string[][] = []
  const ptNotes: string[][] = []
  for (let page = 33; page <= 58; page++) {
    ptChapters.push(ptPages[String(page)] || [])
    ptNotes.push([])
  }

  if (enChapters.length < CANONICAL_PAGES) {
    console.warn(`Warning: expected ${CANONICAL_PAGES} pages, got ${enChapters.length}`)
  }

  const enBible = buildBible(enChapters, 'en', enNotes)
  const ptBible = buildBible(ptChapters, 'pt-BR', ptNotes)

  await saveBible(enBible, async (b) => b)
  await saveBible(ptBible, async (b) => b)

  console.log('Done.')
}

await main()

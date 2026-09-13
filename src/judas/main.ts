import type { Bible, Book } from '../types'
import { saveBible } from '../save'
import { getSource, parseSections, SOURCE } from './scrapper'

const BOOK_ABBREV = 'jud'
const CANONICAL_PAGES = 26

function buildBook(chapters: string[][], lang: 'en' | 'pt-BR'): Book {
  return {
    name: lang === 'pt-BR' ? 'O Evangelho de Judas' : 'The Gospel of Judas',
    link: SOURCE.url,
    category: 'Gospels',
    abbrev: BOOK_ABBREV,
    testament: 0,
    chapters,
  }
}

function buildBible(chapters: string[][], lang: 'en' | 'pt-BR'): Bible {
  return {
    id: 'judas',
    name: lang === 'pt-BR' ? 'O Evangelho de Judas' : 'The Gospel of Judas',
    category: 'Apocryphal',
    lang,
    books: [buildBook(chapters, lang)],
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
  for (const section of sections) {
    enChapters.push([...section.paragraphs])
  }

  console.log('Loading Portuguese translation...')
  const ptPages: Record<string, string[]> = await Bun.file('output/apocryphal/judas/raw/pages-pt.json').json()
  const ptChapters: string[][] = []
  for (let page = 33; page <= 58; page++) {
    ptChapters.push(ptPages[String(page)] || [])
  }

  if (enChapters.length < CANONICAL_PAGES) {
    console.warn(`Warning: expected ${CANONICAL_PAGES} pages, got ${enChapters.length}`)
  }

  const enBible = buildBible(enChapters, 'en')
  const ptBible = buildBible(ptChapters, 'pt-BR')

  await saveBible(enBible, async (b) => b)
  await saveBible(ptBible, async (b) => b)

  console.log('Done.')
}

await main()

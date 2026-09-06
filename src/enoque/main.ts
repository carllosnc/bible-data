import type { Bible, Book } from '../types'
import { saveBible } from '../save'
import { getSource, parseVerses, SOURCES } from './scrapper'
import {
  alignSequences,
  buildScoreMatrix,
  groupAlignment,
  refineAlignment,
  redistributeAttachments,
} from './align'
import type { Lang, RawVerse } from './types'

const BOOK_ABBREV = 'enq'
const CANONICAL_CHAPTERS = 108

function groupByChapter(verses: RawVerse[]): Map<number, RawVerse[]> {
  const chapters = new Map<number, RawVerse[]>()
  let lastCh = 0
  for (const verse of verses) {
    if (!chapters.has(verse.ch)) {
      chapters.set(verse.ch, [])
    }
    chapters.get(verse.ch)!.push(verse)
    if (verse.ch < lastCh) {
      console.warn(`Warning: chapter order regression at ${verse.ch}:${verse.vs}`)
    }
    lastCh = verse.ch
  }
  return chapters
}

function buildBook(lang: Lang, name: string, chapters: string[][]): Book {
  return {
    name,
    link: SOURCES[lang].url,
    category: 'Prophetic',
    abbrev: BOOK_ABBREV,
    testament: 0,
    chapters,
  }
}

function buildBible(lang: Lang, name: string, bookName: string, chapters: string[][]): Bible {
  return {
    id: 'enoque',
    name,
    category: 'Apocryphal',
    lang: lang === 'pt' ? 'pt-BR' : 'en',
    books: [buildBook(lang, bookName, chapters)],
  }
}

async function main(): Promise<void> {
  const force = process.argv.includes('--force')

  console.log('Downloading sources (faithofgod.net)...')
  const [ptHtml, enHtml] = await Promise.all([getSource('pt', force), getSource('en', force)])

  const ptVerses = parseVerses(ptHtml)
  const enVerses = parseVerses(enHtml)
  console.log(`PT: ${ptVerses.length} verses | EN: ${enVerses.length} verses`)

  const ptChapters = groupByChapter(ptVerses)
  const missing = Array.from({ length: CANONICAL_CHAPTERS }, (_, i) => i + 1).filter(
    (ch) => !ptChapters.has(ch),
  )
  if (missing.length) {
    throw new Error(`PT source missing chapters: ${missing.join(', ')}`)
  }

  console.log('Aligning PT/EN to the canonical chapter grid...')
  const S = buildScoreMatrix(ptVerses, enVerses)
  const ops = alignSequences(ptVerses, enVerses, S)
  const initial = groupAlignment(ptVerses, enVerses, ops, S)
  const refined = refineAlignment(enVerses, initial.ptToEn, initial.orphanEn, S)
  const ptToEn = redistributeAttachments(ptVerses.length, refined.ptToEn, S, enVerses.length)

  const enByPtIndex = new Map<number, string>()
  ptVerses.forEach((_verse, i) => {
    const enIdxs = ptToEn[i] ?? []
    if (enIdxs.length) {
      enByPtIndex.set(i, enIdxs.map((k) => enVerses[k].text).join(' '))
    }
  })

  const ptChaptersGrid: string[][] = []
  const enChaptersGrid: string[][] = []
  const ptIndexByChapter = new Map<number, number[]>()
  let cursor = 0
  for (const verse of ptVerses) {
    const list = ptIndexByChapter.get(verse.ch) ?? []
    list.push(cursor++)
    ptIndexByChapter.set(verse.ch, list)
  }

  for (let ch = 1; ch <= CANONICAL_CHAPTERS; ch++) {
    const indices = ptIndexByChapter.get(ch)!
    ptChaptersGrid.push(indices.map((i) => ptVerses[i].text))
    enChaptersGrid.push(indices.map((i) => enByPtIndex.get(i) ?? ''))
  }

  const matched = [...enByPtIndex.keys()].length
  console.log(`EN coverage: ${matched}/${ptVerses.length} verses`)

  const ptBible = buildBible('pt', 'O Livro de Enoque', 'Enoque', ptChaptersGrid)
  const enBible = buildBible('en', 'The Book of Enoch', 'Enoch', enChaptersGrid)

  await saveBible(ptBible, async () => ptBible)
  await saveBible(enBible, async () => enBible)

  console.log('Done.')
}

await main()

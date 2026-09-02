import { describe, it, expect } from 'bun:test'
import { Database } from 'bun:sqlite'
import { existsSync } from 'node:fs'
import type { ParallelEnoch, ParallelVerse } from '../enoque/types'
import { getSource, parseVerses } from '../enoque/scrapper'

const DATA_DIR = 'output/enoque'
const RAW_AVAILABLE =
  existsSync(`${DATA_DIR}/raw/1ENOQUE.html`) && existsSync(`${DATA_DIR}/raw/1ENOCH.html`)
const DATA_AVAILABLE = existsSync(`${DATA_DIR}/json/enoque.paralela.json`)

const data = DATA_AVAILABLE
  ? (JSON.parse(await Bun.file(`${DATA_DIR}/json/enoque.paralela.json`).text()) as ParallelEnoch)
  : null

function allVerses(enoch: ParallelEnoch): Array<ParallelVerse & { chapter: number }> {
  const verses: Array<ParallelVerse & { chapter: number }> = []
  for (const section of enoch.sections) {
    for (const chapter of section.chapters) {
      for (const verse of chapter.verses) {
        verses.push({ ...verse, chapter: chapter.number })
      }
    }
  }
  return verses
}

function findVerse(enoch: ParallelEnoch, refPt: string): ParallelVerse | undefined {
  return allVerses(enoch).find((v) => v.ref.pt === refPt)
}

describe.skipIf(!RAW_AVAILABLE)('enoque scrapper', () => {
  it('parseia as duas fontes com os totais esperados', async () => {
    const ptHtml = await getSource('pt')
    const enHtml = await getSource('en')
    const ptVerses = parseVerses(ptHtml)
    const enVerses = parseVerses(enHtml)
    expect(ptVerses.length).toBe(1059)
    expect(enVerses.length).toBe(1179)
  })

  it('a fonte PT contem os 108 capitulos', async () => {
    const ptVerses = parseVerses(await getSource('pt'))
    const chapters = new Set(ptVerses.map((v) => v.ch))
    for (let ch = 1; ch <= 108; ch++) {
      expect(chapters.has(ch)).toBe(true)
    }
  })
})

describe.skipIf(!DATA_AVAILABLE)('enoque dataset', () => {
  it('tem 5 secoes com os limites canonicos corretos', () => {
    expect(data!.meta.structure.sections).toHaveLength(5)
    expect(data!.meta.structure.canonicalChapters).toBe(108)

    const ranges = data!.meta.structure.sections.map((s) => s.chapterRange)
    expect(ranges).toEqual([
      [1, 36],
      [37, 71],
      [72, 82],
      [83, 90],
      [91, 108],
    ])
  })

  it('contem 108 capitulos e 1059 versiculos PT', () => {
    const verses = allVerses(data!)
    expect(verses.length).toBe(1059)

    const chapters = new Set(verses.map((v) => v.chapter))
    expect(chapters.size).toBe(108)
    for (let ch = 1; ch <= 108; ch++) {
      expect(chapters.has(ch)).toBe(true)
    }
  })

  it('todo versiculo tem texto PT e numeracao sequencial por capitulo', () => {
    const byChapter = new Map<number, ParallelVerse[]>()
    for (const v of allVerses(data!)) {
      const list = byChapter.get(v.chapter) ?? []
      list.push(v)
      byChapter.set(v.chapter, list)
    }
    for (const [, verses] of byChapter) {
      verses.forEach((v, idx) => {
        expect(v.number).toBe(idx + 1)
        expect(v.pt).toBeTruthy()
        expect(v.ref.pt).toMatch(/^\d{1,3}:\d{1,3}$/)
      })
    }
  })

  it('cobertura do alinhamento PT-EN >= 85%', () => {
    const verses = allVerses(data!)
    const matched = verses.filter((v) => v.en).length
    expect(matched / verses.length).toBeGreaterThanOrEqual(0.85)
  })

  it('alinhamentos criticos conhecidos', () => {
    expect(findVerse(data!, '1:1')?.ref.en).toBe('1:1')
    expect(findVerse(data!, '89:1')?.ref.en).toBe('88:1')
    expect(findVerse(data!, '104:1')?.ref.en).toBe('104:1')
    expect(findVerse(data!, '106:1')?.ref.en).toBe('105:1')
    expect(findVerse(data!, '106:2')?.ref.en).toBe('105:2')
    expect(findVerse(data!, '108:15')?.ref.en).toBe('105:27')
  })

  it('bloco transposto dos espiritos do clima esta anotado', () => {
    const verse = findVerse(data!, '60:11')
    expect(verse?.ref.en).toContain('58:1')
    expect(verse?.notes).toContain('transposto')
  })

  it('nota syncellus preservada no cap 16', () => {
    const chapter16 = allVerses(data!).filter((v) => v.chapter === 16)
    expect(chapter16.some((v) => v.notes.includes('syncellus'))).toBe(true)
  })

  it('sqlite com FTS5 responde a busca bilingue', () => {
    using db = new Database(`${DATA_DIR}/sqlite/enoque.sqlite`, { readonly: true })
    const count = db.query('SELECT COUNT(*) AS n FROM versos').get() as { n: number }
    expect(count.n).toBe(1059)

    const ftsPt = db
      .query("SELECT COUNT(*) AS n FROM busca WHERE busca MATCH 'gigantes'")
      .get() as { n: number }
    expect(ftsPt.n).toBeGreaterThan(0)

    const ftsEn = db
      .query("SELECT COUNT(*) AS n FROM busca WHERE busca MATCH 'watchers'")
      .get() as { n: number }
    expect(ftsEn.n).toBeGreaterThan(0)
  })
})

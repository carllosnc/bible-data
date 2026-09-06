import { describe, it, expect } from 'bun:test'
import { Database } from 'bun:sqlite'
import { existsSync } from 'node:fs'
import type { Bible } from '../types'
import { getSource, parseVerses } from '../enoque/scrapper'

const DATA_DIR = 'output/apocryphal'
const RAW_AVAILABLE =
  existsSync(`${DATA_DIR}/enoque/raw/1ENOQUE.html`) && existsSync(`${DATA_DIR}/enoque/raw/1ENOCH.html`)
const PT_AVAILABLE = existsSync(`${DATA_DIR}/json/pt-BR/bible-enoque.json`)
const EN_AVAILABLE = existsSync(`${DATA_DIR}/json/en/bible-enoque.json`)

const ptData: Bible | null = PT_AVAILABLE
  ? (JSON.parse(await Bun.file(`${DATA_DIR}/json/pt-BR/bible-enoque.json`).text()) as Bible)
  : null

const enData: Bible | null = EN_AVAILABLE
  ? (JSON.parse(await Bun.file(`${DATA_DIR}/json/en/bible-enoque.json`).text()) as Bible)
  : null

function allVerses(chapters: string[][]): string[] {
  return chapters.flat()
}

describe('enoque scrapper', () => {
  it('parseia as duas fontes com totais consistentes', async () => {
    if (!RAW_AVAILABLE) return
    const [ptHtml, enHtml] = await Promise.all([getSource('pt'), getSource('en')])
    const ptVerses = parseVerses(ptHtml)
    const enVerses = parseVerses(enHtml)
    expect(ptVerses.length).toBe(1059)
    expect(enVerses.length).toBe(1179)
    const ptChapters = new Set(ptVerses.map((v) => v.ch))
    expect(ptChapters.size).toBe(108)
    const enChapters = new Set(enVerses.map((v) => v.ch))
    expect(enChapters.size).toBe(103)
  })
})

describe('enoque bible format', () => {
  it.each([
    ['pt-BR', 'PT', ptData],
    ['en', 'EN', enData],
  ] as const)('%s: formato padrão bible (%s)', (lang, _label, data) => {
    if (!data) return

    expect(data.id).toBe('enoque')
    expect(data.category).toBe('Apocryphal')
    expect(data.lang).toBe(lang)
    expect(data.books.length).toBe(1)

    const book = data.books[0]
    expect(book.abbrev).toBe('enq')
    expect(book.category).toBe('Prophetic')
    expect(book.testament).toBe(0)
    expect(book.chapters.length).toBe(108)
    expect(book.chapters.flat().length).toBe(1059)
  })

  it('PT: todos os versículos presentes', () => {
    if (!ptData) return
    const book = ptData.books[0]
    for (let ch = 0; ch < 108; ch++) {
      const chapter = book.chapters[ch]
      expect(chapter.length).toBeGreaterThan(0)
      for (const verse of chapter) {
        expect(verse.length).toBeGreaterThan(0)
      }
    }
  })

  it('PT: versículos-chave de teste', () => {
    if (!ptData) return
    const book = ptData.books[0]
    expect(book.chapters[0][0]).toContain('Enoque')
    expect(book.chapters[17][0]).toContain('ventos')
    expect(book.chapters[88][0]).toContain('touros')
    expect(book.chapters[93][0]).toContain('justi')
    expect(book.chapters[107][0]).toContain('Outro livro')
  })

  it('EN: Coverage aligns with PT (same grid, ~90% coverage)', () => {
    if (!enData || !ptData) return
    const enFlat = allVerses(enData.books[0].chapters)
    const ptFlat = allVerses(ptData.books[0].chapters)
    expect(enFlat.length).toBe(ptFlat.length)

    const enEmpty = enFlat.filter((t) => t.length === 0).length
    const pct = ((ptFlat.length - enEmpty) / ptFlat.length) * 100
    expect(pct).toBeGreaterThanOrEqual(88)
    expect(pct).toBeLessThanOrEqual(95)
  })

  it('EN: canonical position 106:1 matches Noah wife text', () => {
    if (!enData) return
    const verse106v1 = enData.books[0].chapters[105][0]
    expect(verse106v1).toContain('Mathusala')
  })
})

describe('enoque sqlite', () => {
  it.each([
    ['pt-BR', ptData],
    ['en', enData],
  ] as const)('%s: standard schema + counts', (lang, data) => {
    if (!data) return
    const sqlitePath = `${DATA_DIR}/sqlite/${lang}/bible-enoque.sqlite`
    if (!existsSync(sqlitePath)) return
    using db = new Database(sqlitePath, { readonly: true })

    const tables = db.query("SELECT name FROM sqlite_master WHERE type='table'").all()
    const names = (tables as { name: string }[]).map((t) => t.name)
    expect(names).toContain('info')
    expect(names).toContain('books')
    expect(names).toContain('verses')

    const info = db.query('SELECT id, name, lang, category FROM info').get() as any
    expect(info.id).toBe('enoque')
    expect(info.category).toBe('Apocryphal')
    expect(info.lang).toBe(lang)

    const bookCount = (db.query('SELECT COUNT(*) as c FROM books').get() as any).c
    expect(bookCount).toBe(1)

    const verseCount = (db.query('SELECT COUNT(*) as c FROM verses').get() as any).c
    expect(verseCount).toBe(1059)

    const uniqueBook = (
      db.query('SELECT COUNT(DISTINCT book_abbrev) as c FROM verses').get() as any
    ).c
    expect(uniqueBook).toBe(1)
  })
})

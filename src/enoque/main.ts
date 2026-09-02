import { mkdir } from 'node:fs/promises'
import { Database } from 'bun:sqlite'
import type { AlignmentStats, ParallelChapter, ParallelEnoch, ParallelVerse, RawVerse } from './types'
import { SECTIONS } from './sections'
import { getSource, parseColophon, parseVerses, SOURCES } from './scrapper'
import {
  alignSequences,
  buildScoreMatrix,
  detectTransposed,
  groupAlignment,
  redistributeAttachments,
  refineAlignment,
} from './align'

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

function formatEnRef(en: RawVerse[], indices: number[]): string {
  const refs: string[] = []
  let runStart = 0
  for (let k = 1; k <= indices.length; k++) {
    const isRunEnd = k === indices.length || indices[k] !== indices[k - 1] + 1
    if (isRunEnd) {
      const first = en[indices[runStart]]
      const last = en[indices[k - 1]]
      refs.push(runStart === k - 1 ? `${first.ch}:${first.vs}` : `${first.ch}:${first.vs}-${last.ch}:${last.vs}`)
      runStart = k
    }
  }
  return refs.join(', ')
}

function buildParallel(
  ptVerses: RawVerse[],
  enVerses: RawVerse[],
  ptToEn: number[][],
  transposedPt: Set<number>,
  colophon: { pt: string; en: string },
  stats: AlignmentStats,
): ParallelEnoch {
  const ptChapters = groupByChapter(ptVerses)

  const sections = SECTIONS.map((def) => {
    const chapters: ParallelChapter[] = []
    for (let ch = def.chapterRange[0]; ch <= def.chapterRange[1]; ch++) {
      const rawVerses = ptChapters.get(ch)
      if (!rawVerses) continue
      const verses: ParallelVerse[] = rawVerses.map((verse, idx) => {
        const ptIdx = ptVerses.indexOf(verse)
        const enIdxs = ptToEn[ptIdx] ?? []
        const notes = new Set<string>(verse.notes)
        for (const enIdx of enIdxs) {
          for (const note of enVerses[enIdx].notes) notes.add(note)
        }
        if (transposedPt.has(ptIdx)) notes.add('transposto')
        return {
          number: idx + 1,
          pt: verse.text,
          en: enIdxs.length ? enIdxs.map((k) => enVerses[k].text).join(' ') : null,
          ref: {
            pt: `${verse.ch}:${verse.vs}`,
            en: enIdxs.length ? formatEnRef(enVerses, enIdxs) : null,
          },
          notes: [...notes],
        }
      })
      chapters.push({ number: ch, verses })
    }
    return { id: def.id, title: def.title, chapters }
  })

  const enChapters = new Set(enVerses.map((v) => v.ch))

  return {
    meta: {
      work: { pt: 'Primeiro Livro de Enoque (Etíope)', en: 'First Book of Enoch (Ethiopic)' },
      structure: {
        sections: SECTIONS.map((s) => ({
          id: s.id,
          title: s.title,
          chapterRange: s.chapterRange,
        })),
        canonicalChapters: 108,
        numbering:
          'A numeração canônica (campo "number" + "ref.pt") vem da tradução portuguesa: 108 capítulos, ' +
          'coincidente com a divisão moderna (R.H. Charles) do cap. 9 em diante; os caps. 1-8 seguem a divisão ' +
          'Laurence/Baty. A tradução inglesa (John Baty, 1839) tem numeração própria de 105 capítulos, registrada ' +
          'em "ref.en". O alinhamento entre as línguas é feito por conteúdo, não por numeração.',
      },
      translations: {
        pt: {
          lang: 'pt',
          title: 'O Livro de Enoque, o Profeta',
          source: SOURCES.pt.url,
          base: 'Cotejo das traduções de John Baty (1839) e Richard Laurence (1833) com manuscritos antigos (edição faithofgod.net)',
          chapters: ptChapters.size,
          retrieved: new Date().toISOString().slice(0, 10),
        },
        en: {
          lang: 'en',
          title: 'The Book of Enoch the Prophet',
          source: SOURCES.en.url,
          base: 'John Baty (1839), traduzido do alemão de Andrew Gottlieb Hoffmann e corrigido por John Baty',
          chapters: enChapters.size,
          retrieved: new Date().toISOString().slice(0, 10),
        },
      },
      colophon,
      alignment: {
        method:
          'Needleman-Wunsch por segmentos, ancorado em pares mútuos-ótimos monotônicos (LIS); ' +
          'similaridade de trigramas + tokens com glossário PT-EN e ponderação IDF + dígitos ' +
          '(numerais por extenso normalizados); versículos EN não pareados por diagonal são anexados ao ' +
          'vizinho de maior similaridade (limiar para órfãos) — PT com múltiplos EN são mesclados em um ' +
          'único texto EN com faixa de referência.',
        stats,
      },
    },
    sections,
  }
}

function writeSqlite(data: ParallelEnoch, path: string): void {
  const db = new Database(path, { create: true })
  try {
    db.exec('DROP TABLE IF EXISTS busca')
    db.exec('DROP TABLE IF EXISTS versos')
    db.exec('DROP TABLE IF EXISTS secoes')
    db.exec('DROP TABLE IF EXISTS meta')
    db.exec(`CREATE TABLE meta (key TEXT PRIMARY KEY, value TEXT)`)
    db.exec(`CREATE TABLE secoes (
      id TEXT PRIMARY KEY,
      titulo_pt TEXT NOT NULL,
      titulo_en TEXT NOT NULL,
      cap_inicio INTEGER NOT NULL,
      cap_fim INTEGER NOT NULL
    )`)
    db.exec(`CREATE TABLE versos (
      id INTEGER PRIMARY KEY,
      secao TEXT NOT NULL,
      capitulo INTEGER NOT NULL,
      versiculo INTEGER NOT NULL,
      ref_pt TEXT NOT NULL,
      ref_en TEXT,
      texto_pt TEXT,
      texto_en TEXT,
      notas TEXT
    )`)
    db.exec(`CREATE INDEX idx_versos_cap ON versos (capitulo, versiculo)`)

    db.transaction(() => {
      const metaStmt = db.prepare('INSERT INTO meta (key, value) VALUES (?, ?)')
      metaStmt.run('work_pt', data.meta.work.pt)
      metaStmt.run('work_en', data.meta.work.en)
      metaStmt.run('canonical_chapters', String(data.meta.structure.canonicalChapters))
      for (const [lang, t] of Object.entries(data.meta.translations)) {
        metaStmt.run(`translation_${lang}_title`, t.title)
        metaStmt.run(`translation_${lang}_source`, t.source)
        metaStmt.run(`translation_${lang}_base`, t.base)
      }
      metaStmt.run('alignment_stats', JSON.stringify(data.meta.alignment.stats))

      const secStmt = db.prepare('INSERT INTO secoes VALUES (?, ?, ?, ?, ?)')
      for (const s of data.meta.structure.sections) {
        secStmt.run(s.id, s.title.pt, s.title.en, s.chapterRange[0], s.chapterRange[1])
      }

      const verseStmt = db.prepare(
        'INSERT INTO versos (id, secao, capitulo, versiculo, ref_pt, ref_en, texto_pt, texto_en, notas) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      )
      let id = 0
      for (const section of data.sections) {
        for (const chapter of section.chapters) {
          for (const verse of chapter.verses) {
            verseStmt.run(
              ++id,
              section.id,
              chapter.number,
              verse.number,
              verse.ref.pt,
              verse.ref.en,
              verse.pt,
              verse.en,
              verse.notes.length ? JSON.stringify(verse.notes) : null,
            )
          }
        }
      }
    })()

    db.exec(`CREATE VIRTUAL TABLE busca USING fts5(texto_pt, texto_en, content='versos', content_rowid='id')`)
    db.exec(`INSERT INTO busca (rowid, texto_pt, texto_en) SELECT id, COALESCE(texto_pt, ''), COALESCE(texto_en, '') FROM versos`)
  } finally {
    db.close()
  }
}

function writeMarkdown(data: ParallelEnoch, path: string): void {
  const lines: string[] = []
  lines.push(`# ${data.meta.work.pt} — Edição Paralela`)
  lines.push('')
  lines.push(`**PT** ${data.meta.translations.pt.title} · ${data.meta.translations.pt.source}`)
  lines.push('')
  lines.push(`**EN** ${data.meta.translations.en.title} · ${data.meta.translations.en.source}`)
  lines.push('')

  for (const section of data.sections) {
    lines.push(`## ${section.title.pt} · ${section.title.en} (caps. ${section.chapters[0]?.number}–${section.chapters.at(-1)?.number})`)
    lines.push('')
    for (const chapter of section.chapters) {
      lines.push(`### Capítulo ${chapter.number}`)
      lines.push('')
      for (const verse of chapter.verses) {
        const refs = `pt ${verse.ref.pt}${verse.ref.en ? ` · en ${verse.ref.en}` : ''}${verse.notes.length ? ` · ${verse.notes.join(', ')}` : ''}`
        lines.push(`**${chapter.number}:${verse.number}** (${refs})`)
        lines.push('')
        lines.push(`> **PT** ${verse.pt ?? '—'}`)
        lines.push('')
        lines.push(`> **EN** ${verse.en ?? '—'}`)
        lines.push('')
      }
    }
  }

  lines.push(`*${data.meta.colophon.pt}*`)
  lines.push('')
  lines.push(`*${data.meta.colophon.en}*`)
  lines.push('')
  Bun.write(path, lines.join('\n'))
}

async function main(): Promise<void> {
  const force = process.argv.includes('--force')

  console.log('Downloading sources (faithofgod.net)...')
  const [ptHtml, enHtml] = await Promise.all([getSource('pt', force), getSource('en', force)])

  const ptVerses = parseVerses(ptHtml)
  const enVerses = parseVerses(enHtml)
  const colophon = { pt: parseColophon(ptHtml, 'pt'), en: parseColophon(enHtml, 'en') }

  console.log(`PT: ${ptVerses.length} verses, chapters ${Math.min(...ptVerses.map((v) => v.ch))}-${Math.max(...ptVerses.map((v) => v.ch))}`)
  console.log(`EN: ${enVerses.length} verses, chapters ${Math.min(...enVerses.map((v) => v.ch))}-${Math.max(...enVerses.map((v) => v.ch))}`)

  const ptChapters = [...new Set(ptVerses.map((v) => v.ch))].sort((a, b) => a - b)
  const missingPt = Array.from({ length: 108 }, (_, i) => i + 1).filter((c) => !ptChapters.includes(c))
  if (missingPt.length) {
    console.warn(`Warning: PT missing chapters: ${missingPt.join(', ')}`)
  }

  console.log('Aligning PT/EN (Needleman-Wunsch + anchors)...')
  const S = buildScoreMatrix(ptVerses, enVerses)
  const ops = alignSequences(ptVerses, enVerses, S)
  const initial = groupAlignment(ptVerses, enVerses, ops, S)
  const refined = refineAlignment(enVerses, initial.ptToEn, initial.orphanEn, S)
  const ptToEn = redistributeAttachments(ptVerses.length, refined.ptToEn, S, enVerses.length)
  const orphanEn = refined.orphanEn.filter((j) => !ptToEn.some((list) => list.includes(j)))
  const transposedPt = detectTransposed(ptToEn)
  const diagScores = initial.diagScores

  const matchedPt = ptToEn.filter((l) => l.length > 0).length
  const stats: AlignmentStats = {
    ptVerses: ptVerses.length,
    enVerses: enVerses.length,
    matchedPt,
    unmatchedPt: ptVerses.length - matchedPt,
    mergedEnRanges: ptToEn.filter((l) => l.length > 1).length,
    orphanEn: orphanEn.length,
    transposedPt: transposedPt.size,
    meanScore: diagScores.length ? diagScores.reduce((a, b) => a + b, 0) / diagScores.length : 0,
  }
  console.log('Alignment stats:', stats)

  const data = buildParallel(ptVerses, enVerses, ptToEn, transposedPt, colophon, stats)

  await mkdir('enoque/json', { recursive: true })
  await mkdir('enoque/gzip', { recursive: true })
  await mkdir('enoque/sqlite', { recursive: true })
  await mkdir('enoque/markdown', { recursive: true })

  const json = JSON.stringify(data, null, 2)
  await Bun.write('enoque/json/enoque.paralela.json', json)
  await Bun.write('enoque/gzip/enoque.paralela.json.gz', Bun.gzipSync(json))
  console.log('Wrote enoque/json/enoque.paralela.json + gzip')

  writeSqlite(data, 'enoque/sqlite/enoque.sqlite')
  console.log('Wrote enoque/sqlite/enoque.sqlite (FTS5)')

  writeMarkdown(data, 'enoque/markdown/enoque.paralela.md')
  console.log('Wrote enoque/markdown/enoque.paralela.md')

  console.log('Done.')
}

await main()

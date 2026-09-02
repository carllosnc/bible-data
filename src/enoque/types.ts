export type Lang = 'pt' | 'en'

export type RawVerse = {
  ch: number
  vs: number
  text: string
  notes: string[]
}

export type SectionDef = {
  id: string
  title: { pt: string; en: string }
  chapterRange: [number, number]
}

export type TranslationMeta = {
  lang: Lang
  title: string
  source: string
  base: string
  chapters: number
  retrieved: string
}

export type ParallelVerse = {
  number: number
  pt: string | null
  en: string | null
  ref: {
    pt: string
    en: string | null
  }
  notes: string[]
}

export type ParallelChapter = {
  number: number
  verses: ParallelVerse[]
}

export type ParallelSection = {
  id: string
  title: { pt: string; en: string }
  chapters: ParallelChapter[]
}

export type AlignmentStats = {
  ptVerses: number
  enVerses: number
  matchedPt: number
  unmatchedPt: number
  mergedEnRanges: number
  orphanEn: number
  transposedPt: number
  meanScore: number
}

export type ParallelEnoch = {
  meta: {
    work: { pt: string; en: string }
    structure: {
      sections: Array<{ id: string; title: { pt: string; en: string }; chapterRange: [number, number] }>
      canonicalChapters: number
      numbering: string
    }
    translations: Record<Lang, TranslationMeta>
    colophon: { pt: string; en: string }
    alignment: {
      method: string
      stats: AlignmentStats
    }
  }
  sections: ParallelSection[]
}

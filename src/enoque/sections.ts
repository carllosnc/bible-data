import type { SectionDef } from './types'

export const SECTIONS: SectionDef[] = [
  {
    id: 'vigilantes',
    title: { pt: 'Livro dos Vigilantes', en: 'Book of the Watchers' },
    chapterRange: [1, 36],
  },
  {
    id: 'parabolas',
    title: { pt: 'Livro das Parábolas', en: 'Book of Parables' },
    chapterRange: [37, 71],
  },
  {
    id: 'astronomico',
    title: { pt: 'Livro Astronômico', en: 'Astronomical Book' },
    chapterRange: [72, 82],
  },
  {
    id: 'visoes',
    title: { pt: 'Livro das Visões Oníricas', en: 'Book of Dream Visions' },
    chapterRange: [83, 90],
  },
  {
    id: 'epistola',
    title: { pt: 'Epístola de Enoque', en: 'Epistle of Enoch' },
    chapterRange: [91, 108],
  },
]

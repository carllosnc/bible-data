export type BookCategory =
  "Pentateuch" |
  "Historical Books" |
  "Poetry and Wisdom" |
  "Major Prophets" |
  "Minor Prophets" |
  "Gospels" |
  "History" |
  "Pauline Epistles" |
  "General Epistles" |
  "Prophetic"

export type BibleCategory = "Protestant" | "Catholic" | "Othodox"

export type Book = {
  name: string
  link: string
  category: BookCategory
  abbrev: string
  testament: number
  chapters: string[][]
}

export type Bible = {
  id: string
  name: string
  category: BibleCategory
  lang: string
  books: Book[]
}

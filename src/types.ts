export type BookCategory =
  "Pentateuch" |
  "Historical Books" |
  "Poetry and Wisdom Books" |
  "Major Prophets" |
  "Minor Prophets" |
  "Gospels" |
  "History" |
  "Pauline Epistles" |
  "General Epistles" |
  "Prophetic"

export type Book = {
  name: string;
  link: string;
  abbrev: string;
  testament: number;
  chapters: string[][];
}

export type Bible = {
  lang: string;
  books: Book[];
};


//x + y = 200, 170 = 
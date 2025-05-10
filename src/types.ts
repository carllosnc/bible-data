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
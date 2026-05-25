import type { BookCategory } from "../../types";

export function getCategory_ptbr(code: string): BookCategory {
  const key = code.trim().toLowerCase();

  const categoryMap = new Map([
    ["genesis", "Pentateuch"],
    ["exodo", "Pentateuch"],
    ["levitico", "Pentateuch"],
    ["numeros", "Pentateuch"],
    ["deuteronomio", "Pentateuch"],

    ["josue", "Historical Books"],
    ["juizes", "Historical Books"],
    ["rute", "Historical Books"],
    ["i-samuel", "Historical Books"],
    ["ii-samuel", "Historical Books"],
    ["i-reis", "Historical Books"],
    ["ii-reis", "Historical Books"],
    ["i-cronicas", "Historical Books"],
    ["ii-cronicas", "Historical Books"],
    ["esdras", "Historical Books"],
    ["neemias", "Historical Books"],
    ["tobias", "Historical Books"],
    ["judite", "Historical Books"],
    ["ester", "Historical Books"],
    ["i-macabeus", "Historical Books"],
    ["ii-macabeus", "Historical Books"],

    ["jo", "Poetry and Wisdom"],
    ["salmos", "Poetry and Wisdom"],
    ["proverbios", "Poetry and Wisdom"],
    ["eclesiastes", "Poetry and Wisdom"],
    ["cantico-dos-canticos", "Poetry and Wisdom"],
    ["sabedoria", "Poetry and Wisdom"],
    ["eclesiastico", "Poetry and Wisdom"],

    ["isaias", "Major Prophets"],
    ["jeremias", "Major Prophets"],
    ["lamentacoes", "Major Prophets"],
    ["baruc", "Major Prophets"],
    ["ezequiel", "Major Prophets"],
    ["daniel", "Major Prophets"],

    ["oseias", "Minor Prophets"],
    ["joel", "Minor Prophets"],
    ["amos", "Minor Prophets"],
    ["abdias", "Minor Prophets"],
    ["jonas", "Minor Prophets"],
    ["miqueias", "Minor Prophets"],
    ["naum", "Minor Prophets"],
    ["habacuc", "Minor Prophets"],
    ["sofonias", "Minor Prophets"],
    ["ageu", "Minor Prophets"],
    ["zacarias", "Minor Prophets"],
    ["malaquias", "Minor Prophets"],

    ["sao-mateus", "Gospels"],
    ["sao-marcos", "Gospels"],
    ["sao-lucas", "Gospels"],
    ["sao-joao", "Gospels"],

    ["atos-dos-apostolos", "History"],

    ["romanos", "Pauline Epistles"],
    ["i-corintios", "Pauline Epistles"],
    ["ii-corintios", "Pauline Epistles"],
    ["galatas", "Pauline Epistles"],
    ["efesios", "Pauline Epistles"],
    ["filipenses", "Pauline Epistles"],
    ["colossenses", "Pauline Epistles"],
    ["i-tessalonicenses", "Pauline Epistles"],
    ["ii-tessalonicenses", "Pauline Epistles"],
    ["i-timoteo", "Pauline Epistles"],
    ["ii-timoteo", "Pauline Epistles"],
    ["tito", "Pauline Epistles"],
    ["filemon", "Pauline Epistles"],

    ["hebreus", "General Epistles"],
    ["sao-tiago", "General Epistles"],
    ["i-sao-pedro", "General Epistles"],
    ["ii-sao-pedro", "General Epistles"],
    ["i-sao-joao", "General Epistles"],
    ["ii-sao-joao", "General Epistles"],
    ["iii-sao-joao", "General Epistles"],
    ["sao-judas", "General Epistles"],

    ["apocalipse", "Prophetic"]
  ]);

  if(!categoryMap.has(key)){
    throw new Error(`Category error: ${key}`)
  }

  return categoryMap.get(key) as BookCategory;
}
import type { BookCategory } from "../../types";

export function getCategory_es(code: string): BookCategory {
  const key = code.trim().toLowerCase();

  const categoryMap = new Map([
    ["genesis", "Pentateuch"],
    ["exodo", "Pentateuch"],
    ["levitico", "Pentateuch"],
    ["numeros", "Pentateuch"],
    ["deuteronomio", "Pentateuch"],

    ["josue", "Historical Books"],
    ["jueces", "Historical Books"],
    ["rut", "Historical Books"],
    ["i-samuel", "Historical Books"],
    ["ii-samuel", "Historical Books"],
    ["i-reyes", "Historical Books"],
    ["ii-reyes", "Historical Books"],
    ["i-cronicas", "Historical Books"],
    ["ii-cronicas", "Historical Books"],
    ["esdras", "Historical Books"],
    ["nehemias", "Historical Books"],
    ["tobias", "Historical Books"],
    ["judit", "Historical Books"],
    ["ester", "Historical Books"],
    ["i-macabeos", "Historical Books"],
    ["ii-macabeos", "Historical Books"],

    ["job", "Poetry and Wisdom"],
    ["salmos", "Poetry and Wisdom"],
    ["proverbios", "Poetry and Wisdom"],
    ["eclesiastes", "Poetry and Wisdom"],
    ["cantar", "Poetry and Wisdom"],
    ["sabiduria", "Poetry and Wisdom"],
    ["eclesiastico", "Poetry and Wisdom"],

    ["isaias", "Major Prophets"],
    ["jeremias", "Major Prophets"],
    ["lamentaciones", "Major Prophets"],
    ["baruc", "Major Prophets"],
    ["ezequiel", "Major Prophets"],
    ["daniel", "Major Prophets"],

    ["oseas", "Minor Prophets"],
    ["joel", "Minor Prophets"],
    ["amos", "Minor Prophets"],
    ["abdias", "Minor Prophets"],
    ["jonas", "Minor Prophets"],
    ["miqueas", "Minor Prophets"],
    ["nahun", "Minor Prophets"],
    ["habacuc", "Minor Prophets"],
    ["sofonias", "Minor Prophets"],
    ["ageo", "Minor Prophets"],
    ["zacarias", "Minor Prophets"],
    ["malaquias", "Minor Prophets"],

    ["mateo", "Gospels"],
    ["marcos", "Gospels"],
    ["lucas", "Gospels"],
    ["juan", "Gospels"],

    ["hechos", "History"],

    ["romanos", "Pauline Epistles"],
    ["i-corintios", "Pauline Epistles"],
    ["ii-corintios", "Pauline Epistles"],
    ["galatas", "Pauline Epistles"],
    ["efesios", "Pauline Epistles"],
    ["filipenses", "Pauline Epistles"],
    ["colosenses", "Pauline Epistles"],
    ["i-tesalonicenses", "Pauline Epistles"],
    ["ii-tesalonicenses", "Pauline Epistles"],
    ["i-timoteo", "Pauline Epistles"],
    ["ii-timoteo", "Pauline Epistles"],
    ["tito", "Pauline Epistles"],
    ["filemon", "Pauline Epistles"],

    ["hebreos", "General Epistles"],
    ["santiago", "General Epistles"],
    ["i-pedro", "General Epistles"],
    ["ii-pedro", "General Epistles"],
    ["i-juan", "General Epistles"],
    ["ii-juan", "General Epistles"],
    ["iii-juan", "General Epistles"],
    ["judas", "General Epistles"],

    ["apocalipsis", "Prophetic"]
  ]);

  if(!categoryMap.has(key)){
    throw new Error(`Category error: ${key}`)
  }

  return categoryMap.get(key) as BookCategory;
}

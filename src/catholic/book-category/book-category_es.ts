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
    ["1-samuel", "Historical Books"],
    ["2-samuel", "Historical Books"],
    ["1-reyes", "Historical Books"],
    ["2-reyes", "Historical Books"],
    ["1-cronicas", "Historical Books"],
    ["2-cronicas", "Historical Books"],
    ["esdras", "Historical Books"],
    ["nehemias", "Historical Books"],
    ["tobias", "Historical Books"],
    ["judit", "Historical Books"],
    ["ester", "Historical Books"],
    ["1-macabeos", "Historical Books"],
    ["2-macabeos", "Historical Books"],

    ["job", "Poetry and Wisdom"],
    ["salmos", "Poetry and Wisdom"],
    ["proverbios", "Poetry and Wisdom"],
    ["eclesiastes-qohelet", "Poetry and Wisdom"],
    ["cantar", "Poetry and Wisdom"],
    ["sabiduria", "Poetry and Wisdom"],
    ["siracides-eclesiastico", "Poetry and Wisdom"],

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

    ["evangelio-segun-san-mateo", "Gospels"],
    ["evangelio-segun-san-marcos", "Gospels"],
    ["evangelio-segun-san-lucas", "Gospels"],
    ["evangelio-segun-san-juan", "Gospels"],

    ["hecho-de-los-apostoles", "History"],

    ["carta-a-los-romanos", "Pauline Epistles"],
    ["1-carta-a-los-corintios", "Pauline Epistles"],
    ["2-carta-a-los-corintios", "Pauline Epistles"],
    ["carta-a-los-galatas", "Pauline Epistles"],
    ["carta-a-los-efesios", "Pauline Epistles"],
    ["carta-a-los-filipenses", "Pauline Epistles"],
    ["carta-a-los-colosenses", "Pauline Epistles"],
    ["1-carta-a-los-tesalonicenses", "Pauline Epistles"],
    ["2-carta-a-los-tesalonicenses", "Pauline Epistles"],
    ["1-carta-a-timoteo", "Pauline Epistles"],
    ["2-carta-a-timoteo", "Pauline Epistles"],
    ["carta-a-tito", "Pauline Epistles"],
    ["carta-a-filemon", "Pauline Epistles"],

    ["carta-a-los-hebreos", "General Epistles"],
    ["carta-de-santiago", "General Epistles"],
    ["1-carta-de-pedro", "General Epistles"],
    ["2-carta-de-pedro", "General Epistles"],
    ["1-carta-de-juan", "General Epistles"],
    ["2-carta-de-juan", "General Epistles"],
    ["3-carta-de-juan", "General Epistles"],
    ["carta-de-judas", "General Epistles"],

    ["apocalipsis", "Prophetic"]
  ]);

  if(!categoryMap.has(key)){
    console.log("key here!", key)
    throw new Error(`Category error: ${key}`)
  }

  return categoryMap.get(key) as BookCategory;
}

import type { BookCategory } from "../../types";

export function getCategory_la(code: string): BookCategory {
  const key = code.trim().toLowerCase();

  const categoryMap = new Map([
    ["genesis", "Pentateuch"],
    ["exodus", "Pentateuch"],
    ["leviticus", "Pentateuch"],
    ["numeri", "Pentateuch"],
    ["deuteronomium", "Pentateuch"],

    ["josue", "Historical Books"],
    ["judicum", "Historical Books"],
    ["ruth", "Historical Books"],
    ["1-regum", "Historical Books"],
    ["2-regum", "Historical Books"],
    ["3-regum", "Historical Books"],
    ["4-regum", "Historical Books"],
    ["1-paralipomenon", "Historical Books"],
    ["2-paralipomenon", "Historical Books"],
    ["esdras", "Historical Books"],
    ["nehemias", "Historical Books"],
    ["tobias", "Historical Books"],
    ["judith", "Historical Books"],
    ["hester", "Historical Books"],
    ["1-machabaeorum", "Historical Books"],
    ["2-machabaeorum", "Historical Books"],

    ["job", "Poetry and Wisdom"],
    ["psalmi", "Poetry and Wisdom"],
    ["proverbia", "Poetry and Wisdom"],
    ["ecclesiastes", "Poetry and Wisdom"],
    ["canticum-canticorum", "Poetry and Wisdom"],
    ["sapientia", "Poetry and Wisdom"],
    ["ecclesiasticus", "Poetry and Wisdom"],

    ["isaias", "Major Prophets"],
    ["jeremias", "Major Prophets"],
    ["lamentationes", "Major Prophets"],
    ["baruch", "Major Prophets"],
    ["ezechiel", "Major Prophets"],
    ["daniel", "Major Prophets"],

    ["osee", "Minor Prophets"],
    ["joel", "Minor Prophets"],
    ["amos", "Minor Prophets"],
    ["abdias", "Minor Prophets"],
    ["jonas", "Minor Prophets"],
    ["micheas", "Minor Prophets"],
    ["nahum", "Minor Prophets"],
    ["habacuc", "Minor Prophets"],
    ["sophonia", "Minor Prophets"],
    ["aggaeus", "Minor Prophets"],
    ["zacharias", "Minor Prophets"],
    ["malachias", "Minor Prophets"],

    ["matthaeus", "Gospels"],
    ["marcus", "Gospels"],
    ["lucas", "Gospels"],
    ["joannes", "Gospels"],

    ["actus-apostolorum", "History"],

    ["ad-romanos", "Pauline Epistles"],
    ["1-ad-corinthios", "Pauline Epistles"],
    ["2-ad-corinthios", "Pauline Epistles"],
    ["ad-galatas", "Pauline Epistles"],
    ["ad-ephesios", "Pauline Epistles"],
    ["ad-philippenses", "Pauline Epistles"],
    ["ad-colossenses", "Pauline Epistles"],
    ["1-ad-thessalonicenses", "Pauline Epistles"],
    ["2-ad-thessalonicenses", "Pauline Epistles"],
    ["1-ad-timotheum", "Pauline Epistles"],
    ["2-ad-timotheum", "Pauline Epistles"],
    ["ad-titum", "Pauline Epistles"],
    ["ad-philemonem", "Pauline Epistles"],

    ["ad-hebraeos", "General Epistles"],
    ["jacobi", "General Epistles"],
    ["1-petri", "General Epistles"],
    ["2-petri", "General Epistles"],
    ["1-joannis", "General Epistles"],
    ["2-joannis", "General Epistles"],
    ["3-joannis", "General Epistles"],
    ["judae", "General Epistles"],

    ["apocalypsis", "Prophetic"]
  ]);

  if(!categoryMap.has(key)){
    console.log("key here!", key)
    throw new Error(`Category error: ${key}`)
  }

  return categoryMap.get(key) as BookCategory;
}

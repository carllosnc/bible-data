import type { BookCategory } from "../../types";

export function getCategory_fr(code: string): BookCategory {
  const key = code.trim().toLowerCase();

  const categoryMap = new Map([
    ["genese", "Pentateuch"],
    ["exode", "Pentateuch"],
    ["levitique", "Pentateuch"],
    ["nombres", "Pentateuch"],
    ["deuteronome", "Pentateuch"],

    ["josue", "Historical Books"],
    ["juges", "Historical Books"],
    ["ruth", "Historical Books"],
    ["1-samuel", "Historical Books"],
    ["2-samuel", "Historical Books"],
    ["1-rois", "Historical Books"],
    ["2-rois", "Historical Books"],
    ["1-chroniques", "Historical Books"],
    ["2-chroniques", "Historical Books"],
    ["esdras", "Historical Books"],
    ["nehemie", "Historical Books"],
    ["tobie", "Historical Books"],
    ["judith", "Historical Books"],
    ["esther", "Historical Books"],
    ["1-maccabees", "Historical Books"],
    ["2-maccabees", "Historical Books"],

    ["job", "Poetry and Wisdom"],
    ["psaumes", "Poetry and Wisdom"],
    ["proverbes", "Poetry and Wisdom"],
    ["ecclesiaste", "Poetry and Wisdom"],
    ["cantique-des-cantiques", "Poetry and Wisdom"],
    ["sagesse", "Poetry and Wisdom"],
    ["siracide", "Poetry and Wisdom"],

    ["isaie", "Major Prophets"],
    ["jeremie", "Major Prophets"],
    ["lamentaciones", "Major Prophets"],
    ["baruch", "Major Prophets"],
    ["ezechiel", "Major Prophets"],
    ["daniel", "Major Prophets"],

    ["osee", "Minor Prophets"],
    ["joel", "Minor Prophets"],
    ["amos", "Minor Prophets"],
    ["abdias", "Minor Prophets"],
    ["jonas", "Minor Prophets"],
    ["michee", "Minor Prophets"],
    ["nahum", "Minor Prophets"],
    ["habacuc", "Minor Prophets"],
    ["sophonie", "Minor Prophets"],
    ["aggee", "Minor Prophets"],
    ["zacharie", "Minor Prophets"],
    ["malachie", "Minor Prophets"],

    ["matthieu", "Gospels"],
    ["marc", "Gospels"],
    ["luc", "Gospels"],
    ["jean", "Gospels"],

    ["actes-des-apotres", "History"],

    ["romains", "Pauline Epistles"],
    ["1-corinthiens", "Pauline Epistles"],
    ["2-corinthiens", "Pauline Epistles"],
    ["galatas", "Pauline Epistles"],
    ["ephesiens", "Pauline Epistles"],
    ["philippiens", "Pauline Epistles"],
    ["colossiens", "Pauline Epistles"],
    ["1-thessaloniciens", "Pauline Epistles"],
    ["2-thessaloniciens", "Pauline Epistles"],
    ["1-timothee", "Pauline Epistles"],
    ["2-timothee", "Pauline Epistles"],
    ["tite", "Pauline Epistles"],
    ["philemon", "Pauline Epistles"],

    ["hebreux", "General Epistles"],
    ["jacques", "General Epistles"],
    ["1-pierre", "General Epistles"],
    ["2-pierre", "General Epistles"],
    ["1-jean", "General Epistles"],
    ["2-jean", "General Epistles"],
    ["3-jean", "General Epistles"],
    ["jude", "General Epistles"],

    ["apocalypse", "Prophetic"]
  ]);

  if(!categoryMap.has(key)){
    console.log("key here!", key)
    throw new Error(`Category error: ${key}`)
  }

  return categoryMap.get(key) as BookCategory;
}

import type { BookCategory } from "../../types";

export function getCategory_it(code: string): BookCategory {
  const key = code.trim().toLowerCase();

  const categoryMap = new Map([
    ["genesi", "Pentateuch"],
    ["esodo", "Pentateuch"],
    ["levitico", "Pentateuch"],
    ["numeri", "Pentateuch"],
    ["deuteronomio", "Pentateuch"],

    ["giosue", "Historical Books"],
    ["giudici", "Historical Books"],
    ["rut", "Historical Books"],
    ["1-samuele", "Historical Books"],
    ["2-samuele", "Historical Books"],
    ["1-re", "Historical Books"],
    ["2-re", "Historical Books"],
    ["1-cronache", "Historical Books"],
    ["2-cronache", "Historical Books"],
    ["esdra", "Historical Books"],
    ["neemia", "Historical Books"],
    ["tobia", "Historical Books"],
    ["giuditta", "Historical Books"],
    ["ester", "Historical Books"],
    ["1-maccabei", "Historical Books"],
    ["2-maccabei", "Historical Books"],

    ["giobbe", "Poetry and Wisdom"],
    ["salmi", "Poetry and Wisdom"],
    ["proverbi", "Poetry and Wisdom"],
    ["ecclesiaste", "Poetry and Wisdom"],
    ["cantico-dei-cantici", "Poetry and Wisdom"],
    ["sapienza", "Poetry and Wisdom"],
    ["siracide", "Poetry and Wisdom"],

    ["isaia", "Major Prophets"],
    ["geremia", "Major Prophets"],
    ["lamentazioni", "Major Prophets"],
    ["baruc", "Major Prophets"],
    ["ezechiele", "Major Prophets"],
    ["daniele", "Major Prophets"],

    ["osea", "Minor Prophets"],
    ["gioele", "Minor Prophets"],
    ["amos", "Minor Prophets"],
    ["abdia", "Minor Prophets"],
    ["giona", "Minor Prophets"],
    ["michea", "Minor Prophets"],
    ["naum", "Minor Prophets"],
    ["abacuc", "Minor Prophets"],
    ["sofonia", "Minor Prophets"],
    ["aggeo", "Minor Prophets"],
    ["zaccaria", "Minor Prophets"],
    ["malachia", "Minor Prophets"],

    ["matteo", "Gospels"],
    ["marco", "Gospels"],
    ["luca", "Gospels"],
    ["giovanni", "Gospels"],

    ["atti-degli-apostoli", "History"],

    ["romani", "Pauline Epistles"],
    ["1-corinzi", "Pauline Epistles"],
    ["2-corinzi", "Pauline Epistles"],
    ["galati", "Pauline Epistles"],
    ["efesini", "Pauline Epistles"],
    ["filippesi", "Pauline Epistles"],
    ["colossesi", "Pauline Epistles"],
    ["1-tessalonicesi", "Pauline Epistles"],
    ["2-tessalonicesi", "Pauline Epistles"],
    ["1-timoteo", "Pauline Epistles"],
    ["2-timoteo", "Pauline Epistles"],
    ["tito", "Pauline Epistles"],
    ["filemone", "Pauline Epistles"],

    ["ebrei", "General Epistles"],
    ["giacomo", "General Epistles"],
    ["1-pietro", "General Epistles"],
    ["2-pietro", "General Epistles"],
    ["1-giovanni", "General Epistles"],
    ["2-giovanni", "General Epistles"],
    ["3-giovanni", "General Epistles"],
    ["giuda", "General Epistles"],

    ["apocalisse", "Prophetic"]
  ]);

  if(!categoryMap.has(key)){
    console.log("key here!", key)
    throw new Error(`Category error: ${key}`)
  }

  return categoryMap.get(key) as BookCategory;
}

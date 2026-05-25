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
    ["samuele-1", "Historical Books"],
    ["samuele-2", "Historical Books"],
    ["re-1", "Historical Books"],
    ["re-2", "Historical Books"],
    ["cronache-1", "Historical Books"],
    ["cronache-2", "Historical Books"],
    ["esdra", "Historical Books"],
    ["neemia", "Historical Books"],
    ["tobi", "Historical Books"],
    ["giuditta", "Historical Books"],
    ["ester", "Historical Books"],
    ["maccabei-1", "Historical Books"],
    ["maccabei-2", "Historical Books"],

    ["giobbe", "Poetry and Wisdom"],
    ["salmi", "Poetry and Wisdom"],
    ["proverbi", "Poetry and Wisdom"],
    ["qoelet-ecclesiaste", "Poetry and Wisdom"],
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
    ["nahum", "Minor Prophets"],
    ["abacuc", "Minor Prophets"],
    ["sofonia", "Minor Prophets"],
    ["aggeo", "Minor Prophets"],
    ["zaccaria", "Minor Prophets"],
    ["malachia", "Minor Prophets"],

    ["vangelo-secondo-matteo", "Gospels"],
    ["vangelo-secondo-marco", "Gospels"],
    ["vangelo-secondo-luca", "Gospels"],
    ["vangelo-secondo-giovanni", "Gospels"],

    ["atti-degli-apostoli", "History"],

    ["romani", "Pauline Epistles"],
    ["corinzi-1", "Pauline Epistles"],
    ["corinzi-2", "Pauline Epistles"],
    ["galati", "Pauline Epistles"],
    ["efesini", "Pauline Epistles"],
    ["filippesi", "Pauline Epistles"],
    ["colossesi", "Pauline Epistles"],
    ["tessalonicesi-1", "Pauline Epistles"],
    ["tessalonicesi-2", "Pauline Epistles"],
    ["timoteo-1", "Pauline Epistles"],
    ["timoteo-2", "Pauline Epistles"],
    ["tito", "Pauline Epistles"],
    ["filemone", "Pauline Epistles"],

    ["ebrei", "General Epistles"],
    ["giacomo", "General Epistles"],
    ["pietro-1", "General Epistles"],
    ["pietro-2", "General Epistles"],
    ["giovanni-1", "General Epistles"],
    ["giovanni-2", "General Epistles"],
    ["giovanni-3", "General Epistles"],
    ["giuda", "General Epistles"],

    ["apocalisse", "Prophetic"]
  ]);

  if(!categoryMap.has(key)){
    throw new Error(`Category error: ${key}`)
  }

  return categoryMap.get(key) as BookCategory;
}

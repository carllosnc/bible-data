import type { BookCategory } from "../types";

export function getCategory(code: string): BookCategory {
  const key = code.trim().toLowerCase();

  const categoryMap = new Map([
    ["genesis", "Pentateuch"],
    ["exodus", "Pentateuch"],
    ["leviticus", "Pentateuch"],
    ["numbers", "Pentateuch"],
    ["deuteronomy", "Pentateuch"],

    ["joshua", "Historical Books"],
    ["judges", "Historical Books"],
    ["ruth", "Historical Books"],
    ["i-samuel", "Historical Books"],
    ["ii-samuel", "Historical Books"],
    ["i-kings", "Historical Books"],
    ["ii-kings", "Historical Books"],
    ["i-chronicles", "Historical Books"],
    ["ii-chronicles", "Historical Books"],
    ["ezra", "Historical Books"],
    ["nehemiah", "Historical Books"],
    ["tobit", "Historical Books"],
    ["judith", "Historical Books"],
    ["esther", "Historical Books"],
    ["1-maccabees", "Historical Books"],
    ["2-maccabees", "Historical Books"],

    ["job", "Poetry and Wisdom"],
    ["psalms", "Poetry and Wisdom"],
    ["proverbs", "Poetry and Wisdom"],
    ["ecclesiastes", "Poetry and Wisdom"],
    ["songofsolomon", "Poetry and Wisdom"],
    ["wisdom", "Poetry and Wisdom"],
    ["sirach", "Poetry and Wisdom"],

    ["isaiah", "Major Prophets"],
    ["jeremiah", "Major Prophets"],
    ["lamentations", "Major Prophets"],
    ["baruch", "Major Prophets"],
    ["ezekiel", "Major Prophets"],
    ["daniel", "Major Prophets"],

    ["hosea", "Minor Prophets"],
    ["joel", "Minor Prophets"],
    ["amos", "Minor Prophets"],
    ["obadiah", "Minor Prophets"],
    ["jonah", "Minor Prophets"],
    ["micah", "Minor Prophets"],
    ["nahum", "Minor Prophets"],
    ["habakkuk", "Minor Prophets"],
    ["zephaniah", "Minor Prophets"],
    ["haggai", "Minor Prophets"],
    ["zechariah", "Minor Prophets"],
    ["malachi", "Minor Prophets"],

    ["matthew", "Gospels"],
    ["mark", "Gospels"],
    ["luke", "Gospels"],
    ["john", "Gospels"],

    ["acts", "History"],

    ["romans", "Pauline Epistles"],
    ["i-corinthians", "Pauline Epistles"],
    ["ii-corinthians", "Pauline Epistles"],
    ["galatians", "Pauline Epistles"],
    ["ephesians", "Pauline Epistles"],
    ["philippians", "Pauline Epistles"],
    ["colossians", "Pauline Epistles"],
    ["i-thessalonians", "Pauline Epistles"],
    ["ii-thessalonians", "Pauline Epistles"],
    ["i-timothy", "Pauline Epistles"],
    ["ii-timothy", "Pauline Epistles"],
    ["titus", "Pauline Epistles"],
    ["philemon", "Pauline Epistles"],

    ["hebrews", "General Epistles"],
    ["james", "General Epistles"],
    ["i-peter", "General Epistles"],
    ["ii-peter", "General Epistles"],
    ["i-john", "General Epistles"],
    ["ii-john", "General Epistles"],
    ["iii-john", "General Epistles"],
    ["jude", "General Epistles"],

    ["revelation", "Prophetic"]
  ]);

  if(!categoryMap.has(key)){
    throw new Error(`Category error: ${key}`)
  }

  return categoryMap.get(key) as BookCategory;
}
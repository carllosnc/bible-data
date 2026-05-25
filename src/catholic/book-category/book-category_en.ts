import type { BookCategory } from "../../types";

export function getCategory_en(code: string): BookCategory {
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
    ["1-samuel", "Historical Books"],
    ["2-samuel", "Historical Books"],
    ["1-kings", "Historical Books"],
    ["2-kings", "Historical Books"],
    ["1-chronicles", "Historical Books"],
    ["2-chronicles", "Historical Books"],
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
    ["song-of-solomon", "Poetry and Wisdom"],
    ["wisdom-of-solomon", "Poetry and Wisdom"],
    ["ecclesiasticus", "Poetry and Wisdom"],

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
    ["1-corinthians", "Pauline Epistles"],
    ["2-corinthians", "Pauline Epistles"],
    ["galatians", "Pauline Epistles"],
    ["ephesians", "Pauline Epistles"],
    ["philippians", "Pauline Epistles"],
    ["colossians", "Pauline Epistles"],
    ["1-thessalonians", "Pauline Epistles"],
    ["2-thessalonians", "Pauline Epistles"],
    ["1-timothy", "Pauline Epistles"],
    ["2-timothy", "Pauline Epistles"],
    ["titus", "Pauline Epistles"],
    ["philemon", "Pauline Epistles"],

    ["hebrews", "General Epistles"],
    ["james", "General Epistles"],
    ["1-peter", "General Epistles"],
    ["2-peter", "General Epistles"],
    ["1-john", "General Epistles"],
    ["2-john", "General Epistles"],
    ["3-john", "General Epistles"],
    ["jude", "General Epistles"],

    ["revelation", "Prophetic"]
  ]);

  if(!categoryMap.has(key)){
    throw new Error(`Category error: ${key}`)
  }

  return categoryMap.get(key) as BookCategory;
}

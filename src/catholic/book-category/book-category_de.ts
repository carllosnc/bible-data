import type { BookCategory } from "../../types";

export function getCategory_de(code: string): BookCategory {
  const key = code.trim().toLowerCase();

  const categoryMap = new Map([
    ["das-buch-genesis", "Pentateuch"],
    ["das-buch-exodus", "Pentateuch"],
    ["das-buch-levitikus", "Pentateuch"],
    ["das-buch-numeri", "Pentateuch"],
    ["das-buch-deuteronomium", "Pentateuch"],

    ["josua", "Historical Books"],
    ["richter", "Historical Books"],
    ["rut", "Historical Books"],
    ["1-samuel", "Historical Books"],
    ["2-samuel", "Historical Books"],
    ["1-konige", "Historical Books"],
    ["2-konige", "Historical Books"],
    ["1-chronik", "Historical Books"],
    ["2-chronik", "Historical Books"],
    ["esra", "Historical Books"],
    ["nehemia", "Historical Books"],
    ["tobit", "Historical Books"],
    ["judit", "Historical Books"],
    ["ester", "Historical Books"],
    ["1-makkabaer", "Historical Books"],
    ["2-makkabaer", "Historical Books"],

    ["iob", "Poetry and Wisdom"],
    ["psalmen", "Poetry and Wisdom"],
    ["spruche", "Poetry and Wisdom"],
    ["kohelet", "Poetry and Wisdom"],
    ["hohelied", "Poetry and Wisdom"],
    ["weisheit", "Poetry and Wisdom"],
    ["sirach", "Poetry and Wisdom"],

    ["jesaja", "Major Prophets"],
    ["jeremia", "Major Prophets"],
    ["klagelieder", "Major Prophets"],
    ["baruch", "Major Prophets"],
    ["ezechiel", "Major Prophets"],
    ["daniel", "Major Prophets"],

    ["hosea", "Minor Prophets"],
    ["joel", "Minor Prophets"],
    ["amos", "Minor Prophets"],
    ["obadja", "Minor Prophets"],
    ["jona", "Minor Prophets"],
    ["micha", "Minor Prophets"],
    ["nahum", "Minor Prophets"],
    ["habakuk", "Minor Prophets"],
    ["zefanja", "Minor Prophets"],
    ["haggai", "Minor Prophets"],
    ["sacharja", "Minor Prophets"],
    ["maleachi", "Minor Prophets"],

    ["matthaus", "Gospels"],
    ["markus", "Gospels"],
    ["lukas", "Gospels"],
    ["johannes", "Gospels"],

    ["apostelgeschichte", "History"],

    ["romer", "Pauline Epistles"],
    ["1-korinther", "Pauline Epistles"],
    ["2-korinther", "Pauline Epistles"],
    ["galater", "Pauline Epistles"],
    ["epheser", "Pauline Epistles"],
    ["philipper", "Pauline Epistles"],
    ["kolosser", "Pauline Epistles"],
    ["1-thessalonicher", "Pauline Epistles"],
    ["2-thessalonicher", "Pauline Epistles"],
    ["1-timotheus", "Pauline Epistles"],
    ["2-timotheus", "Pauline Epistles"],
    ["titus", "Pauline Epistles"],
    ["philemon", "Pauline Epistles"],

    ["hebraer", "General Epistles"],
    ["jakobus", "General Epistles"],
    ["1-petrus", "General Epistles"],
    ["2-petrus", "General Epistles"],
    ["1-johannes", "General Epistles"],
    ["2-johannes", "General Epistles"],
    ["3-johannes", "General Epistles"],
    ["judas", "General Epistles"],

    ["offenbarung", "Prophetic"]
  ]);

  if(!categoryMap.has(key)){
    console.log("key here!", key)
    throw new Error(`Category error: ${key}`)
  }

  return categoryMap.get(key) as BookCategory;
}

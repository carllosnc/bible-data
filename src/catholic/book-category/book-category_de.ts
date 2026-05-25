import type { BookCategory } from "../../types";

export function getCategory_de(code: string): BookCategory {
  const key = code.trim().toLowerCase();

  const categoryMap = new Map([
    ["das-buch-genesis", "Pentateuch"],
    ["das-buch-exodus", "Pentateuch"],
    ["das-buch-levitikus", "Pentateuch"],
    ["das-buch-numeri", "Pentateuch"],
    ["das-buch-deuteronomium", "Pentateuch"],

    ["das-buch-josua", "Historical Books"],
    ["das-buch-der-richter", "Historical Books"],
    ["das-buch-rut", "Historical Books"],
    ["das-erste-buch-samuel", "Historical Books"],
    ["das-zweite-buch-samuel", "Historical Books"],
    ["das-erste-buch-der-konige", "Historical Books"],
    ["das-zweite-buch-der-konige", "Historical Books"],
    ["das-erste-buch-der-chronik", "Historical Books"],
    ["das-zweite-buch-der-chronik", "Historical Books"],
    ["das-buch-esra", "Historical Books"],
    ["das-buch-nehemia", "Historical Books"],
    ["das-buch-tobit", "Historical Books"],
    ["das-buch-judit", "Historical Books"],
    ["das-buch-ester", "Historical Books"],
    ["das-erste-buch-der-makkabaer", "Historical Books"],
    ["das-zweite-buch-der-makkabaer", "Historical Books"],

    ["das-buch-ijob", "Poetry and Wisdom"],
    ["die-psalmen", "Poetry and Wisdom"],
    ["das-buch-der-sprichworter", "Poetry and Wisdom"],
    ["das-buch-kohelet", "Poetry and Wisdom"],
    ["das-hohelied", "Poetry and Wisdom"],
    ["das-buch-der-weisheit", "Poetry and Wisdom"],
    ["das-buch-jesus-sirach", "Poetry and Wisdom"],

    ["das-buch-jesaja", "Major Prophets"],
    ["das-buch-jeremia", "Major Prophets"],
    ["die-klagelieder", "Major Prophets"],
    ["das-buch-baruch", "Major Prophets"],
    ["das-buch-ezechiel", "Major Prophets"],
    ["das-buch-daniel", "Major Prophets"],

    ["das-buch-hosea", "Minor Prophets"],
    ["das-buch-joel", "Minor Prophets"],
    ["das-buch-amos", "Minor Prophets"],
    ["das-buch-obadja", "Minor Prophets"],
    ["das-buch-jona", "Minor Prophets"],
    ["das-buch-micha", "Minor Prophets"],
    ["das-buch-nahum", "Minor Prophets"],
    ["das-buch-habakuk", "Minor Prophets"],
    ["das-buch-zefanja", "Minor Prophets"],
    ["das-buch-haggai", "Minor Prophets"],
    ["das-buch-sacharja", "Minor Prophets"],
    ["das-buch-maleachi", "Minor Prophets"],

    ["das-evangelium-nach-matthaus", "Gospels"],
    ["das-evangelium-nach-markus", "Gospels"],
    ["das-evangelium-nach-lukas", "Gospels"],
    ["das-evangelium-nach-johannes", "Gospels"],

    ["die-apostelgeschichte", "History"],

    ["der-brief-an-die-romer", "Pauline Epistles"],
    ["der-erste-brief-an-die-korinther", "Pauline Epistles"],
    ["der-zweite-brief-an-die-korinther", "Pauline Epistles"],
    ["der-brief-an-die-galater", "Pauline Epistles"],
    ["der-brief-an-die-epheser", "Pauline Epistles"],
    ["der-brief-an-die-philipper", "Pauline Epistles"],
    ["der-brief-an-die-kolosser", "Pauline Epistles"],
    ["der-erste-brief-an-die-thessalonicher", "Pauline Epistles"],
    ["der-zweite-brief-an-die-thessalonicher", "Pauline Epistles"],
    ["der-erste-brief-an-timotheus", "Pauline Epistles"],
    ["der-zweite-brief-an-timotheus", "Pauline Epistles"],
    ["der-brief-an-titus", "Pauline Epistles"],
    ["der-brief-an-philemon", "Pauline Epistles"],

    ["der-brief-an-die-hebraer", "General Epistles"],
    ["der-brief-des-jakobus", "General Epistles"],
    ["der-erste-brief-des-petrus", "General Epistles"],
    ["der-zweite-brief-des-petrus", "General Epistles"],
    ["der-erste-brief-des-johannes", "General Epistles"],
    ["der-zweite-brief-des-johannes", "General Epistles"],
    ["der-dritte-brief-des-johannes", "General Epistles"],
    ["der-brief-des-judas", "General Epistles"],

    ["die-offenbarung-des-johannes", "Prophetic"]
  ]);

  if(!categoryMap.has(key)){
    throw new Error(`Category error: ${key}`)
  }

  return categoryMap.get(key) as BookCategory;
}

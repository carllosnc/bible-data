import type { BookCategory } from "../../types";

export function getCategory_la(code: string): BookCategory {
  const key = code.trim().toLowerCase();

  const categoryMap = new Map([
    ["liber-genesis", "Pentateuch"],
    ["liber-exodus", "Pentateuch"],
    ["liber-leviticus", "Pentateuch"],
    ["liber-numeri", "Pentateuch"],
    ["liber-deuteronomii", "Pentateuch"],

    ["liber-iosue", "Historical Books"],
    ["liber-iudicum", "Historical Books"],
    ["liber-ruth", "Historical Books"],
    ["liber-i-samuelis", "Historical Books"],
    ["liber-ii-samuelis", "Historical Books"],
    ["liber-i-regum", "Historical Books"],
    ["liber-ii-regum", "Historical Books"],
    ["liber-i-paralipomenon", "Historical Books"],
    ["liber-ii-paralipomenon", "Historical Books"],
    ["liber-esdrae", "Historical Books"],
    ["liber-nehemiae", "Historical Books"],
    ["liber-thobis", "Historical Books"],
    ["liber-iudith", "Historical Books"],
    ["liber-esther", "Historical Books"],
    ["liber-i-maccabaeorum", "Historical Books"],
    ["liber-ii-maccabaeorum", "Historical Books"],

    ["liber-iob", "Poetry and Wisdom"],
    ["liber-psalmorum", "Poetry and Wisdom"],
    ["liber-proverbiorum", "Poetry and Wisdom"],
    ["liber-ecclesiastes", "Poetry and Wisdom"],
    ["canticum-canticorum", "Poetry and Wisdom"],
    ["liber-sapientiae", "Poetry and Wisdom"],
    ["liber-ecclesiasticus", "Poetry and Wisdom"],

    ["liber-isaiae", "Major Prophets"],
    ["liber-ieremiae", "Major Prophets"],
    ["lamentationes", "Major Prophets"],
    ["liber-baruch", "Major Prophets"],
    ["prophetia-ezechielis", "Major Prophets"],
    ["prophetia-danielis", "Major Prophets"],

    ["prophetia-osee", "Minor Prophets"],
    ["prophetia-ioel", "Minor Prophets"],
    ["prophetia-amos", "Minor Prophets"],
    ["prophetia-abdiae", "Minor Prophets"],
    ["prophetia-ionae", "Minor Prophets"],
    ["prophetia-michaeae", "Minor Prophets"],
    ["prophetia-nahum", "Minor Prophets"],
    ["prophetia-habacuc", "Minor Prophets"],
    ["prophetia-sophoniae", "Minor Prophets"],
    ["prophetia-aggaei", "Minor Prophets"],
    ["prophetia-zachariae", "Minor Prophets"],
    ["prophetia-malachiae", "Minor Prophets"],

    ["evangelium-secundum-matthaeum", "Gospels"],
    ["evangelium-secundum-marcum", "Gospels"],
    ["evangelium-secundum-lucam", "Gospels"],
    ["evangelium-secundum-ioannem", "Gospels"],

    ["actus-apostolorum", "History"],

    ["epistula-ad-romanos", "Pauline Epistles"],
    ["epistula-i-ad-corinthios", "Pauline Epistles"],
    ["epistula-ii-ad-corinthios", "Pauline Epistles"],
    ["epistula-ad-galatas", "Pauline Epistles"],
    ["epistula-ad-ephesios", "Pauline Epistles"],
    ["epistula-ad-philippenses", "Pauline Epistles"],
    ["epistula-ad-colossenses", "Pauline Epistles"],
    ["epistula-i-ad-thessalonicenses", "Pauline Epistles"],
    ["epistula-ii-ad-thessalonicenses", "Pauline Epistles"],
    ["epistula-i-ad-timotheum", "Pauline Epistles"],
    ["epistula-ii-ad-timotheum", "Pauline Epistles"],
    ["epistula-ad-titum", "Pauline Epistles"],
    ["epistulam-ad-philemonem", "Pauline Epistles"],

    ["epistula-ad-hebraeos", "General Epistles"],
    ["epistula-iacobi", "General Epistles"],
    ["epistula-i-petri", "General Epistles"],
    ["epistula-ii-petri", "General Epistles"],
    ["epistula-i-ioannis", "General Epistles"],
    ["epistula-ii-ioannis", "General Epistles"],
    ["epistula-iii-ioannis", "General Epistles"],
    ["epistula-iudae", "General Epistles"],

    ["apocalypsis-ioannis", "Prophetic"]
  ]);

  if(!categoryMap.has(key)){
    throw new Error(`Category error: ${key}`)
  }

  return categoryMap.get(key) as BookCategory;
}

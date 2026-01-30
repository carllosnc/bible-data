import type { BookCategory } from "../types";

export function getCategory(code: string): BookCategory {
  const key = code.trim().toLowerCase();

  const categoryMap = new Map([
    // ==================== ANTIGO TESTAMENTO ====================

    // Pentateuco
    ["gn", "Pentateuch"],        // Gênesis / Genesis
    ["ex", "Pentateuch"],        // Êxodo / Exodus
    ["lv", "Pentateuch"],        // Levítico / Leviticus
    ["nm", "Pentateuch"],        // Números / Numbers
    ["dt", "Pentateuch"],        // Deuteronômio / Deuteronomy

    // Livros Históricos
    ["js", "Historical Books"], // Josué / Joshua
    ["jz", "Historical Books"], // Juízes / Judges
    ["rt", "Historical Books"], // Rute / Ruth
    ["1sm", "Historical Books"], // 1 Samuel
    ["2sm", "Historical Books"], // 2 Samuel
    ["1rs", "Historical Books"], // 1 Reis / 1 Kings
    ["2rs", "Historical Books"], // 2 Reis / 2 Kings
    ["1cr", "Historical Books"], // 1 Crônicas / 1 Chronicles
    ["2cr", "Historical Books"], // 2 Crônicas / 2 Chronicles
    ["ed", "Historical Books"],  // Esdras / Ezra
    ["ne", "Historical Books"],  // Neemias / Nehemiah
    ["et", "Historical Books"],  // Ester / Esther

    // Poesia e Sabedoria
    ["jó", "Poetry and Wisdom"], // Jó / Job
    ["sl", "Poetry and Wisdom"], // Salmos / Psalms
    ["pv", "Poetry and Wisdom"], // Provérbios / Proverbs
    ["ec", "Poetry and Wisdom"], // Eclesiastes / Ecclesiastes
    ["ct", "Poetry and Wisdom"], // Cântico dos Cânticos / Song of Songs

    // Profetas Maiores
    ["is", "Major Prophets"],    // Isaías / Isaiah
    ["jr", "Major Prophets"],    // Jeremias / Jeremiah
    ["lm", "Major Prophets"],    // Lamentações / Lamentations
    ["ez", "Major Prophets"],    // Ezequiel / Ezekiel
    ["dn", "Major Prophets"],    // Daniel / Daniel

    // Profetas Menores
    ["os", "Minor Prophets"],    // Oseias / Hosea
    ["jl", "Minor Prophets"],    // Joel
    ["am", "Minor Prophets"],    // Amós / Amos
    ["ob", "Minor Prophets"],    // Obadias / Obadiah
    ["jn", "Minor Prophets"],    // Jonas / Jonah
    ["mq", "Minor Prophets"],    // Miqueias / Micah
    ["na", "Minor Prophets"],    // Naum / Nahum
    ["hc", "Minor Prophets"],    // Habacuque / Habakkuk
    ["sf", "Minor Prophets"],    // Sofonias / Zephaniah
    ["ag", "Minor Prophets"],    // Ageu / Haggai
    ["zc", "Minor Prophets"],    // Zacarias / Zechariah
    ["ml", "Minor Prophets"],    // Malaquias / Malachi

    // ==================== NOVO TESTAMENTO ====================

    // Evangelhos
    ["mt", "Gospels"],           // Mateus / Matthew
    ["mc", "Gospels"],           // Marcos / Mark
    ["lc", "Gospels"],           // Lucas / Luke
    ["jo", "Gospels"],           // João / John

    ["atos", "History"],           // Atos / Acts

    // Epístolas Paulinas
    ["rm", "Pauline Epistles"],  // Romanos / Romans
    ["1co", "Pauline Epistles"], // 1 Coríntios
    ["2co", "Pauline Epistles"], // 2 Coríntios
    ["gl", "Pauline Epistles"],  // Gálatas / Galatians
    ["ef", "Pauline Epistles"],  // Efésios / Ephesians
    ["fp", "Pauline Epistles"],  // Filipenses / Philippians
    ["cl", "Pauline Epistles"],  // Colossenses / Colossians
    ["1ts", "Pauline Epistles"], // 1 Tessalonicenses
    ["2ts", "Pauline Epistles"], // 2 Tessalonicenses
    ["1tm", "Pauline Epistles"], // 1 Timóteo
    ["2tm", "Pauline Epistles"], // 2 Timóteo
    ["tt", "Pauline Epistles"],  // Tito / Titus
    ["fm", "Pauline Epistles"],  // Filemom / Philemon

    // Epístolas Gerais
    ["hb", "General Epistles"],  // Hebreus / Hebrews
    ["tg", "General Epistles"],  // Tiago / James
    ["1pe", "General Epistles"], // 1 Pedro
    ["2pe", "General Epistles"], // 2 Pedro
    ["1jo", "General Epistles"], // 1 João
    ["2jo", "General Epistles"], // 2 João
    ["3jo", "General Epistles"], // 3 João
    ["jd", "General Epistles"],  // Judas / Jude

    // Apocalipse
    ["ap", "Prophetic"]         // Apocalipse / Revelation
  ]);

  if(!categoryMap.has(key)){
    throw new Error(`Category error: ${key}`)
  }

  return categoryMap.get(key) as BookCategory;
}
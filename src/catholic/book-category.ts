import type { BookCategory } from "../types";

export function getCategory(code: string): BookCategory {
  const key = code.trim().toLowerCase();

  const categoryMap = new Map([
    ["gn", "Pentateuch"],
    ["ex", "Pentateuch"],
    ["lv", "Pentateuch"],
    ["nm", "Pentateuch"],
    ["dt", "Pentateuch"],

    ["js", "Historical Books"],
    ["jz", "Historical Books"],
    ["rt", "Historical Books"],
    ["1sm", "Historical Books"],
    ["2sm", "Historical Books"],
    ["1rs", "Historical Books"],
    ["2rs", "Historical Books"],
    ["1cr", "Historical Books"],
    ["2cr", "Historical Books"],
    ["ed", "Historical Books"],
    ["ne", "Historical Books"],
    ["et", "Historical Books"],

    ["jó", "Poetry and Wisdom"],
    ["sl", "Poetry and Wisdom"],
    ["pv", "Poetry and Wisdom"],
    ["ec", "Poetry and Wisdom"],
    ["ct", "Poetry and Wisdom"],

    ["is", "Major Prophets"],
    ["jr", "Major Prophets"],
    ["lm", "Major Prophets"],
    ["ez", "Major Prophets"],
    ["dn", "Major Prophets"],

    ["os", "Minor Prophets"],
    ["jl", "Minor Prophets"],
    ["am", "Minor Prophets"],
    ["ob", "Minor Prophets"],
    ["jn", "Minor Prophets"],
    ["mq", "Minor Prophets"],
    ["na", "Minor Prophets"],
    ["hc", "Minor Prophets"],
    ["sf", "Minor Prophets"],
    ["ag", "Minor Prophets"],
    ["zc", "Minor Prophets"],
    ["ml", "Minor Prophets"],

    ["mt", "Gospels"],
    ["mc", "Gospels"],
    ["lc", "Gospels"],
    ["jo", "Gospels"],

    ["atos", "History"],

    ["rm", "Pauline Epistles"],
    ["1co", "Pauline Epistles"],
    ["2co", "Pauline Epistles"],
    ["gl", "Pauline Epistles"],
    ["ef", "Pauline Epistles"],
    ["fp", "Pauline Epistles"],
    ["cl", "Pauline Epistles"],
    ["1ts", "Pauline Epistles"],
    ["2ts", "Pauline Epistles"],
    ["1tm", "Pauline Epistles"],
    ["2tm", "Pauline Epistles"],
    ["tt", "Pauline Epistles"],
    ["fm", "Pauline Epistles"],

    ["hb", "General Epistles"],
    ["tg", "General Epistles"],
    ["1pe", "General Epistles"],
    ["2pe", "General Epistles"],
    ["1jo", "General Epistles"],
    ["2jo", "General Epistles"],
    ["3jo", "General Epistles"],
    ["jd", "General Epistles"],

    ["ap", "Prophetic"]
  ]);

  if(!categoryMap.has(key)){
    throw new Error(`Category error: ${key}`)
  }

  return categoryMap.get(key) as BookCategory;
}
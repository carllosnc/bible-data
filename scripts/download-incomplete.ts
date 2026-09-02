import type { Bible, BibleCategory, VersionEntry, VersionGroup } from "../src/types";
import { getBible } from "../src/protestant/scrapper";
import { saveBible } from "../src/save";
import rawVersions from "../src/protestant/version.json";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const protestantVersions = rawVersions as unknown as VersionGroup[];
const booksJson = JSON.parse(readFileSync("src/protestant/books.json", "utf-8"));

const allBibles: Bible[] = [];
for (const group of protestantVersions) {
  const langCode = Object.keys(group).find((k) => k !== "name" && k !== "category");
  if (!langCode) continue;
  const versions = group[langCode] as VersionEntry[];
  for (const v of versions) {
    allBibles.push({
      id: v.abbrev,
      name: v.name,
      lang: langCode,
      category: group.category as BibleCategory,
      books: [],
    });
  }
}

const incompleteBibles: Bible[] = [];

for (const bible of allBibles) {
  const lang = bible.lang;
  const id = bible.id;
  if (!booksJson[lang]) continue;

  const expectedCount = Object.keys(booksJson[lang]).length;
  const jsonPath = join("output/protestant/json", lang, `bible-${id}.json`);

  try {
    const data = JSON.parse(readFileSync(jsonPath, "utf-8"));
    const actualCount = data.books?.length ?? 0;
    if (actualCount !== expectedCount) {
      incompleteBibles.push(bible);
    }
  } catch {
    incompleteBibles.push(bible);
  }
}

console.log(`Bíblias incompletas encontradas: ${incompleteBibles.length}\n`);
for (const b of incompleteBibles) {
  console.log(`  - ${b.id} (${b.name}, ${b.lang})`);
}

console.log(`\nIniciando download...\n`);

async function main() {
  for (let i = 0; i < incompleteBibles.length; i++) {
    const bible = incompleteBibles[i];
    console.log(`[${i + 1}/${incompleteBibles.length}] ${bible.name} (${bible.id}, ${bible.lang})...`);
    try {
      await saveBible(bible, getBible);
      console.log(`  ✅ Concluído\n`);
    } catch (e) {
      console.log(`  ❌ Falhou: ${e}\n`);
    }
    await new Promise((r) => setTimeout(r, 2000));
  }
  console.log("Todos os downloads concluídos!");
}

main().catch(console.error);
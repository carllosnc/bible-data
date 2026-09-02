import type { Bible } from './types';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { readdir, readFile } from 'node:fs/promises';
import { Database } from 'bun:sqlite';
import { getProtestantBookName } from './protestant/books';
import { getCatholicBookName } from './catholic/books';

function updateSqliteFast(category: string, lang: string, bibleId: string, bookNameMap: Map<string, string>) {
  const dbPath = `output/${category}/sqlite/${lang}/bible-${bibleId}.sqlite`;
  if (!existsSync(dbPath)) return;

  try {
    const db = new Database(dbPath);
    db.exec('BEGIN TRANSACTION;');
    const updateBookStmt = db.prepare('UPDATE books SET name = ? WHERE abbrev = ?;');
    const updateVerseStmt = db.prepare('UPDATE verses SET book_name = ? WHERE book_abbrev = ?;');

    for (const [abbrev, newName] of bookNameMap.entries()) {
      updateBookStmt.run(newName, abbrev);
      updateVerseStmt.run(newName, abbrev);
    }
    db.exec('COMMIT;');
    db.close();
  } catch (e: any) {
    console.error(`Error updating SQLite for ${bibleId}: ${e.message}`);
  }
}

export async function updateAllOutputFiles() {
  console.log('Starting fast migration of all output files...');

  // Process Protestant JSONs
  const protestantBase = 'output/protestant/json';
  try {
    const langs = await readdir(protestantBase);
    for (const lang of langs) {
      const langDir = join(protestantBase, lang);
      const files = await readdir(langDir);
      for (const file of files) {
        if (!file.endsWith('.json')) continue;
        const filePath = join(langDir, file);
        const content = await readFile(filePath, 'utf-8');
        const bible: Bible = JSON.parse(content);

        let updated = false;
        const updatedBooksMap = new Map<string, string>();

        for (const book of bible.books) {
          const nativeName = getProtestantBookName(bible.lang, book.abbrev);
          if (nativeName && book.name !== nativeName) {
            book.name = nativeName;
            updated = true;
          }
          updatedBooksMap.set(book.abbrev, book.name);
        }

        if (updated) {
          console.log(`Updating Protestant ${bible.lang}/${bible.id}...`);
          // Save JSON
          await Bun.write(filePath, JSON.stringify(bible, null, 2));

          // Save GZ
          const gzPath = `output/protestant/gzip/${bible.lang}/bible-${bible.id}.gz`;
          await Bun.write(gzPath, Bun.gzipSync(JSON.stringify(bible)));

          // Save SQLite fast
          updateSqliteFast('protestant', bible.lang, bible.id, updatedBooksMap);
        }
      }
    }
  } catch (e: any) {
    console.error(`Error processing Protestant outputs: ${e.message}`);
  }

  // Process Catholic JSONs
  const catholicBase = 'output/catholic/json';
  try {
    const langs = await readdir(catholicBase);
    for (const lang of langs) {
      const langDir = join(catholicBase, lang);
      const files = await readdir(langDir);
      for (const file of files) {
        if (!file.endsWith('.json')) continue;
        const filePath = join(langDir, file);
        const content = await readFile(filePath, 'utf-8');
        const bible: Bible = JSON.parse(content);

        let updated = false;
        const updatedBooksMap = new Map<string, string>();

        for (const book of bible.books) {
          const nativeName = getCatholicBookName(bible.lang, book.abbrev);
          if (nativeName && book.name !== nativeName) {
            book.name = nativeName;
            updated = true;
          }
          updatedBooksMap.set(book.abbrev, book.name);
        }

        if (updated) {
          console.log(`Updating Catholic ${bible.lang}/${bible.id}...`);
          // Save JSON
          await Bun.write(filePath, JSON.stringify(bible, null, 2));

          // Save GZ
          const gzPath = `output/catholic/gzip/${bible.lang}/bible-${bible.id}.gz`;
          await Bun.write(gzPath, Bun.gzipSync(JSON.stringify(bible)));

          // Save SQLite fast
          updateSqliteFast('catholic', bible.lang, bible.id, updatedBooksMap);
        }
      }
    }
  } catch (e: any) {
    console.error(`Error processing Catholic outputs: ${e.message}`);
  }

  console.log('Fast migration complete!');
}

if (import.meta.main) {
  updateAllOutputFiles().catch(console.error);
}

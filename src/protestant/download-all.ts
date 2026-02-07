import { mkdir } from "node:fs/promises"
import type { Bible } from '../types'
import { getBible } from './scrapper'
import { saveAsSqlite } from '../sqlite-action'
import protestantVersions from './version.json'

async function saveBible(bible: Bible, action: (bible: Bible) => Promise<Bible>): Promise<void> {
  try {
    console.log(`Starting to save Bible: ${bible.name} (${bible.lang})`)

    const bibleResult = await action(bible)

    // Create output directories
    const category = bible.category.toLowerCase();
    await mkdir(`output/${category}/json/${bible.lang}/`, {recursive: true})
    await mkdir(`output/${category}/gzip/${bible.lang}/`, {recursive: true})

    // Save as JSON
    console.log('Saving as JSON...')
    const fileJson = Bun.file(`output/${category}/json/${bible.lang}/bible-${bible.id}.json`)
    await fileJson.write(JSON.stringify(bibleResult, null, 2))

    // Save as gzipped JSON
    console.log('Saving as gzipped JSON...')
    const fileGz = Bun.file(`output/${category}/gzip/${bible.lang}/bible-${bible.id}.gz`)
    await fileGz.write(Bun.gzipSync(JSON.stringify(bibleResult)))

    // Save as SQLite
    console.log('Saving as SQLite...')
    await saveAsSqlite(bibleResult)

    console.log(`Bible ${bible.name} (${bible.lang}) saved successfully.`)
  } catch (error) {
    console.error(`Failed to save Bible ${bible.name}:`, error)
  }
}

async function main() {
  console.log('Starting bulk download of all Protestant bibles...');

  // Flatten the versions list
  const allVersions: Bible[] = [];

  for (const group of protestantVersions) {
     // Find the language code key (e.g., 'pt-BR', 'en')
    const langCode = Object.keys(group).find(k => k !== 'name' && k !== 'category');
    if (!langCode) {
        console.warn(`Skipping group ${group.name}: No language code found.`);
        continue;
    }

    const versions = (group as any)[langCode] as Array<{name: string, abbrev: string}>;

    for (const v of versions) {
        allVersions.push({
            id: v.abbrev,
            name: v.name,
            lang: langCode,
            category: group.category as any,
            books: []
        });
    }
  }

  console.log(`Found ${allVersions.length} bibles to download.`);

  for (let i = 0; i < allVersions.length; i++) {
      const bible = allVersions[i];
      console.log(`[${i + 1}/${allVersions.length}] Processing ${bible.name}...`);
      await saveBible(bible, getBible);

      // Small delay to prevent rate limiting
      await new Promise(resolve => setTimeout(resolve, 2000));
  }

  console.log('All downloads completed.');
}

main().catch(console.error)

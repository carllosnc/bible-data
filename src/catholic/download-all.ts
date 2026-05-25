import type { Bible, BibleCategory, VersionEntry, VersionGroup } from '../types'
import { getBible } from './scrapper'
import { saveBible } from '../save'
import rawVersions from './version.json'

const catholicVersions = rawVersions as unknown as VersionGroup[];

async function main() {
  console.log('Starting bulk download of all Catholic bibles...');

  const allVersions: Bible[] = [];

  for (const group of catholicVersions) {
    const langCode = Object.keys(group).find(k => k !== 'name' && k !== 'category');
    if (!langCode) {
        console.warn(`Skipping group ${group.name}: No language code found.`);
        continue;
    }

    const versions = group[langCode] as VersionEntry[];

    for (const v of versions) {
        allVersions.push({
            id: v.abbrev,
            name: v.name,
            lang: langCode,
            category: group.category as BibleCategory,
            books: []
        });
    }
  }

  console.log(`Found ${allVersions.length} bibles to download.`);

  for (let i = 0; i < allVersions.length; i++) {
      const bible = allVersions[i];
      console.log(`[${i + 1}/${allVersions.length}] Processing ${bible.name}...`);
      await saveBible(bible, getBible);

      await new Promise(resolve => setTimeout(resolve, 2000));
  }

  console.log('All downloads completed.');
}

main().catch(console.error)

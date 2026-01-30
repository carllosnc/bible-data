import type { Bible } from "./types";
import { mkdir } from "node:fs/promises";
import { saveAsSqlite } from "./sqlite-action";

export async function saveBible(bible: Bible, action: (bible: Bible) => Promise<Bible>): Promise<void> {
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
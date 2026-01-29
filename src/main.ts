import { mkdir } from "node:fs/promises"
import type { Bible } from './types'
import { getBible } from './providers/protestant'
import { saveAsSqlite } from './sqlite'



async function saveBible(bible: Bible, action: (bible: Bible) => Promise<Bible>): Promise<void> {
  try {
    console.log(`Starting to save Bible: ${bible.name} (${bible.name})`)

    const bibleResult = await action(bible)

    // Create output directories
    await mkdir(`output/json/${bible.lang}/`, {recursive: true})
    await mkdir(`output/gzip/${bible.lang}/`, {recursive: true})

    // Save as JSON
    console.log('Saving as JSON...')
    const fileJson = Bun.file(`output/json/${bible.lang}/bible-${bible.name}.json`)
    await fileJson.write(JSON.stringify(bibleResult))

    // Save as gzipped JSON
    console.log('Saving as gzipped JSON...')
    const fileGz = Bun.file(`output/gzip/${bible.lang}/bible-${bible.name}.gz`)
    await fileGz.write(Bun.gzipSync(JSON.stringify(bibleResult)))

    // Save as SQLite
    console.log('Saving as SQLite...')
    await saveAsSqlite(bibleResult)

    console.log(`Bible ${bible.name} (${bible.lang}) saved successfully.`)
  } catch (error) {
    console.error(`Failed to save Bible ${bible.name}:`, error)
  }
}

// Run the scraper
async function main() {
  // await saveBible({
  //   id: 'bkj',
  //   name: 'king-james',
  //   lang: 'pt-BR',
  //   category: 'Protestant',
  //   books: []
  // }, getBible)

  await saveBible({
    id: 'acv',
    name: 'A Conservative Version',
    lang: 'en',
    category: 'Protestant',
    books: []
  }, getBible)
}

main().catch(console.error)

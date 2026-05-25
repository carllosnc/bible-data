import type { Bible } from '../types'
import { getBible } from './scrapper'
import { saveBible } from '../save'
import { selectBibleVersion } from './select-version'

export async function run() {
  const bibleSelection = await selectBibleVersion();
  await saveBible(bibleSelection as Bible, getBible)
}

if (import.meta.main) {
  run().catch(console.error)
}

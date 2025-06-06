import { expect, test } from 'bun:test'
import BibleKingJames from '../output/json/pt-BR/bible-king-james.json'
import type { Bible } from '../src/types'
import Database from 'bun:sqlite'
import { file } from 'bun'

test("Bible King James JSON", () => {
  const bible: Bible = BibleKingJames

  expect(bible.books.length).toBe(66)
})

test("Bible King James Gzip", async () => {
  const compressedData = await file('./output/gzip/pt-BR/bible-king-james.gz').arrayBuffer()
  const decompressedData = Bun.gunzipSync(compressedData)
  const decompressedDataString = new TextDecoder().decode(decompressedData)
  const bible: Bible = JSON.parse(decompressedDataString)

  expect(bible.books.length).toBe(66)
})

test("Bible King James SQLite", async () => {
  const db = new Database('./output/sqlite/pt-BR/bible-king-james.sqlite')
  const books = db.prepare('SELECT * FROM books').all()

  expect(books.length).toBe(66)
})


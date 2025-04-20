import { expect, test } from 'bun:test'
import BibleKingJames from '../output/json/pt-BR/bible-king-james.json'
import type { Bible } from '../src/types'

test("Bible King James", () => {
  const bible: Bible = BibleKingJames

  expect(bible.books.length).toBe(66)
})

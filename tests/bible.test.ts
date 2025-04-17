import { expect, test } from 'bun:test'
import BibleKingJames from '../output/json/pt-BR/bible-king-james.json'
import BibleVersaoCatolica from '../output/json/pt-BR/bible-versao-catolica.json'
import type { Bible } from '../src/types'

test("Bible King James", () => {
  const bible: Bible = BibleKingJames

  expect(bible.lang).toBe('pt-BR')
  expect(bible.books.length).toBe(66)
})

test("Bible Versão Católica", () => {
  const bible: Bible = BibleVersaoCatolica

  expect(bible.lang).toBe('pt-BR')
  expect(bible.books.length).toBe(66)
})

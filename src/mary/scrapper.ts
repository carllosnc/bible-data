import * as cheerio from 'cheerio'
import { mkdir } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import type { RawPage } from './types'

const USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36'

export const SOURCE = {
  url: 'https://www.gospels.net/mary',
  files: {
    en: 'output/apocryphal/mary/raw/mary.html',
    pt: 'output/apocryphal/mary/raw/mary-pt.html',
  },
}

function cleanText(raw: string): string {
  return raw
    .replace(/\x1b\[[0-9;]*m/g, '')
    .replace(/\[0m/g, '')
    .replace(/\[7m/g, '')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#(\d+);/g, (_, d: string) => String.fromCharCode(Number(d)))
    .replace(/\u00a0/g, ' ')
    .replace(/;\n/g, '\n')
    .replace(/ *[\n]+ */g, '\n')
    .replace(/[ \t]+/g, ' ')
    .trim()
}

export async function getSource(lang: 'en' | 'pt' = 'en', force = false): Promise<string> {
  const file = SOURCE.files[lang]
  if (!force && existsSync(file)) {
    return await Bun.file(file).text()
  }
  await mkdir('output/apocryphal/mary/raw', { recursive: true })

  if (lang === 'pt') {
    const ptFile = SOURCE.files.pt
    if (existsSync(ptFile)) {
      return await Bun.file(ptFile).text()
    }
    throw new Error('Portuguese file not found')
  }

  const response = await fetch(SOURCE.url, { headers: { 'User-Agent': USER_AGENT } })
  if (!response.ok) {
    throw new Error(`Failed to fetch ${SOURCE.url}: HTTP ${response.status}`)
  }
  const html = await response.text()
  await Bun.write(file, html)
  return html
}

const PAGE_MARKER_RE = /<strong>(\d{1,2})<\/strong>&nbsp;/g

export function parsePages(html: string): RawPage[] {
  const $ = cheerio.load(html)
  const contentDiv = $('.sqs-html-content')
  if (!contentDiv.length) {
    throw new Error('Could not find content block in HTML')
  }

  const contentHtml = contentDiv.html() || ''

  const pagePositions: { page: number; pos: number }[] = []
  let m: RegExpExecArray | null
  while ((m = PAGE_MARKER_RE.exec(contentHtml)) !== null) {
    const num = Number(m[1])
    if (num >= 7 && num <= 19) {
      pagePositions.push({ page: num, pos: m.index + m[0].length })
    }
  }

  const pages: RawPage[] = []
  for (let i = 0; i < pagePositions.length; i++) {
    const start = pagePositions[i].pos
    const end = i + 1 < pagePositions.length ? pagePositions[i + 1].pos - 100 : contentHtml.length
    const chunk = contentHtml.substring(start, Math.min(end, contentHtml.length))

    const chunk$ = cheerio.load(chunk)
    const paragraphs: string[] = []
    chunk$('p').each((_, el) => {
      const html = chunk$(el).html() || ''
      const withBreaks = html
        .replace(/<br\s*\/?>/gi, '\n')
        .replace(/<[^>]+>/g, '')
      const text = cleanText(withBreaks)
      if (text && !/^(Notes on Translation|The Gospel according to Mary|Pages? \d)/i.test(text) && !/^[A-Z][a-z]+$/i.test(text) && text.length > 1 && !/^(The Gospel|Mary and Jesus|Conflict over Authority|Overcoming the Powers|An Eternal Perspective|The GospelAccording toMary)$/i.test(text)) {
        paragraphs.push(text)
      }
    })

    if (paragraphs.length) {
      pages.push({
        number: pagePositions[i].page,
        heading: '',
        paragraphs,
      })
    }
  }

  return pages
}

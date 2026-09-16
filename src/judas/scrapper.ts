import * as cheerio from 'cheerio'
import { mkdir } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import type { RawSection } from './types'

const USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36'

export const SOURCE = {
  url: 'https://www.gospels.net/judas',
  file: 'output/apocryphal/judas/raw/judas.html',
}

function cleanText(raw: string): string {
  return raw
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#(\d+);/g, (_, d: string) => String.fromCharCode(Number(d)))
    .replace(/\u00a0/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

export async function getSource(force = false): Promise<string> {
  if (!force && existsSync(SOURCE.file)) {
    return await Bun.file(SOURCE.file).text()
  }
  await mkdir('output/apocryphal/judas/raw', { recursive: true })
  const response = await fetch(SOURCE.url, { headers: { 'User-Agent': USER_AGENT } })
  if (!response.ok) {
    throw new Error(`Failed to fetch ${SOURCE.url}: HTTP ${response.status}`)
  }
  const html = await response.text()
  await Bun.write(SOURCE.file, html)
  return html
}

const PAGE_MARKER_RE = /<strong>\s*(\d{2,3})\s*<\/strong>\s*(?:&nbsp;|\s)*/g

function extractNotesFromHtml(html: string): string[] {
  const notes: string[] = []
  const notesMatch = html.match(/Notes on Translation<\/strong>[\s\S]*$/i)
  if (!notesMatch) return notes

  const notesHtml = notesMatch[0]
  const chunk$ = cheerio.load(notesHtml)
  chunk$('p').each((_, el) => {
    const text = cleanText(chunk$(el).text())
    if (text && !/^Notes on Translation$/i.test(text)) {
      notes.push(text)
    }
  })
  return notes
}

export function parseSections(html: string): RawSection[] {
  const $ = cheerio.load(html)
  const contentDiv = $('.sqs-html-content')
  if (!contentDiv.length) {
    throw new Error('Could not find content block in HTML')
  }

  const contentHtml = contentDiv.html() || ''

  const pagePositions: { page: number; markerStart: number; contentStart: number }[] = []
  let m: RegExpExecArray | null
  let firstPage33Skipped = false
  while ((m = PAGE_MARKER_RE.exec(contentHtml)) !== null) {
    const num = Number(m[1])
    if (num >= 33 && num <= 58) {
      if (num === 33 && !firstPage33Skipped) {
        firstPage33Skipped = true
        continue
      }
      pagePositions.push({ page: num, markerStart: m.index, contentStart: m.index + m[0].length })
    }
  }

  const sections: RawSection[] = []
  for (let i = 0; i < pagePositions.length; i++) {
    const start = pagePositions[i].contentStart
    const end = i + 1 < pagePositions.length ? pagePositions[i + 1].markerStart : contentHtml.length
    const chunk = contentHtml
      .substring(start, Math.min(end, contentHtml.length))
      .replace(/<strong>\s*\d{2,3}\s*<\/strong>/g, '')

    const chunk$ = cheerio.load(chunk)
    const paragraphs: string[] = []
    chunk$('p').each((_, el) => {
      const text = cleanText(chunk$(el).text())
      if (text) {
        if (/^Notes on Translation$/i.test(text) || /^The Gospel\s*of\s*Judas$/i.test(text)) {
          return false
        }
        paragraphs.push(text)
      }
    })

    if (!paragraphs.length) {
      const fallback = cleanText(chunk$.text())
      if (fallback) paragraphs.push(fallback)
    }

    sections.push({
      page: pagePositions[i].page,
      heading: '',
      paragraphs,
      notes: [],
    })
  }

  const notesContent = extractNotesFromHtml(contentHtml)
  if (notesContent.length && sections.length) {
    sections[sections.length - 1].notes = notesContent
  }

  return sections
}

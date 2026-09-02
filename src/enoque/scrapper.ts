import { mkdir } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import type { Lang, RawVerse } from './types'

const USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36'

export const SOURCES: Record<Lang, { url: string; file: string }> = {
  pt: { url: 'https://faithofgod.net/1ENOQUE.html', file: 'output/enoque/raw/1ENOQUE.html' },
  en: { url: 'https://faithofgod.net/1ENOCH.html', file: 'output/enoque/raw/1ENOCH.html' },
}

const VERSE_RE =
  /<DT>\s*<FONT[^>]*>\s*<A[^>]*?NAME="?(\d{1,3}):(\d{1,3})"?[^>]*>[\s\S]*?<\/A>\s*<DD>([\s\S]*?)(?=<DT>|<\/DL>|<p[\s>]|<\/DIV>)/gi

function decodeEntities(s: string): string {
  return s
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&#(\d+);/g, (_, d: string) => String.fromCharCode(Number(d)))
}

function cleanVerseText(raw: string): { text: string; notes: string[] } {
  const notes: string[] = []
  let text = decodeEntities(raw.replace(/<[^>]+>/g, ' '))
  if (/~\s*Syncellus/i.test(text)) {
    text = text.replace(/~\s*Syncellus/i, '')
    notes.push('syncellus')
  }
  text = text.replace(/\s+/g, ' ').trim()
  return { text, notes }
}

async function fetchWindows1252(url: string): Promise<string> {
  const response = await fetch(url, { headers: { 'User-Agent': USER_AGENT } })
  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: HTTP ${response.status}`)
  }
  const buffer = await response.arrayBuffer()
  return new TextDecoder('windows-1252').decode(buffer)
}

export async function getSource(lang: Lang, force = false): Promise<string> {
  const { url, file } = SOURCES[lang]
  if (!force && existsSync(file)) {
    return await Bun.file(file).text()
  }
  await mkdir('output/enoque/raw', { recursive: true })
  const html = await fetchWindows1252(url)
  await Bun.write(file, html)
  return html
}

export function parseVerses(html: string): RawVerse[] {
  const verses: RawVerse[] = []
  const re = new RegExp(VERSE_RE.source, 'gi')
  let match: RegExpExecArray | null
  while ((match = re.exec(html)) !== null) {
    const { text, notes } = cleanVerseText(match[3])
    if (!text) continue
    verses.push({ ch: Number(match[1]), vs: Number(match[2]), text, notes })
  }
  return verses
}

export function parseColophon(html: string, lang: Lang): string {
  const pattern = lang === 'pt' ? /Aqui termina[\s\S]{0,400}?Am[eê]m/ : /Here ends[\s\S]{0,400}?Amen/
  const found = html.match(pattern)
  if (!found) return ''
  return decodeEntities(found[0].replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ').trim()
}

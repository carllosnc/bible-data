import { fetch } from 'bun'
import * as cheerio from 'cheerio'

export async function fetchContent(url: string): Promise<cheerio.CheerioAPI> {
  try {
    const response = await fetch(url)
    const data = await response.text()
    return cheerio.load(data)
  } catch (error) {
    console.error(`Failed to fetch ${url}:`, error)
    throw error
  }
}

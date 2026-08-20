import { fetch } from 'bun'
import * as cheerio from 'cheerio'

const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36'

async function fetchWithCurl(url: string): Promise<string> {
  const proc = Bun.spawn(['curl', '-sL', url, '-H', `User-Agent: ${USER_AGENT}`])
  const data = await new Response(proc.stdout).text()
  await proc.exited
  return data
}

export async function fetchContent(url: string): Promise<cheerio.CheerioAPI> {
  try {
    const response = await fetch(url, {
      headers: { 'User-Agent': USER_AGENT }
    })

    if (response.status === 403) {
      const data = await fetchWithCurl(url)
      return cheerio.load(data)
    }

    const data = await response.text()
    return cheerio.load(data)
  } catch (error) {
    console.error(`Failed to fetch ${url}:`, error)
    throw error
  }
}

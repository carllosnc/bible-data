import * as cheerio from 'cheerio'
import { resolve } from 'node:path'

const SCRIPT_PATH = resolve(import.meta.dir, '..', 'scripts', 'cf_fetch.py')

// On Windows the `python` executable often resolves to an older Python (3.9) or
// a Store stub via PATH, so we prefer the `py -3.12` launcher which reliably
// targets a modern Python that has curl_cffi/nodriver installed. Override with
// the PYTHON_BIN / PYTHON_ARGS env vars if needed.
const isWin = process.platform === 'win32'
const PYTHON_BIN = process.env.PYTHON_BIN ?? (isWin ? 'py' : 'python3')
const PYTHON_ARGS = process.env.PYTHON_ARGS
  ? process.env.PYTHON_ARGS.split(' ').filter(Boolean)
  : isWin ? ['-3.12'] : []

/**
 * Fetch a Cloudflare-protected URL by delegating to the Python helper
 * (scripts/cf_fetch.py), which solves the "Just a moment..." challenge once
 * with an undetected Chrome (nodriver) and then serves fast requests via
 * curl_cffi reusing the cf_clearance cookie + a real Chrome UA.
 *
 * Used by the Catholic scraper, whose source (bibliacatolica.com.br) sits
 * behind a Cloudflare managed challenge that Bun's fetch / plain curl can't
 * pass.
 */
export async function cfFetchContent(url: string): Promise<cheerio.CheerioAPI> {
  const proc = Bun.spawn({
    cmd: [PYTHON_BIN, ...PYTHON_ARGS, SCRIPT_PATH, url],
    stdout: 'pipe',
    stderr: 'pipe',
  })

  const exitCode = await proc.exited
  const stdout = await new Response(proc.stdout).text()
  const stderr = await new Response(proc.stderr).text()

  if (exitCode !== 0) {
    const detail = stderr.trim() || `python exited with code ${exitCode}`
    throw new Error(`cfFetchContent failed for ${url}: ${detail}`)
  }

  if (!stdout) {
    throw new Error(`cfFetchContent returned empty body for ${url}`)
  }

  return cheerio.load(stdout)
}

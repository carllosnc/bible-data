import { Glob } from 'bun'
import { readFile, writeFile } from 'node:fs/promises'
import { resolve, relative } from 'node:path'

type IssueType = 'double_space' | 'space_before_punct' | 'no_space_after_punct' | 'multiple_spaces'

type Issue = {
  type: IssueType
  book: string
  chapter: number
  verse: number
  original: string
  fixed: string
}

const PUNCTUATION = /[.,;:!?)]/u
const OPEN_PUNCT = /[(/]/u

function fixSpacing(text: string): { fixed: string; issues: IssueType[] } {
  let fixed = text
  const issues = new Set<IssueType>()

  // 1. Multiple spaces → single space
  const multiSpace = fixed.replace(/  +/g, ' ')
  if (multiSpace !== fixed) {
    issues.add('multiple_spaces')
    fixed = multiSpace
  }

  // 2. Space(s) before punctuation
  const spaceBeforePunct = fixed.replace(/\s+([.,;:!?)])/g, '$1')
  if (spaceBeforePunct !== fixed) {
    issues.add('space_before_punct')
    fixed = spaceBeforePunct
  }

  // 3. No space after punctuation (,;:!?) followed by a letter
  const noSpaceAfter = fixed.replace(/([.,;:!?])([A-Za-zÀ-ÿ])/g, '$1 $2')
  if (noSpaceAfter !== fixed) {
    issues.add('no_space_after_punct')
    fixed = noSpaceAfter
  }

  // 4. No space after closing parenthesis followed by a letter
  const noSpaceAfterParen = fixed.replace(/\)([A-Za-zÀ-ÿ])/g, ') $1')
  if (noSpaceAfterParen !== fixed) {
    issues.add('no_space_after_punct')
    fixed = noSpaceAfterParen
  }

  // 5. Space before opening slash (not parenthesis — space before ( is normal)
  const spaceBeforeOpen = fixed.replace(/\s+\//g, '/')
  if (spaceBeforeOpen !== fixed) {
    issues.add('space_before_punct')
    fixed = spaceBeforeOpen
  }

  // 6. Trim leading/trailing whitespace
  const trimmed = fixed.trim()
  if (trimmed !== fixed) {
    fixed = trimmed
  }

  return { fixed, issues: Array.from(issues) }
}

async function processFile(filePath: string, dryRun: boolean): Promise<Issue[]> {
  const absPath = resolve(filePath)
  const content = await readFile(absPath, 'utf-8')
  const bible = JSON.parse(content)
  const allIssues: Issue[] = []

  for (const book of bible.books ?? []) {
    for (let ci = 0; ci < (book.chapters ?? []).length; ci++) {
      const chapter = book.chapters[ci]
      for (let vi = 0; vi < chapter.length; vi++) {
        const verse = chapter[vi]
        const { fixed, issues } = fixSpacing(verse)

        if (issues.length > 0) {
          allIssues.push({
            book: book.name,
            chapter: ci + 1,
            verse: vi + 1,
            original: verse,
            fixed,
            type: issues[0],
          })

          if (!dryRun) {
            chapter[vi] = fixed
          }
        }
      }
    }
  }

  if (!dryRun && allIssues.length > 0) {
    await writeFile(absPath, JSON.stringify(bible, null, 2))
  }

  return allIssues
}

async function main() {
  const args = process.argv.slice(2)
  const dryRun = args.includes('--dry-run') || args.includes('-d')
  const targetPath = args.find(a => !a.startsWith('-')) ?? 'output'

  console.log(`\n🔍 Verifying spacing in: ${targetPath}`)
  console.log(`   Mode: ${dryRun ? 'DRY RUN (no changes)' : 'FIX (will modify files)'}\n`)

  const glob = new Glob('**/*.json')
  const files: string[] = []

  for await (const file of glob.scan(targetPath)) {
    if (file.includes('version.json') || file.includes('books.json')) continue
    files.push(resolve(targetPath, file))
  }

  if (files.length === 0) {
    console.log('⚠️  No Bible JSON files found in output/. Run download first.')
    return
  }

  let totalIssues = 0
  const summary: Record<string, number> = {
    double_space: 0,
    space_before_punct: 0,
    no_space_after_punct: 0,
    multiple_spaces: 0,
  }

  for (const file of files) {
    const relPath = relative(resolve(targetPath), file)
    const issues = await processFile(file, dryRun)

    if (issues.length > 0) {
      console.log(`📄 ${relPath} — ${issues.length} issue(s)`)
      for (const issue of issues.slice(0, 5)) {
        console.log(`   [${issue.type}] ${issue.book} ${issue.chapter}:${issue.verse}`)
        console.log(`     - "${issue.original}"`)
        console.log(`     + "${issue.fixed}"`)
      }
      if (issues.length > 5) {
        console.log(`   ... and ${issues.length - 5} more`)
      }
      console.log()
    }

    for (const issue of issues) {
      summary[issue.type]++
      totalIssues++
    }
  }

  console.log('━'.repeat(50))
  console.log(`\n📊 Summary:`)
  console.log(`   Files scanned: ${files.length}`)
  console.log(`   Total issues:  ${totalIssues}`)
  if (summary.multiple_spaces > 0) console.log(`   - Multiple spaces:       ${summary.multiple_spaces}`)
  if (summary.space_before_punct > 0) console.log(`   - Space before punct:    ${summary.space_before_punct}`)
  if (summary.no_space_after_punct > 0) console.log(`   - No space after punct:  ${summary.no_space_after_punct}`)
  console.log()

  if (dryRun && totalIssues > 0) {
    console.log('💡 Run without --dry-run to apply fixes.')
  } else if (totalIssues === 0) {
    console.log('✅ All files look clean!')
  }
}

main()

import { Glob } from 'bun'
import { readFile, writeFile, mkdir, rm } from 'node:fs/promises'
import { resolve, relative, basename } from 'node:path'

async function main() {
  const args = process.argv.slice(2)
  const cleanFirst = args.includes('--clean') || args.includes('-c')
  const dryRun = args.includes('--dry-run') || args.includes('-d')
  const targetPath = args.find(a => !a.startsWith('-')) ?? 'output'

  console.log(`\n🗜️  Regenerating gzip files from JSON`)
  console.log(`   Path: ${targetPath}`)
  console.log(`   Mode: ${dryRun ? 'DRY RUN (no changes)' : 'REGENERATE'}`)
  if (cleanFirst) console.log(`   Clean: will remove old gzip files first`)
  console.log()

  const glob = new Glob('**/*.json')
  const files: string[] = []

  for await (const file of glob.scan(targetPath)) {
    if (file.includes('version.json') || file.includes('books.json')) continue
    files.push(resolve(targetPath, file))
  }

  if (files.length === 0) {
    console.log('⚠️  No Bible JSON files found.')
    return
  }

  console.log(`Found ${files.length} JSON files\n`)

  let successCount = 0
  let errorCount = 0
  const errors: { file: string; error: string }[] = []

  for (const jsonPath of files) {
    const relPath = relative(resolve(targetPath), jsonPath)
    
    // Derive gzip path: json/{lang}/bible-{id}.json -> gzip/{lang}/bible-{id}.gz
    const gzPath = jsonPath
      .replace(/[/\\]json[/\\]/g, '/gzip/')
      .replace(/\.json$/, '.gz')

    try {
      if (cleanFirst) {
        try {
          await rm(gzPath, { force: true })
        } catch {}
      }

      if (dryRun) {
        console.log(`📄 ${relPath} -> ${relative(resolve(targetPath), gzPath)}`)
        successCount++
        continue
      }

      const content = await readFile(jsonPath, 'utf-8')
      const gzipped = Bun.gzipSync(content)

      const gzDir = gzPath.substring(0, gzPath.lastIndexOf('/'))
      await mkdir(gzDir, { recursive: true })

      await Bun.write(gzPath, gzipped)

      console.log(`✅ ${relPath}`)
      successCount++
    } catch (err) {
      console.log(`❌ ${relPath} — ${err}`)
      errors.push({ file: relPath, error: String(err) })
      errorCount++
    }
  }

  console.log('\n' + '━'.repeat(50))
  console.log(`\n📊 Summary:`)
  console.log(`   JSON files:   ${files.length}`)
  console.log(`   Regenerated:  ${successCount}`)
  if (errorCount > 0) console.log(`   Errors:       ${errorCount}`)
  console.log()

  if (errors.length > 0) {
    console.log('❌ Errors:')
    for (const e of errors) {
      console.log(`   ${e.file}: ${e.error}`)
    }
    console.log()
  }

  if (dryRun) {
    console.log('💡 Run without --dry-run to apply.')
  } else {
    console.log('✅ Done!')
  }
}

main()

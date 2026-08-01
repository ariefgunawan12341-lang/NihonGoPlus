/**
 * importSupabase.ts
 *
 * Reads every file in seed-data/ and writes it into Supabase Postgres, using
 * snake_case columns matching supabase/schema.sql. Standalone Node script
 * (uses the Supabase service role key, which bypasses RLS — never expose
 * this key client-side).
 *
 * SETUP:
 *   1. npm install
 *   2. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in a local .env
 *      (Project Settings → API in the Supabase dashboard — the service_role
 *      key, NOT the anon key)
 *   3. Run: npx tsx scripts/importSupabase.ts
 *
 * Safe to re-run: upserts on each row's `id`, so re-running overwrites the
 * same rows instead of duplicating them.
 */

import { readFileSync, existsSync, readdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { config as loadEnv } from 'dotenv'
import { createClient } from '@supabase/supabase-js'

loadEnv()

// __dirname doesn't exist in ES modules (this project's package.json has
// "type": "module") — this is the standard replacement.
const __dirname = dirname(fileURLToPath(import.meta.url))
const SEED_DIR = join(__dirname, '..', 'seed-data')

type JLPTLevel = 'N5' | 'N4' | 'N3' | 'N2' | 'N1'
const VALID_LEVELS: JLPTLevel[] = ['N5', 'N4', 'N3', 'N2', 'N1']

function isValidLevel(v: string): v is JLPTLevel {
  return VALID_LEVELS.includes(v as JLPTLevel)
}

function randomId(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36)}`
}

// ---- Row mappers → snake_case rows matching supabase/schema.sql ----

function mapVocabRow(row: Record<string, any>) {
  const level = String(row.level ?? '').toUpperCase()
  if (!isValidLevel(level)) return { error: `Invalid level: ${row.level}` }
  return {
    row: {
      id: row.id ?? randomId('vocab'),
      level,
      kanji: row.kanji ?? '',
      kana: row.kana ?? row.word ?? '',
      romaji: row.romaji ?? '',
      meaning: row.meaning ?? '',
      example: row.example_sentence ?? row.example ?? '',
      example_meaning: row.example_meaning ?? '',
      tags: row.category ? [row.category] : [],
      access_type: row.access_type ?? 'public'
    }
  }
}

function mapContentRow(row: Record<string, any>, kind: 'kanji' | 'grammar' | 'ssw' | 'kaigo') {
  const level = String(row.jlpt_level ?? row.level ?? '').toUpperCase()
  if (!isValidLevel(level)) return { error: `Invalid level: ${row.jlpt_level ?? row.level}` }
  const reading =
    row.reading_on && row.reading_kun
      ? `${row.reading_on} / ${row.reading_kun}`
      : row.reading_on || row.pattern || row.reading || ''
  return {
    row: {
      id: row.id ?? randomId(kind),
      kind,
      level,
      category: row.category ?? null,
      title: row.kanji ?? row.title ?? '',
      reading,
      meaning: row.meaning ?? '',
      example: row.example ?? '',
      example_meaning: row.example_meaning ?? '',
      order: Number(row.order ?? 0),
      access_type: row.access_type ?? 'public'
    }
  }
}

const CATEGORY_ALIASES: Record<string, string> = {
  moji: 'moji', goi: 'goi', bunpou: 'bunpou', grammar: 'bunpou', dokkai: 'dokkai', reading: 'dokkai', choukai: 'choukai', listening: 'choukai'
}

function mapQuestionRow(row: Record<string, any>) {
  const level = String(row.level ?? '').toUpperCase()
  if (!isValidLevel(level)) return { error: `Invalid level: ${row.level}` }
  const category = CATEGORY_ALIASES[String(row.section ?? '').toLowerCase()]
  if (!category) return { error: `Unknown section: ${row.section}` }
  const choices = String(row.options ?? '').split('|').map((o: string) => o.trim()).filter(Boolean)
  if (choices.length < 2) return { error: 'Need at least 2 pipe-separated options' }
  const correctIndex = Number(row.answer)
  if (!Number.isInteger(correctIndex) || correctIndex < 0 || correctIndex >= choices.length) {
    return { error: `Invalid answer index: ${row.answer}` }
  }
  return {
    row: {
      id: row.id ?? randomId('q'),
      level,
      category,
      difficulty: Number(row.difficulty ?? 1),
      prompt: row.question ?? '',
      passage: row.passage || null,
      choices,
      correct_index: correctIndex,
      explanation: row.explanation ?? '',
      tags: [],
      access_type: row.access_type ?? 'public'
    }
  }
}

interface FileSpec {
  file: string
  table: string
  mapper: (row: Record<string, any>) => { row?: Record<string, any>; error?: string }
}

const FILES: FileSpec[] = [
  { file: 'vocabulary_n5.json', table: 'vocabulary', mapper: mapVocabRow },
  { file: 'vocabulary_n4.json', table: 'vocabulary', mapper: mapVocabRow },
  { file: 'vocabulary_n3.json', table: 'vocabulary', mapper: mapVocabRow },
  { file: 'vocabulary_n2.json', table: 'vocabulary', mapper: mapVocabRow },
  { file: 'vocabulary_n1.json', table: 'vocabulary', mapper: mapVocabRow },
  { file: 'kanji_n5.json', table: 'content_items', mapper: (r) => mapContentRow(r, 'kanji') },
  { file: 'kanji_n4.json', table: 'content_items', mapper: (r) => mapContentRow(r, 'kanji') },
  { file: 'kanji_n3.json', table: 'content_items', mapper: (r) => mapContentRow(r, 'kanji') },
  { file: 'kanji_n2.json', table: 'content_items', mapper: (r) => mapContentRow(r, 'kanji') },
  { file: 'kanji_n1.json', table: 'content_items', mapper: (r) => mapContentRow(r, 'kanji') },
  { file: 'grammar_n5.json', table: 'content_items', mapper: (r) => mapContentRow(r, 'grammar') },
  { file: 'grammar_n4.json', table: 'content_items', mapper: (r) => mapContentRow(r, 'grammar') },
  { file: 'grammar_n3.json', table: 'content_items', mapper: (r) => mapContentRow(r, 'grammar') },
  { file: 'grammar_n2.json', table: 'content_items', mapper: (r) => mapContentRow(r, 'grammar') },
  { file: 'grammar_n1.json', table: 'content_items', mapper: (r) => mapContentRow(r, 'grammar') },
  { file: 'exam_n5.json', table: 'questions', mapper: mapQuestionRow },
  { file: 'exam_n4.json', table: 'questions', mapper: mapQuestionRow },
  { file: 'exam_n3.json', table: 'questions', mapper: mapQuestionRow },
  { file: 'exam_n2.json', table: 'questions', mapper: mapQuestionRow },
  { file: 'exam_n1.json', table: 'questions', mapper: mapQuestionRow },
  { file: 'ssw.json', table: 'content_items', mapper: (r) => mapContentRow(r, 'ssw') },
  { file: 'kaigo.json', table: 'content_items', mapper: (r) => mapContentRow(r, 'kaigo') }
]

async function main() {
  const url = process.env.SUPABASE_URL
  // Supabase now issues "sb_secret_..." keys under the name SUPABASE_SECRET_KEY
  // in newer project setups, alongside the classic SUPABASE_SERVICE_ROLE_KEY
  // name — accept either so this script works regardless of which naming
  // convention your Supabase project/dashboard uses.
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY
  if (!url || !key) {
    console.error('\n❌ Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (or SUPABASE_SECRET_KEY) in a local .env before running this script.\n')
    process.exit(1)
  }

  const supabase = createClient(url, key)
  console.log(`\nImporting from ${SEED_DIR}\n`)

  const availableFiles = new Set(readdirSync(SEED_DIR))
  let totalImported = 0
  let totalSkipped = 0

  for (const spec of FILES) {
    if (!availableFiles.has(spec.file)) {
      console.log(`  ⚠️  ${spec.file} not found, skipping`)
      continue
    }
    const rawRows: Record<string, any>[] = JSON.parse(readFileSync(join(SEED_DIR, spec.file), 'utf-8'))
    const rows: Record<string, any>[] = []
    let skipped = 0

    for (const raw of rawRows) {
      const { row, error } = spec.mapper(raw)
      if (error || !row) {
        console.log(`  ⚠️  Skipped a row in ${spec.file}: ${error}`)
        skipped++
        continue
      }
      rows.push(row)
    }

    if (rows.length > 0) {
      // eslint-disable-next-line no-await-in-loop
      const { error } = await supabase.from(spec.table).upsert(rows, { onConflict: 'id' })
      if (error) {
        console.error(`  ❌ ${spec.file}: bulk upsert failed — ${error.message}`)
        continue
      }
    }

    console.log(`  ✅ ${spec.file}: ${rows.length} imported${skipped ? `, ${skipped} skipped` : ''}`)
    totalImported += rows.length
    totalSkipped += skipped
  }

  console.log(`\nDone. ${totalImported} rows imported, ${totalSkipped} rows skipped.\n`)
}

main().catch((err) => {
  console.error('Import failed:', err)
  process.exit(1)
})

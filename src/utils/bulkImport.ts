import type { VocabWord, ExamQuestion, JLPTLevel, QuestionCategory } from '../types'
import type { ContentItem, ContentKind } from '../types/content'

export type ImportTarget = 'vocabulary' | 'kanji' | 'grammar' | 'questions'

export interface ImportSchema {
  label: string
  requiredFields: string[]
  exampleRow: Record<string, string>
}

export const IMPORT_SCHEMAS: Record<ImportTarget, ImportSchema> = {
  vocabulary: {
    label: 'Vocabulary',
    requiredFields: ['kana', 'meaning', 'level'],
    exampleRow: { id: 'n5-031', kanji: '朝', kana: 'あさ', romaji: 'asa', meaning: 'morning', level: 'N5', example_sentence: '朝ごはんを食べます。', category: 'noun' }
  },
  kanji: {
    label: 'Kanji',
    requiredFields: ['kanji', 'meaning', 'jlpt_level'],
    exampleRow: { kanji: '空', reading_on: 'クウ', reading_kun: 'そら', meaning: 'sky, empty', stroke_count: '8', jlpt_level: 'N5', example: '空は青いです。' }
  },
  grammar: {
    label: 'Grammar',
    requiredFields: ['title', 'meaning', 'jlpt_level'],
    exampleRow: { title: '〜ながら', pattern: 'Vstem + ながら', meaning: 'while doing ~', explanation: 'Expresses two simultaneous actions.', jlpt_level: 'N4' }
  },
  questions: {
    label: 'Exam Questions',
    requiredFields: ['level', 'section', 'question', 'answer'],
    exampleRow: {
      level: 'N5',
      section: 'goi',
      question: '朝ごはんを＿＿。',
      options: 'たべます|みます|いきます|かいます',
      answer: '0',
      explanation: 'たべます (to eat) fits "eat breakfast".'
    }
  }
}

export interface ParsedRow {
  raw: Record<string, unknown>
  errors: string[]
  isDuplicate: boolean
  mapped: VocabWord | ContentItem | ExamQuestion | null
}

function s(v: unknown): string {
  return v === undefined || v === null ? '' : String(v).trim()
}

function n(v: unknown, fallback = 0): number {
  const num = Number(v)
  return Number.isFinite(num) ? num : fallback
}

function isValidLevel(v: string): v is JLPTLevel {
  return ['N5', 'N4', 'N3', 'N2', 'N1'].includes(v)
}

const CATEGORY_ALIASES: Record<string, QuestionCategory> = {
  moji: 'moji', goi: 'goi', bunpou: 'bunpou', grammar: 'bunpou', dokkai: 'dokkai', reading: 'dokkai', choukai: 'choukai', listening: 'choukai'
}

export function mapRow(target: ImportTarget, row: Record<string, unknown>, kind?: ContentKind): ParsedRow {
  const errors: string[] = []
  const schema = IMPORT_SCHEMAS[target]

  for (const field of schema.requiredFields) {
    if (!s(row[field])) errors.push(`Missing required field "${field}"`)
  }

  let mapped: ParsedRow['mapped'] = null

  if (target === 'vocabulary') {
    const level = s(row.level).toUpperCase()
    if (level && !isValidLevel(level)) errors.push(`Invalid level "${row.level}" (must be N5–N1)`)
    if (errors.length === 0) {
      mapped = {
        id: s(row.id) || `vocab-${crypto.randomUUID()}`,
        level: level as JLPTLevel,
        kanji: s(row.kanji),
        kana: s(row.kana ?? row.word),
        romaji: s(row.romaji),
        meaning: s(row.meaning),
        example: s(row.example_sentence ?? row.example),
        exampleMeaning: s(row.example_meaning),
        tags: s(row.category) ? [s(row.category)] : []
      } satisfies VocabWord
    }
  }

  if (target === 'kanji' || target === 'grammar') {
    const level = s(row.jlpt_level ?? row.level).toUpperCase()
    if (level && !isValidLevel(level)) errors.push(`Invalid level "${row.jlpt_level ?? row.level}" (must be N5–N1)`)
    if (errors.length === 0) {
      mapped = {
        id: s(row.id) || `${target}-${crypto.randomUUID()}`,
        kind: (kind ?? target) as ContentKind,
        level: level as JLPTLevel,
        title: s(row.kanji ?? row.title),
        reading: s(row.reading_on) && s(row.reading_kun) ? `${row.reading_on} / ${row.reading_kun}` : s(row.pattern ?? row.reading),
        meaning: s(row.meaning),
        example: s(row.example),
        exampleMeaning: s(row.example_meaning),
        order: n(row.order, 0)
      } satisfies ContentItem
    }
  }

  if (target === 'questions') {
    const level = s(row.level).toUpperCase()
    if (level && !isValidLevel(level)) errors.push(`Invalid level "${row.level}" (must be N5–N1)`)
    const category = CATEGORY_ALIASES[s(row.section).toLowerCase()]
    if (row.section && !category) errors.push(`Unknown section "${row.section}" (expected moji/goi/bunpou/dokkai/choukai)`)
    const options = s(row.options).split('|').map((o) => o.trim()).filter(Boolean)
    if (options.length < 2) errors.push('Need at least 2 pipe-separated options in "options" (e.g. "a|b|c|d")')
    const answerIndex = n(row.answer, -1)
    if (answerIndex < 0 || answerIndex >= options.length) errors.push(`"answer" must be a valid option index (0–${options.length - 1})`)

    if (errors.length === 0) {
      mapped = {
        id: s(row.id) || `q-${crypto.randomUUID()}`,
        level: level as JLPTLevel,
        category,
        difficulty: (n(row.difficulty, 1) as 1 | 2 | 3),
        prompt: s(row.question),
        passage: s(row.passage) || undefined,
        choices: options,
        correctIndex: answerIndex,
        explanation: s(row.explanation),
        tags: []
      } satisfies ExamQuestion
    }
  }

  return { raw: row, errors, isDuplicate: false, mapped }
}

export function markDuplicates(rows: ParsedRow[], existingIds: Set<string>): ParsedRow[] {
  const seen = new Set<string>()
  return rows.map((row) => {
    const id = row.mapped?.id
    if (!id) return row
    const isDuplicate = existingIds.has(id) || seen.has(id)
    seen.add(id)
    return { ...row, isDuplicate }
  })
}

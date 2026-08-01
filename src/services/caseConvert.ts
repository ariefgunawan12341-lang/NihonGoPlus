// Every existing type in the app (VocabWord, ContentItem, ExamQuestion, etc.)
// uses camelCase fields, matching JS/TS convention. Postgres/Supabase
// convention is snake_case columns. Rather than rewrite every page that
// reads `word.exampleMeaning`, `item.accessType`, etc., SupabaseCollection
// converts at the boundary — the rest of the app never has to know Postgres
// uses different casing.

export function toSnakeCase<T extends Record<string, unknown>>(obj: T): Record<string, unknown> {
  const out: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(obj)) {
    if (value === undefined) continue // Postgres doesn't need explicit undefined; omit rather than send null unintentionally
    const snakeKey = key.replace(/[A-Z]/g, (m) => `_${m.toLowerCase()}`)
    out[snakeKey] = value
  }
  return out
}

export function toCamelCase<T = Record<string, unknown>>(obj: Record<string, unknown>): T {
  const out: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(obj)) {
    const camelKey = key.replace(/_([a-z0-9])/g, (_m, c: string) => c.toUpperCase())
    out[camelKey] = value
  }
  return out as T
}

import { useState } from 'react'
import Papa from 'papaparse'
import { UploadCloud, CheckCircle2, AlertTriangle, FileJson, FileSpreadsheet } from 'lucide-react'
import clsx from 'clsx'
import { IMPORT_SCHEMAS, mapRow, markDuplicates, type ImportTarget, type ParsedRow } from '../../utils/bulkImport'
import { vocabCollection, questionCollection, contentCollection } from '../../services/db'

const TARGETS: ImportTarget[] = ['vocabulary', 'kanji', 'grammar', 'questions']

function collectionFor(target: ImportTarget) {
  if (target === 'vocabulary') return vocabCollection
  if (target === 'questions') return questionCollection
  return contentCollection // kanji + grammar both live in content_items
}

export default function AdminImport() {
  const [target, setTarget] = useState<ImportTarget>('vocabulary')
  const [rows, setRows] = useState<ParsedRow[] | null>(null)
  const [importing, setImporting] = useState(false)
  const [result, setResult] = useState<{ imported: number; skipped: number } | null>(null)
  const [fileError, setFileError] = useState<string | null>(null)

  async function handleFile(file: File) {
    setFileError(null)
    setResult(null)
    const isJson = file.name.endsWith('.json')
    const isCsv = file.name.endsWith('.csv')
    if (!isJson && !isCsv) {
      setFileError('Please upload a .json or .csv file.')
      return
    }

    let rawRows: Record<string, unknown>[] = []
    try {
      if (isJson) {
        const text = await file.text()
        const parsed = JSON.parse(text)
        rawRows = Array.isArray(parsed) ? parsed : [parsed]
      } else {
        const text = await file.text()
        const parsed = Papa.parse<Record<string, unknown>>(text, { header: true, skipEmptyLines: true })
        if (parsed.errors.length > 0) {
          setFileError(`CSV parse error: ${parsed.errors[0].message} (row ${parsed.errors[0].row})`)
          return
        }
        rawRows = parsed.data
      }
    } catch (e) {
      setFileError(e instanceof Error ? `Could not parse file: ${e.message}` : 'Could not parse file.')
      return
    }

    if (rawRows.length === 0) {
      setFileError('No rows found in this file.')
      return
    }

    const mapped = rawRows.map((r) => mapRow(target, r))
    const existing = await collectionFor(target).list()
    const existingIds = new Set(
      existing
        .filter((item) => target !== 'kanji' && target !== 'grammar' ? true : (item as { kind?: string }).kind === target)
        .map((item) => item.id)
    )
    setRows(markDuplicates(mapped, existingIds))
  }

  async function confirmImport() {
    if (!rows) return
    setImporting(true)
    const col = collectionFor(target)
    const toImport = rows.filter((r) => r.errors.length === 0 && !r.isDuplicate && r.mapped)
    let imported = 0
    for (const row of toImport) {
      // eslint-disable-next-line no-await-in-loop
      await col.create(row.mapped as any) // eslint-disable-line @typescript-eslint/no-explicit-any -- collectionFor()'s return type is a union across differently-typed collections; this generic import boundary intentionally bypasses that union for a single write call
      imported++
    }
    setResult({ imported, skipped: rows.length - imported })
    setImporting(false)
    setRows(null)
  }

  const schema = IMPORT_SCHEMAS[target]
  const validCount = rows?.filter((r) => r.errors.length === 0 && !r.isDuplicate).length ?? 0
  const errorCount = rows?.filter((r) => r.errors.length > 0).length ?? 0
  const dupCount = rows?.filter((r) => r.isDuplicate && r.errors.length === 0).length ?? 0

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold">Bulk Import</h1>
        <p className="text-sm text-ink-soft">Upload JSON or CSV to add many entries at once.</p>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {TARGETS.map((t) => (
          <button
            key={t}
            onClick={() => { setTarget(t); setRows(null); setResult(null) }}
            className={clsx(
              'px-4 py-1.5 rounded-full text-sm font-semibold whitespace-nowrap transition',
              target === t ? 'bg-blue-500 text-white' : 'bg-surface border border-line text-ink-soft'
            )}
          >
            {IMPORT_SCHEMAS[t].label}
          </button>
        ))}
      </div>

      <div className="card p-5">
        <p className="text-sm font-semibold mb-1">Required fields for {schema.label}</p>
        <p className="text-xs text-ink-soft mb-3">{schema.requiredFields.join(', ')} — other fields are optional.</p>
        <details className="text-xs text-ink-soft">
          <summary className="cursor-pointer font-semibold text-blue-600">Show example row (CSV header + values)</summary>
          <pre className="mt-2 bg-paper rounded-lg p-3 overflow-x-auto">
{Object.keys(schema.exampleRow).join(',')}
{'\n'}
{Object.values(schema.exampleRow).join(',')}
          </pre>
        </details>
      </div>

      <label className="card p-8 flex flex-col items-center gap-2 text-center border-dashed cursor-pointer hover:border-blue-400 transition">
        <UploadCloud size={28} className="text-blue-500" />
        <p className="text-sm font-semibold">Click to upload a .json or .csv file</p>
        <p className="text-xs text-ink-soft flex items-center gap-3">
          <span className="inline-flex items-center gap-1"><FileJson size={14} /> JSON array</span>
          <span className="inline-flex items-center gap-1"><FileSpreadsheet size={14} /> CSV with header row</span>
        </p>
        <input
          type="file"
          accept=".json,.csv"
          className="hidden"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f) }}
        />
      </label>

      {fileError && (
        <div className="card p-4 flex items-start gap-2 text-sm text-hanko">
          <AlertTriangle size={16} className="shrink-0 mt-0.5" /> {fileError}
        </div>
      )}

      {result && (
        <div className="card p-4 flex items-start gap-2 text-sm text-mint-600">
          <CheckCircle2 size={16} className="shrink-0 mt-0.5" />
          Imported {result.imported} rows{result.skipped > 0 && ` (skipped ${result.skipped} invalid/duplicate rows)`}.
        </div>
      )}

      {rows && (
        <div className="space-y-3">
          <div className="flex items-center gap-4 text-sm">
            <span className="text-mint-600 font-semibold">{validCount} ready to import</span>
            {dupCount > 0 && <span className="text-blue-600 font-semibold">{dupCount} duplicates (skipped)</span>}
            {errorCount > 0 && <span className="text-hanko font-semibold">{errorCount} errors (skipped)</span>}
          </div>

          <div className="card overflow-x-auto max-h-96 overflow-y-auto">
            <table className="w-full text-xs">
              <thead className="text-left text-ink-soft border-b border-line sticky top-0 bg-surface">
                <tr>
                  <th className="px-3 py-2 font-medium">Status</th>
                  <th className="px-3 py-2 font-medium">Preview</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, i) => (
                  <tr key={i} className="border-b border-line last:border-0">
                    <td className="px-3 py-2 align-top">
                      {row.errors.length > 0 ? (
                        <span className="text-hanko font-semibold">Error</span>
                      ) : row.isDuplicate ? (
                        <span className="text-blue-600 font-semibold">Duplicate</span>
                      ) : (
                        <span className="text-mint-600 font-semibold">OK</span>
                      )}
                    </td>
                    <td className="px-3 py-2 align-top">
                      {row.errors.length > 0 ? (
                        <span className="text-hanko">{row.errors.join('; ')}</span>
                      ) : (
                        <span>{JSON.stringify(row.mapped)}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <button className="btn-primary w-full" disabled={validCount === 0 || importing} onClick={confirmImport}>
            {importing ? 'Importing…' : `Import ${validCount} rows`}
          </button>
        </div>
      )}
    </div>
  )
}

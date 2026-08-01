// A tiny local-storage backed "collection" that mimics the shape of Firestore
// usage in this app (list / get / create / update / remove / subscribe-free).
// Lets the whole app run with zero backend setup, and keeps the exact same
// call signatures as the Firestore-backed version in firestoreCollection.ts.

function read<T>(key: string): T[] {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T[]) : []
  } catch {
    return []
  }
}

function write<T>(key: string, items: T[]) {
  localStorage.setItem(key, JSON.stringify(items))
}

export function seedIfEmpty<T>(key: string, seed: T[]) {
  const existing = read<T>(key)
  if (existing.length === 0 && seed.length > 0) {
    write(key, seed)
  }
}

export class LocalCollection<T extends { id: string }> {
  constructor(private key: string) {}

  async list(): Promise<T[]> {
    return read<T>(this.key)
  }

  /** Filter + optional page size, mirroring FirestoreCollection.listFiltered's signature
   *  so callers work identically against thousands of Firestore docs or local demo data. */
  async listFiltered(filters: Partial<T>, opts?: { limit?: number }): Promise<T[]> {
    const items = read<T>(this.key).filter((item) =>
      Object.entries(filters).every(([k, v]) => v === undefined || (item as Record<string, unknown>)[k] === v)
    )
    return opts?.limit ? items.slice(0, opts.limit) : items
  }

  async get(id: string): Promise<T | undefined> {
    return read<T>(this.key).find((i) => i.id === id)
  }

  async create(item: T): Promise<T> {
    const items = read<T>(this.key)
    items.push(item)
    write(this.key, items)
    return item
  }

  async update(id: string, patch: Partial<T>): Promise<void> {
    const items = read<T>(this.key)
    const idx = items.findIndex((i) => i.id === id)
    if (idx >= 0) {
      items[idx] = { ...items[idx], ...patch }
      write(this.key, items)
    }
  }

  async remove(id: string): Promise<void> {
    const items = read<T>(this.key).filter((i) => i.id !== id)
    write(this.key, items)
  }
}

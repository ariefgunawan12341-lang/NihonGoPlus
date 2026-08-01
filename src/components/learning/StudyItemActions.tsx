import { useEffect, useState } from 'react'
import { Star, MessageSquare, Volume2, Save, X } from 'lucide-react'
import { userBookmarkCollection, userNoteCollection } from '../../services/db'
import { useAuth } from '../../contexts/AuthContext'
import type { Bookmark, UserNote } from '../../types'

interface Props {
  itemId: string
  itemType: 'vocab' | 'kanji' | 'grammar' | 'article'
  audioText?: string
}

export function StudyItemActions({ itemId, itemType, audioText }: Props) {
  const { user } = useAuth()
  const [bookmark, setBookmark] = useState<Bookmark | null>(null)
  const [note, setNote] = useState<UserNote | null>(null)
  const [isNoteOpen, setIsNoteOpen] = useState(false)
  const [noteText, setNoteText] = useState('')

  useEffect(() => {
    if (!user) return
    const bCol = userBookmarkCollection(user.uid)
    const nCol = userNoteCollection(user.uid)

    // Fetch bookmark state
    bCol.list().then(list => {
      const found = list.find(b => b.itemId === itemId)
      if (found) setBookmark(found)
    })

    // Fetch note state
    nCol.list().then(list => {
      const found = list.find(n => n.itemId === itemId)
      if (found) {
        setNote(found)
        setNoteText(found.note)
      }
    })
  }, [user, itemId])

  async function toggleBookmark() {
    if (!user) return
    const col = userBookmarkCollection(user.uid)
    if (bookmark) {
      await col.remove(bookmark.id)
      setBookmark(null)
    } else {
      const newB: Bookmark = {
        id: crypto.randomUUID(),
        itemId,
        itemType,
        createdAt: Date.now()
      }
      await col.create(newB)
      setBookmark(newB)
    }
  }

  async function saveNote() {
    if (!user) return
    const col = userNoteCollection(user.uid)
    if (note) {
      await col.update(note.id, { note: noteText, updatedAt: Date.now() })
    } else {
      const newN: UserNote = {
        id: crypto.randomUUID(),
        itemId,
        note: noteText,
        updatedAt: Date.now()
      }
      await col.create(newN)
      setNote(newN)
    }
    setIsNoteOpen(false)
  }

  function speak() {
    if (audioText && 'speechSynthesis' in window) {
      const utter = new SpeechSynthesisUtterance(audioText)
      utter.lang = 'ja-JP'
      window.speechSynthesis.speak(utter)
    }
  }

  return (
    <div className="relative">
      <div className="flex flex-col items-center gap-2 shrink-0">
        {audioText && (
          <button onClick={speak} className="text-ink-soft hover:text-blue-500 transition-colors p-1" title="Putar Suara">
            <Volume2 size={18} />
          </button>
        )}
        <button
          onClick={toggleBookmark}
          className={bookmark ? 'text-yellow-500' : 'text-ink-soft hover:text-yellow-500 transition-colors p-1'}
          title="Simpan ke Bookmark"
        >
          <Star size={18} fill={bookmark ? 'currentColor' : 'none'} />
        </button>
        <button
          onClick={() => setIsNoteOpen(!isNoteOpen)}
          className={note ? 'text-blue-500' : 'text-ink-soft hover:text-blue-500 transition-colors p-1'}
          title="Tambah Catatan"
        >
          <MessageSquare size={18} fill={note ? 'currentColor' : 'none'} />
        </button>
      </div>

      {isNoteOpen && (
        <div className="absolute top-full right-0 mt-2 z-50 w-64 p-3 card shadow-xl border-blue-200 animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-[10px] font-bold uppercase text-ink-soft tracking-wider">Catatan Saya</h4>
            <button onClick={() => setIsNoteOpen(false)} className="text-ink-soft hover:text-ink"><X size={12} /></button>
          </div>
          <textarea
            className="input text-xs min-h-[80px] py-2 mb-2"
            placeholder="Tulis catatan di sini..."
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
          />
          <button onClick={saveNote} className="btn-primary w-full py-1.5 text-[11px] flex items-center justify-center gap-1.5">
            <Save size={12} /> Simpan Catatan
          </button>
        </div>
      )}
    </div>
  )
}

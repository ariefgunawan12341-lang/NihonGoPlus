import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, BookMarked, GraduationCap, Crown, Type } from 'lucide-react'
import { vocabCollection, announcementCollection } from '../services/db'
import type { VocabWord } from '../types'
import type { Announcement } from '../types/content'
import { AnnouncementBanner } from '../components/ui/AnnouncementBanner'

export default function GuestHome() {
  const [sample, setSample] = useState<VocabWord[]>([])
  const [announcements, setAnnouncements] = useState<Announcement[]>([])

  useEffect(() => {
    vocabCollection.listFiltered({ level: 'N5' }).then((words) => setSample(words.slice(0, 6)))
    announcementCollection.list().then((all) => setAnnouncements(all.filter((a) => a.active)))
  }, [])

  return (
    <div className="space-y-6">
      <AnnouncementBanner announcements={announcements} />

      <div className="card p-8 bg-gradient-to-br from-blue-500 to-blue-600 text-white border-none text-center">
        <div className="w-14 h-14 rounded-full bg-hanko mx-auto flex items-center justify-center text-white font-jp font-bold text-2xl mb-3">語</div>
        <h1 className="text-2xl font-bold font-display">Belajar Bahasa Jepang, Gratis untuk Dicoba</h1>
        <p className="text-sm text-blue-100 mt-2 max-w-md mx-auto">
          Jelajahi Hiragana, Katakana, kosakata, dan latihan JLPT tanpa perlu akun. Daftar gratis kapan saja untuk menyimpan progres.
        </p>
        <div className="flex items-center justify-center gap-2 mt-4">
          <Link to="/signup" className="btn-primary bg-white text-blue-600 hover:bg-blue-50">Daftar gratis</Link>
          <Link to="/basics/hiragana" className="btn-secondary bg-white/10 text-white hover:bg-white/20">Coba sekarang</Link>
        </div>
      </div>

      <div>
        <h2 className="text-sm font-semibold text-ink-soft uppercase tracking-wide mb-3">Jelajahi tanpa akun</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Hiragana', to: '/basics/hiragana', icon: Type, color: 'bg-blue-50 text-blue-600' },
            { label: 'Kosakata N5', to: '/vocabulary', icon: BookMarked, color: 'bg-mint-50 text-mint-600' },
            { label: 'Contoh soal JLPT', to: '/exam-center', icon: GraduationCap, color: 'bg-blue-50 text-blue-600' },
            { label: 'Info Premium', to: '/premium', icon: Crown, color: 'bg-gold-50 text-gold-600' }
          ].map((q) => (
            <Link key={q.to} to={q.to} className="card p-4 flex flex-col items-center gap-2 hover:shadow-card transition">
              <div className={`w-10 h-10 rounded-xl2 flex items-center justify-center ${q.color}`}>
                <q.icon size={18} />
              </div>
              <span className="text-sm font-semibold text-center">{q.label}</span>
            </Link>
          ))}
        </div>
      </div>

      {sample.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-ink-soft uppercase tracking-wide">Contoh kosakata N5</h2>
            <Link to="/vocabulary" className="text-sm font-semibold text-blue-600 inline-flex items-center gap-1">
              Lihat semua <ArrowRight size={14} />
            </Link>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            {sample.map((w) => (
              <div key={w.id} className="card p-4">
                <div className="flex items-baseline gap-2">
                  {w.kanji && <span className="font-jp text-lg">{w.kanji}</span>}
                  <span className="font-jp text-ink-soft">{w.kana}</span>
                </div>
                <p className="text-sm font-semibold text-blue-600">{w.meaning}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="card p-6 text-center">
        <h3 className="font-bold mb-1">Buat akun gratis untuk membuka lebih banyak</h3>
        <p className="text-sm text-ink-soft mb-4">Simpan progres, flashcard spaced-repetition, Kaiwa AI, dan latihan JLPT gratis lengkap.</p>
        <Link to="/signup" className="btn-primary">Daftar sekarang</Link>
      </div>
    </div>
  )
}

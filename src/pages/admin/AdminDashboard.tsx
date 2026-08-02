import { useEffect, useState } from 'react'
import { BookMarked, HelpCircle, Users as UsersIcon, PenTool, Layers, Crown, Newspaper, FolderDown, Briefcase, HeartHandshake, Wallet } from 'lucide-react'
import { vocabCollection, questionCollection, contentCollection, listAllUsersAdmin, articleCollection, downloadModuleCollection, premiumOrderCollection } from '../../services/db'

interface Stats {
  vocab: number
  questions: number
  users: number
  premiumUsers: number
  kanji: number
  grammar: number
  ssw: number
  kaigo: number
  articles: number
  downloads: number
  pendingOrders: number
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null)

  useEffect(() => {
    Promise.all([
      vocabCollection.list(),
      questionCollection.list(),
      listAllUsersAdmin(),
      contentCollection.list(),
      articleCollection.list(),
      downloadModuleCollection.list(),
      premiumOrderCollection.list()
    ]).then(([vocab, questions, users, content, articles, downloads, orders]) => {
      setStats({
        vocab: vocab.length,
        questions: questions.length,
        users: users.length,
        premiumUsers: users.filter((u) => u.premium).length,
        kanji: content.filter((c) => c.kind === 'kanji').length,
        grammar: content.filter((c) => c.kind === 'grammar').length,
        ssw: content.filter((c) => c.kind === 'ssw').length,
        kaigo: content.filter((c) => c.kind === 'kaigo').length,
        articles: articles.length,
        downloads: downloads.length,
        pendingOrders: orders.filter((o) => o.status === 'pending').length
      })
    })
  }, [])

  const cards = stats
    ? [
        { label: 'Total User', value: stats.users, icon: UsersIcon, color: 'bg-mint-50 text-mint-600' },
        { label: 'Premium User', value: stats.premiumUsers, icon: Crown, color: 'bg-gold-50 text-gold-600' },
        { label: 'Pembayaran Menunggu', value: stats.pendingOrders, icon: Wallet, color: 'bg-hanko/10 text-hanko' },
        { label: 'Vocabulary', value: stats.vocab, icon: BookMarked, color: 'bg-blue-50 text-blue-600' },
        { label: 'Kanji', value: stats.kanji, icon: PenTool, color: 'bg-hanko/10 text-hanko' },
        { label: 'Grammar', value: stats.grammar, icon: Layers, color: 'bg-blue-50 text-blue-600' },
        { label: 'Soal Ujian', value: stats.questions, icon: HelpCircle, color: 'bg-mint-50 text-mint-600' },
        { label: 'SSW', value: stats.ssw, icon: Briefcase, color: 'bg-blue-50 text-blue-600' },
        { label: 'Kaigo Fukushishi', value: stats.kaigo, icon: HeartHandshake, color: 'bg-mint-50 text-mint-600' },
        { label: 'Artikel', value: stats.articles, icon: Newspaper, color: 'bg-hanko/10 text-hanko' },
        { label: 'Download Modul', value: stats.downloads, icon: FolderDown, color: 'bg-gold-50 text-gold-600' }
      ]
    : []

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {!stats ? (
        <p className="text-sm text-ink-soft">Memuat statistik…</p>
      ) : (
        cards.map((c) => (
          <div key={c.label} className="card p-5 flex items-center gap-4">
            <div className={`w-11 h-11 rounded-xl2 flex items-center justify-center ${c.color}`}>
              <c.icon size={20} />
            </div>
            <div>
              <p className="text-2xl font-bold font-display">{c.value}</p>
              <p className="text-xs text-ink-soft">{c.label}</p>
            </div>
          </div>
        ))
      )}
    </div>
  )
}

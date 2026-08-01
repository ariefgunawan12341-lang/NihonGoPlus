import { Link } from 'react-router-dom'
import { Type, Languages, PenTool, BookMarked, Layers, MessageCircle, Headphones } from 'lucide-react'

const modules = [
  { label: 'Hiragana', to: '/basics/hiragana', icon: Type },
  { label: 'Katakana', to: '/basics/katakana', icon: Languages },
  { label: 'Kanji', to: '/basics/kanji', icon: PenTool },
  { label: 'Vocabulary', to: '/vocabulary', icon: BookMarked },
  { label: 'Grammar', to: '/grammar', icon: Layers },
  { label: 'Conversation', to: '/kaiwa-ai', icon: MessageCircle },
  { label: 'Listening', to: '/jlpt/N5', icon: Headphones }
]

export default function BasicsHub() {
  return (
    <div>
      <h1 className="text-xl font-bold mb-1">Basic Japanese</h1>
      <p className="text-sm text-ink-soft mb-5">Build your foundation from the ground up.</p>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {modules.map((m) => (
          <Link key={m.to} to={m.to} className="card p-4 flex flex-col items-center gap-2 text-center hover:shadow-card transition">
            <div className="w-10 h-10 rounded-xl2 bg-blue-50 text-blue-600 flex items-center justify-center">
              <m.icon size={18} />
            </div>
            <span className="text-sm font-semibold">{m.label}</span>
          </Link>
        ))}
      </div>
    </div>
  )
}

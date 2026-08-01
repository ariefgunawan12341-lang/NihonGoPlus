import { useEffect, useRef, useState } from 'react'
import { Send, MessageCircle, AlertCircle, Award, GraduationCap } from 'lucide-react'
import clsx from 'clsx'
import { useAuth } from '../contexts/AuthContext'
import { userKaiwaCollection } from '../services/db'
import type { KaiwaMessage } from '../types'
import { applyStudySession } from '../utils/progress'
import { logActivity } from '../utils/gamification'

const SENSEI_NAME = 'Arif Boncel Sensei'

const MODES = [
  { key: 'free-chat', label: 'Tanya Sensei Bebas' },
  { key: 'beginner', label: 'Beginner Roleplay' },
  { key: 'intermediate', label: 'Intermediate Roleplay' },
  { key: 'advanced', label: 'Advanced Roleplay' },
  { key: 'jlpt', label: 'Simulasi JLPT' },
  { key: 'job-interview', label: 'Simulasi Wawancara Kerja' },
  { key: 'ssw-interview', label: 'Simulasi Wawancara SSW' },
  { key: 'kaigo-interview', label: 'Simulasi Wawancara Kaigo' }
]

const SCENARIOS = [
  'Ordering food at a restaurant',
  'Checking in at a hotel',
  'Asking for directions to the station',
  'Small talk with a coworker',
  'Shopping at a convenience store',
  'A job interview in Japanese',
  'An SSW visa interview about nursing care work',
  'A Kaigo Fukushishi care scenario with a client'
]

const QUICK_ACTIONS = [
  { label: 'Koreksi kalimat ini', prefix: 'Tolong koreksi kalimat bahasa Jepang ini: ' },
  { label: 'Terjemahkan', prefix: 'Tolong terjemahkan ke bahasa Jepang: ' },
  { label: 'Jelaskan grammar', prefix: 'Tolong jelaskan grammar ini: ' }
]

export default function KaiwaAI() {
  const { user, updateProfile } = useAuth()
  const [mode, setMode] = useState<string | null>(null)
  const [scenario, setScenario] = useState<string | null>(null)
  const [messages, setMessages] = useState<KaiwaMessage[]>([])
  const [correction, setCorrection] = useState<string | null>(null)
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [score, setScore] = useState<{ score: number; feedback: string } | null>(null)
  const [scoring, setScoring] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  const isFreeChat = mode === 'free-chat'

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  function startScenario(s: string) {
    setScenario(s)
    setMessages([])
    setCorrection(null)
    setScore(null)
    setError(null)
  }

  function selectMode(key: string) {
    setMode(key)
    if (key === 'free-chat') {
      startScenario('Tanya jawab bebas seputar bahasa dan budaya Jepang dengan Arif Boncel Sensei')
    }
  }

  async function send(overrideText?: string) {
    const text = overrideText ?? input
    if (!text.trim() || !scenario || !mode || sending) return
    const userMsg: KaiwaMessage = { role: 'user', text: text.trim(), timestamp: Date.now() }
    const nextMessages = [...messages, userMsg]
    setMessages(nextMessages)
    setInput('')
    setSending(true)
    setError(null)
    setCorrection(null)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scenario, mode, action: 'reply', messages: nextMessages.map((m) => ({ role: m.role, text: m.text })) })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Request failed')

      const reply: KaiwaMessage = { role: 'assistant', text: data.reply, timestamp: Date.now() }
      const finalMessages = [...nextMessages, reply]
      setMessages(finalMessages)
      if (data.correction) setCorrection(data.correction)

      if (user) {
        const kaiwaCollection = userKaiwaCollection(user.uid)
        await kaiwaCollection.create({ id: `kaiwa-${Date.now()}`, scenario: `[${mode}] ${scenario}`, createdAt: Date.now(), messages: finalMessages })
        updateProfile(applyStudySession(user, 2))
        logActivity(user.uid, 'quizzesCompleted')
      }
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : `Tidak bisa menghubungi ${SENSEI_NAME}. Fitur ini butuh ANTHROPIC_API_KEY di deployment Anda (lihat README).`
      )
    } finally {
      setSending(false)
    }
  }

  async function endAndScore() {
    if (messages.filter((m) => m.role === 'user').length === 0) return
    setScoring(true)
    setError(null)
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scenario, mode, action: 'score', messages: messages.map((m) => ({ role: m.role, text: m.text })) })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Request failed')
      setScore(data)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not score this conversation.')
    } finally {
      setScoring(false)
    }
  }

  if (!mode) {
    return (
      <div>
        <div className="flex items-center gap-2 mb-1">
          <GraduationCap size={22} className="text-blue-500" />
          <h1 className="text-xl font-bold">{SENSEI_NAME}</h1>
        </div>
        <p className="text-sm text-ink-soft mb-5">Guru AI pribadimu — tanya bebas, roleplay percakapan, atau simulasi wawancara.</p>
        <div className="grid sm:grid-cols-2 gap-3">
          {MODES.map((m) => (
            <button key={m.key} onClick={() => selectMode(m.key)} className="card p-5 text-left hover:shadow-card transition font-semibold text-sm">
              {m.label}
            </button>
          ))}
        </div>
      </div>
    )
  }

  if (!isFreeChat && !scenario) {
    return (
      <div>
        <div className="flex items-center justify-between mb-1">
          <h1 className="text-xl font-bold">{SENSEI_NAME} — {MODES.find((m) => m.key === mode)?.label}</h1>
          <button className="btn-secondary text-xs" onClick={() => setMode(null)}>Ganti mode</button>
        </div>
        <p className="text-sm text-ink-soft mb-5">Pilih skenario untuk memulai roleplay.</p>
        <div className="grid sm:grid-cols-2 gap-3">
          {SCENARIOS.map((s) => (
            <button key={s} onClick={() => startScenario(s)} className="card p-5 text-left hover:shadow-card transition flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl2 bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <MessageCircle size={18} />
              </div>
              <span className="text-sm font-semibold">{s}</span>
            </button>
          ))}
        </div>
        <div className="card p-4 mt-5 flex items-start gap-2 text-xs text-ink-soft">
          <AlertCircle size={16} className="shrink-0 mt-0.5" />
          <p>
            {SENSEI_NAME} memanggil server function yang terhubung ke Anthropic API. Butuh <code>ANTHROPIC_API_KEY</code> di
            environment deployment Anda — lihat bagian Kaiwa AI di README.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-lg mx-auto flex flex-col h-[calc(100vh-140px)]">
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="text-xs text-ink-soft">{SENSEI_NAME} · {MODES.find((m) => m.key === mode)?.label}</p>
          {!isFreeChat && <p className="font-semibold text-sm">{scenario}</p>}
        </div>
        <div className="flex gap-2">
          {!isFreeChat && (
            <button className="btn-secondary text-xs" onClick={endAndScore} disabled={scoring}>
              <Award size={14} /> {scoring ? 'Menilai…' : 'Selesai & Nilai'}
            </button>
          )}
          <button className="btn-secondary text-xs" onClick={() => setMode(null)}>
            Ganti mode
          </button>
        </div>
      </div>

      {score && (
        <div className="card p-4 mb-3 bg-gold-50 border-gold-400">
          <p className="text-sm font-bold text-gold-600">Skor: {score.score}/100</p>
          <p className="text-xs text-ink-soft mt-1">{score.feedback}</p>
        </div>
      )}

      <div className="flex-1 overflow-y-auto space-y-3 pr-1">
        {messages.length === 0 && (
          <p className="text-sm text-ink-soft text-center mt-8">
            {isFreeChat ? `Tanya apa saja ke ${SENSEI_NAME} — koreksi kalimat, terjemahan, atau penjelasan grammar.` : 'Mulai percakapan — coba ketik こんにちは！'}
          </p>
        )}
        {messages.map((m, i) => (
          <div key={i} className={clsx('max-w-[80%] px-4 py-2.5 rounded-xl2 text-sm', m.role === 'user' ? 'ml-auto bg-blue-500 text-white' : 'bg-surface border border-line')}>
            <p className="whitespace-pre-line">{m.text}</p>
          </div>
        ))}
        {correction && (
          <p className="text-xs text-hanko px-1">💡 Koreksi: {correction}</p>
        )}
        {sending && <div className="max-w-[60%] px-4 py-2.5 rounded-xl2 text-sm bg-surface border border-line text-ink-soft">…</div>}
        {error && <p className="text-xs text-hanko px-1">{error}</p>}
        <div ref={bottomRef} />
      </div>

      {isFreeChat && (
        <div className="flex gap-2 overflow-x-auto pb-2 pt-2">
          {QUICK_ACTIONS.map((qa) => (
            <button
              key={qa.label}
              onClick={() => setInput(qa.prefix)}
              className="text-xs font-semibold whitespace-nowrap bg-blue-50 text-blue-600 px-3 py-1.5 rounded-full"
            >
              {qa.label}
            </button>
          ))}
        </div>
      )}

      <div className="flex gap-2 pt-2">
        <input
          className="input"
          placeholder={isFreeChat ? 'Tulis pertanyaanmu…' : '日本語で話してみましょう…'}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && send()}
        />
        <button className="btn-primary px-4" onClick={() => send()} disabled={sending || !input.trim()}>
          <Send size={16} />
        </button>
      </div>
    </div>
  )
}

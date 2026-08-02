import { useEffect, useState, useRef } from 'react'
import clsx from 'clsx'
import { Clock, Volume2, Award, Download, Share2, X, CheckCircle2 } from 'lucide-react'
import type { ExamQuestion } from '../../types'
import { useAuth } from '../../contexts/AuthContext'
import { applyStudySession } from '../../utils/progress'
import { logActivity } from '../../utils/gamification'

function formatTime(sec: number) {
  const m = Math.floor(sec / 60)
  const s = sec % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

function speakJapanese(text: string) {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel()
    const utter = new SpeechSynthesisUtterance(text)
    utter.lang = 'ja-JP'
    utter.rate = 0.9
    window.speechSynthesis.speak(utter)
  }
}

export function ExamRunner({
  questions,
  timeLimitSec,
  onFinish,
  onSubmit
}: {
  questions: ExamQuestion[]
  timeLimitSec: number
  onFinish: () => void
  onSubmit?: (score: number, answers: Record<string, number>) => void
}) {
  const { user, updateProfile } = useAuth()
  const [index, setIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, number>>({})
  const [remaining, setRemaining] = useState(timeLimitSec)
  const [submitted, setSubmitted] = useState(false)
  const [showCertificate, setShowCertificate] = useState(false)
  const certRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (submitted) return
    const t = setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) {
          clearInterval(t)
          setSubmitted(true)
          return 0
        }
        return r - 1
      })
    }, 1000)
    return () => clearInterval(t)
  }, [submitted])

  useEffect(() => {
    if (submitted) {
      const score = questions.filter((q) => answers[q.id] === q.correctIndex).length
      const passRatio = score / questions.length
      const isPass = passRatio >= 0.75

      if (user) {
        const bonusXp = isPass ? score * 15 : score * 8
        updateProfile(applyStudySession(user, bonusXp))
        logActivity(user.uid, 'examsCompleted', 1, {
          type: 'exam',
          title: `Ujian JLPT ${questions[0]?.level || ''} - ${isPass ? 'LULUS' : 'TIDAK LULUS'}`,
          xpGained: bonusXp
        })
        if (isPass) setShowCertificate(true)
      }
      onSubmit?.(score, answers)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [submitted])

  useEffect(() => {
    const q = questions[index]
    if (!submitted && q?.category === 'choukai') {
      speakJapanese(q.prompt)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, submitted])

  function select(qId: string, choiceIndex: number) {
    setAnswers((a) => ({ ...a, [qId]: choiceIndex }))
  }

  function finishExam() {
    setSubmitted(true)
  }

  if (submitted) {
    const score = questions.filter((q) => answers[q.id] === q.correctIndex).length
    const passRatio = score / questions.length
    const isPass = passRatio >= 0.75

    return (
      <div className="space-y-4">
        {showCertificate && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/60 backdrop-blur-sm animate-in fade-in">
            <div className="card max-w-2xl w-full p-0 overflow-hidden relative bg-white">
              <button
                onClick={() => setShowCertificate(false)}
                className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/50 text-ink-soft hover:bg-white transition"
              >
                <X size={20} />
              </button>

              {/* Certificate Template */}
              <div ref={certRef} className="p-10 border-[16px] border-blue-50 bg-[#fdfdfb] text-center space-y-6">
                <div className="space-y-2">
                  <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Award size={32} className="text-white" />
                  </div>
                  <h1 className="text-3xl font-display font-bold text-ink-dark">SERTIFIKAT KELULUSAN</h1>
                  <p className="text-sm font-bold text-blue-600 tracking-widest uppercase">NihonGoPlus Academy</p>
                </div>

                <div className="space-y-1">
                  <p className="text-xs text-ink-soft italic">Diberikan kepada:</p>
                  <p className="text-2xl font-display font-bold text-ink underline underline-offset-8">{user?.fullName}</p>
                </div>

                <div className="space-y-2 max-w-sm mx-auto">
                  <p className="text-sm text-ink leading-relaxed">
                    Telah dinyatakan <span className="font-bold text-mint-600 uppercase">LULUS</span> pada Simulasi Ujian
                  </p>
                  <p className="text-xl font-bold text-ink">JLPT {questions[0]?.level} Practice Exam</p>
                </div>

                <div className="grid grid-cols-2 gap-8 pt-6 border-t border-blue-100">
                  <div className="text-left">
                    <p className="text-[10px] text-ink-soft uppercase font-bold tracking-wider">Skor Akhir</p>
                    <p className="text-lg font-bold text-blue-600">{score} / {questions.length} ({Math.round(passRatio * 100)}%)</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-ink-soft uppercase font-bold tracking-wider">Tanggal</p>
                    <p className="text-lg font-bold text-ink">{new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                  </div>
                </div>

                <div className="pt-4 flex justify-center gap-10">
                  <div className="text-center">
                    <div className="w-20 h-[1px] bg-ink-soft mx-auto mb-1"></div>
                    <p className="text-[8px] font-bold text-ink-soft uppercase">Arif Boncel Sensei</p>
                  </div>
                  <div className="text-center">
                    <img src="/logo.png" alt="" className="h-6 grayscale opacity-30 mx-auto" />
                  </div>
                </div>
              </div>

              <div className="p-4 bg-blue-50 flex gap-3">
                <button className="btn-primary flex-1 gap-2 py-3" onClick={() => window.print()}>
                  <Download size={18} /> Simpan PDF / Cetak
                </button>
                <button className="btn-secondary gap-2 px-6" onClick={() => setShowCertificate(false)}>
                  Tutup
                </button>
              </div>
            </div>
          </div>
        )}

        <div className={clsx("card p-6 text-center border-t-8", isPass ? "border-t-mint-500" : "border-t-hanko")}>
          <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 bg-paper border border-line">
            {isPass ? <Award className="text-gold-500" /> : <X className="text-hanko" />}
          </div>
          <h2 className="text-xl font-bold mb-1">{isPass ? 'Selamat! Anda Lulus.' : 'Maaf, Anda Belum Lulus.'}</h2>
          <p className="text-4xl font-display font-bold text-blue-600 my-2">
            {score} / {questions.length}
          </p>
          <div className="flex items-center justify-center gap-4 text-xs font-bold uppercase tracking-wider">
            <span className="text-ink-soft">Akurasi: {Math.round(passRatio * 100)}%</span>
            <span className={clsx(isPass ? "text-mint-600" : "text-hanko")}>Target: 75%</span>
          </div>
          {isPass && (
            <button className="mt-4 text-blue-600 font-bold text-sm hover:underline" onClick={() => setShowCertificate(true)}>
              Lihat Sertifikat
            </button>
          )}
        </div>

        <h3 className="font-bold text-xs text-ink-soft uppercase tracking-widest px-1">Pembahasan Soal</h3>
        <div className="space-y-3">
          {questions.map((q, i) => {
            const chosen = answers[q.id]
            const isCorrect = chosen === q.correctIndex
            return (
              <div key={q.id} className="card p-4">
                <p className="text-sm font-bold mb-2 whitespace-pre-line">{i + 1}. {q.prompt}</p>
                <div className="space-y-1.5">
                  {q.choices.map((c, ci) => (
                    <div
                      key={ci}
                      className={clsx(
                        'text-xs px-3 py-2 rounded-lg border font-medium',
                        ci === q.correctIndex
                          ? 'border-mint-400 bg-mint-50 text-mint-700'
                          : ci === chosen
                            ? 'border-hanko bg-hanko/10 text-hanko'
                            : 'border-line text-ink-soft'
                      )}
                    >
                      {c}
                    </div>
                  ))}
                </div>
                <div className="mt-3 pt-3 border-t border-line flex items-start gap-2">
                  <div className={clsx("w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5", isCorrect ? "bg-mint-100 text-mint-700" : "bg-hanko/10 text-hanko")}>
                    {isCorrect ? <CheckCircle2 size={12} /> : <X size={12} />}
                  </div>
                  <p className="text-xs text-ink-soft leading-relaxed"><span className="font-bold text-ink">Penjelasan:</span> {q.explanation}</p>
                </div>
              </div>
            )
          })}
        </div>

        <button className="btn-primary w-full py-4 text-base mt-6 shadow-lg" onClick={onFinish}>
          Kembali ke Exam Center
        </button>
      </div>
    )
  }

  const q = questions[index]

  return (
    <div className="max-w-xl mx-auto pb-10">
      <div className="flex items-center justify-between mb-4">
        <div className="flex flex-col">
          <p className="text-[10px] font-bold text-ink-soft uppercase tracking-wider">
            Nomor {index + 1} dari {questions.length}
          </p>
          <p className="text-xs font-bold text-blue-600 uppercase tracking-widest">{q.category}</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-hanko/5 text-hanko border border-hanko/10">
          <Clock size={14} />
          <span className="text-sm font-bold font-mono">{formatTime(remaining)}</span>
        </div>
      </div>

      <div className="card p-6 mb-4 shadow-sm">
        <p className="font-bold text-ink leading-relaxed whitespace-pre-line">{q.prompt}</p>
        {q.category === 'choukai' && (
          <button
            onClick={() => speakJapanese(q.prompt)}
            className="mt-4 btn-secondary py-1.5 text-[11px] gap-2 border-blue-100 text-blue-600 bg-blue-50/50"
          >
            <Volume2 size={14} /> Putar Ulang Audio
          </button>
        )}
      </div>

      <div className="space-y-2 mb-8">
        {q.choices.map((c, ci) => (
          <button
            key={ci}
            onClick={() => select(q.id, ci)}
            className={clsx(
              'w-full text-left px-5 py-4 rounded-xl border-2 text-sm font-bold transition-all duration-200',
              answers[q.id] === ci
                ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-sm translate-x-1'
                : 'border-paper-light hover:border-blue-200 hover:bg-paper-light text-ink-soft'
            )}
          >
            <span className="inline-block w-6 h-6 rounded-lg bg-line/50 text-[10px] text-center leading-6 mr-3">
              {String.fromCharCode(65 + ci)}
            </span>
            {c}
          </button>
        ))}
      </div>

      <div className="flex justify-between gap-3">
        <button
          className="btn-secondary flex-1 py-3"
          disabled={index === 0}
          onClick={() => setIndex((i) => Math.max(0, i - 1))}
        >
          Sebelumnya
        </button>
        {index + 1 < questions.length ? (
          <button className="btn-primary flex-1 py-3" onClick={() => setIndex((i) => i + 1)}>
            Selanjutnya
          </button>
        ) : (
          <button className="btn-primary flex-1 py-3 bg-mint-600 hover:bg-mint-700 border-none shadow-mint" onClick={finishExam}>
            Selesaikan Ujian
          </button>
        )}
      </div>
    </div>
  )
}

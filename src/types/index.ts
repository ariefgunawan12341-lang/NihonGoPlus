export type AccessType = 'public' | 'free' | 'premium'

export type JLPTLevel = 'N5' | 'N4' | 'N3' | 'N2' | 'N1'

export type UserRole = 'super_admin' | 'admin' | 'editor' | 'moderator' | 'user'

export interface UserProfile {
  uid: string
  email: string
  displayName: string
  username?: string
  photoURL?: string
  createdAt: number
  xp: number
  level: number
  streak: number
  lastStudyDate: string | null // ISO date (yyyy-mm-dd)
  isPremium: boolean
  isAdmin: boolean
  role?: UserRole
  premiumPlan?: 'monthly' | 'yearly' | null
  premiumExpire?: string | null // ISO date
  language?: 'en' | 'id' | 'ja'
}

export interface DownloadModule {
  id: string
  title: string
  description: string
  level: JLPTLevel
  fileUrl: string // Google Drive (or other) link, or a Supabase Storage URL
  premium: boolean // legacy flag, kept for back-compat; accessType is now the source of truth
  accessType?: AccessType
  order: number
}

export interface DailyActivity {
  date: string // ISO date
  flashcardsReviewed: number
  quizzesCompleted: number
  examsCompleted: number
}

export interface UserProgress {
  id: string // always 'progress' — one doc per user
  completedLessons: number
  activityLog: DailyActivity[]
  unlockedAchievements: string[]
}

export interface KanaChar {
  id: string
  kana: string
  romaji: string
  type: 'hiragana' | 'katakana'
  group: string // e.g. "vowels", "k-row", "dakuten", "combo"
}

export interface VocabWord {
  id: string
  level: JLPTLevel
  kanji: string // may be empty string if kana-only word
  kana: string
  romaji: string
  meaning: string
  example: string
  exampleMeaning: string
  tags: string[]
  favorite?: boolean
  accessType?: AccessType
  audioUrl?: string
  imageUrl?: string
}

export type QuestionCategory = 'moji' | 'goi' | 'bunpou' | 'dokkai' | 'choukai'

export interface ExamQuestion {
  id: string
  level: JLPTLevel
  category: QuestionCategory
  difficulty: 1 | 2 | 3
  prompt: string
  passage?: string
  choices: string[]
  correctIndex: number
  explanation: string
  tags: string[]
  accessType?: AccessType
  audioUrl?: string
  imageUrl?: string
}

export interface SrsCardState {
  wordId: string
  interval: number // days
  easeFactor: number
  repetitions: number
  dueDate: string // ISO date
}

export interface ExamAttempt {
  id: string
  level: JLPTLevel
  startedAt: number
  finishedAt: number | null
  answers: Record<string, number> // questionId -> chosen index
  score: number | null
  totalQuestions: number
}

export interface KaiwaMessage {
  role: 'user' | 'assistant'
  text: string
  timestamp: number
}

export interface KaiwaSession {
  id: string
  scenario: string
  createdAt: number
  messages: KaiwaMessage[]
}

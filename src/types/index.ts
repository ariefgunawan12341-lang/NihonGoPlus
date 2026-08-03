export type AccessType = 'public' | 'free' | 'premium'

export type JLPTLevel = 'N5' | 'N4' | 'N3' | 'N2' | 'N1'

export type UserRole = 'super_admin' | 'admin' | 'editor' | 'moderator' | 'user'

export interface UserProfile {
  id: string
  email: string
  username?: string
  fullName: string
  avatarUrl?: string
  role: UserRole
  status: 'active' | 'disabled'
  premium: boolean
  createdAt: number
  lastLogin?: number | null
  xp: number
  level: number
  streak: number
  lastStudyDate: string | null // ISO date (yyyy-mm-dd)
  isAdmin: boolean
  premiumPlan?: 'monthly' | 'yearly' | null
  premiumExpire?: string | null // ISO date
  language?: 'en' | 'id' | 'ja'
  bio?: string
  country?: string
  targetLevel?: JLPTLevel
}

export interface DownloadModule {
  id: string
  title: string
  description: string
  level: JLPTLevel
  fileUrl: string // URL to file (e.g. Google Drive or Firebase Storage)
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

export interface ActivityLogEntry {
  id: string
  type: 'lesson' | 'quiz' | 'exam' | 'flashcard' | 'achievement'
  title: string
  timestamp: number
  xpGained: number
}

export interface DailyChallenge {
  id: string
  title: string
  target: number
  current: number
  type: 'vocab' | 'kanji' | 'grammar' | 'exam'
  xpReward: number
  completed: boolean
}

export interface UserProgress {
  id: string // always 'progress' — one doc per user
  completedLessons: number
  activityLog: DailyActivity[]
  recentActivities: ActivityLogEntry[]
  dailyChallenge?: DailyChallenge
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

export interface Bookmark {
  id: string
  itemId: string
  itemType: 'vocab' | 'kanji' | 'grammar' | 'article'
  createdAt: number
}

export interface UserNote {
  id: string
  itemId: string
  note: string
  updatedAt: number
}

export interface UserNotification {
  id: string
  title: string
  body: string
  link?: string
  read: boolean
  type: 'system' | 'achievement' | 'promotion' | 'reminder'
  createdAt: number
}

export interface UserAchievement {
  id: string
  achievementId: string
  unlockedAt: number
}

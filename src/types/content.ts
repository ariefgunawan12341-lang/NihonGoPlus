import type { JLPTLevel, AccessType } from '.'

// Generic content-item shape reused across every "list of learning items"
// module (Kanji, Grammar, Modules/Lessons, SSW vocabulary, Kaigo Fukushishi
// material). This lets admins manage all of them through one CRUD pattern,
// and lets learner screens query by (kind, level, category) at Firestore
// scale instead of loading everything into memory.
export type ContentKind = 'kanji' | 'grammar' | 'module' | 'ssw' | 'kaigo'

export interface ContentItem {
  id: string
  kind: ContentKind
  level: JLPTLevel
  category?: string // e.g. SSW industry name, or Kaigo topic ("Medical Terms")
  title: string // e.g. kanji character, grammar point, module title, term
  reading?: string // kanji: on/kun reading. grammar: n/a
  meaning: string
  example: string
  exampleMeaning: string
  order: number
  accessType?: AccessType
  audioUrl?: string
  imageUrl?: string
  pdfUrl?: string
  videoUrl?: string
}

export const SSW_INDUSTRIES = [
  'Kaigo (Nursing Care)', 'Agriculture', 'Food Service', 'Hotel', 'Building Cleaning',
  'Construction', 'Manufacturing', 'Automobile', 'Aviation', 'Railway',
  'Shipbuilding', 'Forestry', 'Fisheries', 'Food & Beverage Manufacturing'
] as const

export const KAIGO_TOPICS = [
  'Vocabulary', 'Grammar', 'Medical Terms', 'Care Knowledge',
  'Elderly Care', 'Disability Care', 'Nursing', 'Health Care', 'Ethics', 'Law'
] as const

// ---- CMS content types (article/blog system) ----

export type PublishStatus = 'draft' | 'published' | 'scheduled' | 'archived'

export interface Article {
  id: string
  title: string
  slug: string
  thumbnailUrl?: string
  bodyHtml: string // rich text (Tiptap) output
  category: string
  tags: string[]
  seoTitle?: string
  seoDescription?: string
  status: PublishStatus
  publishAt?: number // epoch ms, used when status === 'scheduled'
  accessType: AccessType
  authorUid: string
  authorName: string
  createdAt: number
  updatedAt: number
}

export interface Comment {
  id: string
  articleId: string
  authorUid: string
  authorName: string
  body: string
  createdAt: number
  approved: boolean
}

export interface Announcement {
  id: string
  message: string
  active: boolean
  level: 'info' | 'success' | 'warning'
  createdAt: number
}

export interface SiteSettings {
  id: 'site'
  siteName: string
  logoUrl?: string
  faviconUrl?: string
  bannerUrl?: string
  contactEmail?: string
  telegram?: string
  instagram?: string
  youtube?: string
  tiktok?: string
  facebook?: string
  googleAnalyticsId?: string
  seoDefaultTitle?: string
  seoDefaultDescription?: string
  smtpHost?: string
  smtpPort?: string
  smtpUser?: string
  // Payment (manual QRIS/DANA verification — no payment gateway configured,
  // so these just drive what's shown to the user; an admin confirms orders
  // by hand in /admin/premium-orders).
  qrisImageUrl?: string
  danaNumber?: string
  danaName?: string
  paymentInstructions?: string
}

export type PaymentMethod = 'qris' | 'dana'
export type PaymentOrderStatus = 'pending' | 'confirmed' | 'rejected'

export interface PremiumOrder {
  id: string
  userUid: string
  userEmail: string
  userName: string
  packageId: string
  packageName: string
  price: number
  currency: string
  method: PaymentMethod
  proofUrl?: string
  note?: string
  status: PaymentOrderStatus
  createdAt: number
  reviewedAt?: number
  reviewedBy?: string
}

export interface PremiumPackage {
  id: string
  name: string
  plan: 'monthly' | 'yearly' | 'lifetime'
  price: number
  currency: string
  durationDays: number | null // null = lifetime
  benefits: string[]
  active: boolean
  order: number
}

export interface PageView {
  id: string
  path: string
  timestamp: number
}

import {
  Home, BookOpen, Type, Languages, BookMarked, PenTool, MessageCircle,
  Layers, GraduationCap, Briefcase, HeartHandshake, Timer, Crown,
  User, Settings, Coffee, ShieldCheck, Trophy, FolderDown, Newspaper, Info, Mail
} from 'lucide-react'
import type { ComponentType } from 'react'

export interface NavItem {
  label: string
  path: string
  icon: ComponentType<{ size?: number; className?: string }>
  badge?: string
  inBottomNav?: boolean
}

export const primaryNav: NavItem[] = [
  { label: 'Home', path: '/', icon: Home, inBottomNav: true },
  { label: 'Basic Japanese', path: '/basics', icon: BookOpen },
  { label: 'Hiragana', path: '/basics/hiragana', icon: Type },
  { label: 'Katakana', path: '/basics/katakana', icon: Languages },
  { label: 'Kanji', path: '/basics/kanji', icon: PenTool },
  { label: 'Kotoba', path: '/vocabulary', icon: BookMarked, inBottomNav: true },
  { label: 'Bunpou', path: '/grammar', icon: Layers },
  { label: 'Arif Boncel Sensei', path: '/kaiwa-ai', icon: MessageCircle },
  { label: 'Flashcard', path: '/flashcards', icon: Layers, inBottomNav: true },
  { label: 'JLPT', path: '/jlpt', icon: GraduationCap },
  { label: 'JLPT Exam Center', path: '/exam-center', icon: Timer, inBottomNav: true },
  { label: 'SSW', path: '/ssw', icon: Briefcase },
  { label: 'Kaigo Fukushishi', path: '/kaigo-fukushishi', icon: HeartHandshake },
  { label: 'Artikel', path: '/articles', icon: Newspaper },
  { label: 'Leaderboard', path: '/leaderboard', icon: Trophy },
  { label: 'Download Module', path: '/downloads', icon: FolderDown },
  { label: 'Premium', path: '/premium', icon: Crown }
]

export const secondaryNav: NavItem[] = [
  { label: 'Profile', path: '/profile', icon: User, inBottomNav: true },
  { label: 'Settings', path: '/settings', icon: Settings },
  { label: 'About', path: '/about', icon: Info },
  { label: 'Contact', path: '/contact', icon: Mail },
  { label: 'Support Developer', path: '/support', icon: Coffee }
]

export const adminNavItem: NavItem = { label: 'Admin Panel', path: '/admin', icon: ShieldCheck }

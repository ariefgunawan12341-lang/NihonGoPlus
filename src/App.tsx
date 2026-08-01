import { Routes, Route } from 'react-router-dom'
import { AppLayout } from './components/layout/AppLayout'
import { RequireAuth, RequireAdmin } from './components/layout/RouteGuards'
import { ErrorBoundary } from './components/ErrorBoundary'
import { usePageViewLogger } from './hooks/usePageViewLogger'

import Login from './pages/Login'
import Signup from './pages/Signup'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import AdminLogin from './pages/AdminLogin'
import HomeRouter from './pages/HomeRouter'
import BasicsHub from './pages/BasicsHub'
import KanaPage from './pages/KanaPage'
import Kanji from './pages/Kanji'
import Grammar from './pages/Grammar'
import Vocabulary from './pages/Vocabulary'
import Flashcards from './pages/Flashcards'
import JLPTHub from './pages/JLPTHub'
import JLPTLevelPage from './pages/JLPTLevelPage'
import ExamCenter from './pages/ExamCenter'
import KaiwaAI from './pages/KaiwaAI'
import SSW from './pages/SSW'
import KaigoFukushishi from './pages/KaigoFukushishi'
import Downloads from './pages/Downloads'
import Leaderboard from './pages/Leaderboard'
import ArticleList from './pages/ArticleList'
import ArticleDetail from './pages/ArticleDetail'
import About from './pages/About'
import Contact from './pages/Contact'
import Profile from './pages/Profile'
import Settings from './pages/Settings'
import Premium from './pages/Premium'
import Support from './pages/Support'
import NotFound from './pages/NotFound'

import AdminShell from './pages/admin/AdminShell'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminVocabulary from './pages/admin/AdminVocabulary'
import AdminQuestions from './pages/admin/AdminQuestions'
import AdminContent from './pages/admin/AdminContent'
import AdminDownloadModules from './pages/admin/AdminDownloadModules'
import AdminImport from './pages/admin/AdminImport'
import AdminUsers from './pages/admin/AdminUsers'
import AdminPremium from './pages/admin/AdminPremium'
import AdminPremiumOrders from './pages/admin/AdminPremiumOrders'
import AdminArticles from './pages/admin/AdminArticles'
import AdminMedia from './pages/admin/AdminMedia'
import AdminSettings from './pages/admin/AdminSettings'
import AdminAnnouncements from './pages/admin/AdminAnnouncements'
import AdminComments from './pages/admin/AdminComments'
import AdminAnalytics from './pages/admin/AdminAnalytics'
import AdminActivityLog from './pages/admin/AdminActivityLog'

export default function App() {
  usePageViewLogger()

  return (
    <ErrorBoundary>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/admin/login" element={<AdminLogin />} />

        {/* Guest-accessible shell: browsing works without an account. Individual
            items (vocab/kanji/grammar/articles/etc.) enforce public/free/premium
            access on their own via AccessType + AccessGate components. */}
        <Route element={<AppLayout />}>
          <Route path="/" element={<HomeRouter />} />

          <Route path="/basics" element={<BasicsHub />} />
          <Route path="/basics/hiragana" element={<KanaPage script="hiragana" />} />
          <Route path="/basics/katakana" element={<KanaPage script="katakana" />} />
          <Route path="/basics/kanji" element={<Kanji />} />

          <Route path="/vocabulary" element={<Vocabulary />} />
          <Route path="/grammar" element={<Grammar />} />

          <Route path="/jlpt" element={<JLPTHub />} />
          <Route path="/jlpt/:level" element={<JLPTLevelPage />} />
          <Route path="/exam-center" element={<ExamCenter level="N5" />} />

          <Route path="/ssw" element={<SSW />} />
          <Route path="/kaigo-fukushishi" element={<KaigoFukushishi />} />
          <Route path="/downloads" element={<Downloads />} />

          <Route path="/articles" element={<ArticleList />} />
          <Route path="/articles/:slug" element={<ArticleDetail />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />

          <Route path="/premium" element={<Premium />} />
          <Route path="/support" element={<Support />} />

          {/* Personal / account-bound features still require a real account. */}
          <Route path="/leaderboard" element={<RequireAuth><Leaderboard /></RequireAuth>} />
          <Route path="/flashcards" element={<RequireAuth><Flashcards /></RequireAuth>} />
          <Route path="/kaiwa-ai" element={<RequireAuth><KaiwaAI /></RequireAuth>} />
          <Route path="/profile" element={<RequireAuth><Profile /></RequireAuth>} />
          <Route path="/settings" element={<RequireAuth><Settings /></RequireAuth>} />

          <Route
            element={
              <RequireAdmin>
                <AdminShell />
              </RequireAdmin>
            }
          >
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/vocabulary" element={<AdminVocabulary />} />
            <Route path="/admin/kanji" element={<AdminContent kind="kanji" />} />
            <Route path="/admin/grammar" element={<AdminContent kind="grammar" />} />
            <Route path="/admin/modules" element={<AdminContent kind="module" />} />
            <Route path="/admin/download-modules" element={<AdminDownloadModules />} />
            <Route path="/admin/ssw" element={<AdminContent kind="ssw" />} />
            <Route path="/admin/kaigo" element={<AdminContent kind="kaigo" />} />
            <Route path="/admin/questions" element={<AdminQuestions />} />
            <Route path="/admin/import" element={<AdminImport />} />
            <Route path="/admin/articles" element={<AdminArticles />} />
            <Route path="/admin/media" element={<AdminMedia />} />
            <Route path="/admin/announcements" element={<AdminAnnouncements />} />
            <Route path="/admin/comments" element={<AdminComments />} />
            <Route path="/admin/settings" element={<AdminSettings />} />
            <Route path="/admin/analytics" element={<AdminAnalytics />} />
            <Route path="/admin/activity-log" element={<AdminActivityLog />} />
            <Route path="/admin/users" element={<AdminUsers />} />
            <Route path="/admin/premium" element={<AdminPremium />} />
            <Route path="/admin/premium-orders" element={<AdminPremiumOrders />} />
          </Route>
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </ErrorBoundary>
  )
}

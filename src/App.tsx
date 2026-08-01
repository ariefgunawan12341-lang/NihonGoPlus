import { Routes, Route } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import { AppLayout } from './components/layout/AppLayout'
import { RequireAuth, RequireAdmin } from './components/layout/RouteGuards'
import { ErrorBoundary } from './components/ErrorBoundary'
import { usePageViewLogger } from './hooks/usePageViewLogger'

const Login = lazy(() => import('./pages/Login'))
const Signup = lazy(() => import('./pages/Signup'))
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'))
const ResetPassword = lazy(() => import('./pages/ResetPassword'))
const AdminLogin = lazy(() => import('./pages/AdminLogin'))
const HomeRouter = lazy(() => import('./pages/HomeRouter'))
const BasicsHub = lazy(() => import('./pages/BasicsHub'))
const KanaPage = lazy(() => import('./pages/KanaPage'))
const Kanji = lazy(() => import('./pages/Kanji'))
const Grammar = lazy(() => import('./pages/Grammar'))
const Vocabulary = lazy(() => import('./pages/Vocabulary'))
const Flashcards = lazy(() => import('./pages/Flashcards'))
const JLPTHub = lazy(() => import('./pages/JLPTHub'))
const JLPTLevelPage = lazy(() => import('./pages/JLPTLevelPage'))
const ExamCenter = lazy(() => import('./pages/ExamCenter'))
const KaiwaAI = lazy(() => import('./pages/KaiwaAI'))
const SSW = lazy(() => import('./pages/SSW'))
const KaigoFukushishi = lazy(() => import('./pages/KaigoFukushishi'))
const Downloads = lazy(() => import('./pages/Downloads'))
const Leaderboard = lazy(() => import('./pages/Leaderboard'))
const ArticleList = lazy(() => import('./pages/ArticleList'))
const ArticleDetail = lazy(() => import('./pages/ArticleDetail'))
const About = lazy(() => import('./pages/About'))
const Contact = lazy(() => import('./pages/Contact'))
const Profile = lazy(() => import('./pages/Profile'))
const Settings = lazy(() => import('./pages/Settings'))
const Premium = lazy(() => import('./pages/Premium'))
const Support = lazy(() => import('./pages/Support'))
const NotFound = lazy(() => import('./pages/NotFound'))

const AdminShell = lazy(() => import('./pages/admin/AdminShell'))
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'))
const AdminVocabulary = lazy(() => import('./pages/admin/AdminVocabulary'))
const AdminQuestions = lazy(() => import('./pages/admin/AdminQuestions'))
const AdminContent = lazy(() => import('./pages/admin/AdminContent'))
const AdminDownloadModules = lazy(() => import('./pages/admin/AdminDownloadModules'))
const AdminImport = lazy(() => import('./pages/admin/AdminImport'))
const AdminUsers = lazy(() => import('./pages/admin/AdminUsers'))
const AdminPremium = lazy(() => import('./pages/admin/AdminPremium'))
const AdminPremiumOrders = lazy(() => import('./pages/admin/AdminPremiumOrders'))
const AdminCoupons = lazy(() => import('./pages/admin/AdminCoupons'))
const AdminFeedback = lazy(() => import('./pages/admin/AdminFeedback'))
const AdminArticles = lazy(() => import('./pages/admin/AdminArticles'))
const AdminMedia = lazy(() => import('./pages/admin/AdminMedia'))
const AdminSettings = lazy(() => import('./pages/admin/AdminSettings'))
const AdminNotifications = lazy(() => import('./pages/admin/AdminNotifications'))
const AdminAnnouncements = lazy(() => import('./pages/admin/AdminAnnouncements'))
const AdminComments = lazy(() => import('./pages/admin/AdminComments'))
const AdminAnalytics = lazy(() => import('./pages/admin/AdminAnalytics'))
const AdminActivityLog = lazy(() => import('./pages/admin/AdminActivityLog'))

function PageLoader() {
  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center gap-3 text-center p-10">
      <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      <p className="text-sm font-bold text-ink-soft animate-pulse">Loading NihonGoPlus...</p>
    </div>
  )
}

export default function App() {
  usePageViewLogger()

  return (
    <ErrorBoundary>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/admin/login" element={<AdminLogin />} />

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
              <Route path="/admin/notifications" element={<AdminNotifications />} />
              <Route path="/admin/announcements" element={<AdminAnnouncements />} />
              <Route path="/admin/comments" element={<AdminComments />} />
              <Route path="/admin/settings" element={<AdminSettings />} />
              <Route path="/admin/analytics" element={<AdminAnalytics />} />
              <Route path="/admin/activity-log" element={<AdminActivityLog />} />
              <Route path="/admin/users" element={<AdminUsers />} />
              <Route path="/admin/premium" element={<AdminPremium />} />
              <Route path="/admin/premium-orders" element={<AdminPremiumOrders />} />
              <Route path="/admin/coupons" element={<AdminCoupons />} />
              <Route path="/admin/feedback" element={<AdminFeedback />} />
            </Route>
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </ErrorBoundary>
  )
}

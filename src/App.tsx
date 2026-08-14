import { Suspense, lazy } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router'
import { Layout } from './components/Layout'
import { ProtectedRoute } from './components/ProtectedRoute'
import { OwnerRoute } from './components/OwnerRoute'
import { AdminLayout } from './components/AdminLayout'
import { UsageTracker } from './components/UsageTracker'
import { AuthProvider } from './lib/auth'

// Public Routes (Lazy)
const HomePage = lazy(() => import('./pages/HomePage').then(m => ({ default: m.HomePage })))
const MeditationPage = lazy(() => import('./pages/MeditationPage').then(m => ({ default: m.MeditationPage })))
const QAPage = lazy(() => import('./pages/QAPage').then(m => ({ default: m.QAPage })))
const CentersPage = lazy(() => import('./pages/CentersPage').then(m => ({ default: m.CentersPage })))
const LoginPage = lazy(() => import('./pages/LoginPage').then(m => ({ default: m.LoginPage })))
const NotFoundPage = lazy(() => import('./pages/NotFoundPage').then(m => ({ default: m.NotFoundPage })))

// Protected CMS Routes (Lazy)
const AdminDashboardPage = lazy(() => import('./pages/admin/AdminDashboardPage').then(m => ({ default: m.AdminDashboardPage })))
const AdminMeditationPage = lazy(() => import('./pages/admin/AdminMeditationPage').then(m => ({ default: m.AdminMeditationPage })))
const AdminMeditationNewPage = lazy(() => import('./pages/admin/AdminMeditationNewPage').then(m => ({ default: m.AdminMeditationNewPage })))
const AdminMeditationEditPage = lazy(() => import('./pages/admin/AdminMeditationEditPage').then(m => ({ default: m.AdminMeditationEditPage })))
const AdminMeditationAudioPage = lazy(() => import('./pages/admin/AdminMeditationAudioPage').then(m => ({ default: m.AdminMeditationAudioPage })))
const AdminMeditationTranscriptPage = lazy(() => import('./pages/admin/AdminMeditationTranscriptPage').then(m => ({ default: m.AdminMeditationTranscriptPage })))
const AdminMeditationSubtitlesPage = lazy(() => import('./pages/admin/AdminMeditationSubtitlesPage').then(m => ({ default: m.AdminMeditationSubtitlesPage })))
const AdminQAPage = lazy(() => import('./pages/admin/AdminQAPage').then(m => ({ default: m.AdminQAPage })))
const AdminQANewPage = lazy(() => import('./pages/admin/AdminQANewPage').then(m => ({ default: m.AdminQANewPage })))
const AdminQAEditPage = lazy(() => import('./pages/admin/AdminQAEditPage').then(m => ({ default: m.AdminQAEditPage })))
const AdminCentersPage = lazy(() => import('./pages/admin/AdminCentersPage').then(m => ({ default: m.AdminCentersPage })))
const AdminCentersNewPage = lazy(() => import('./pages/admin/AdminCentersNewPage').then(m => ({ default: m.AdminCentersNewPage })))
const AdminCentersEditPage = lazy(() => import('./pages/admin/AdminCentersEditPage').then(m => ({ default: m.AdminCentersEditPage })))
const AdminBioLinksPage = lazy(() => import('./pages/admin/AdminBioLinksPage').then(m => ({ default: m.AdminBioLinksPage })))
const AdminBioLinksNewPage = lazy(() => import('./pages/admin/AdminBioLinksNewPage').then(m => ({ default: m.AdminBioLinksNewPage })))
const AdminBioLinksEditPage = lazy(() => import('./pages/admin/AdminBioLinksEditPage').then(m => ({ default: m.AdminBioLinksEditPage })))
const AdminLanguagesPage = lazy(() => import('./pages/admin/AdminLanguagesPage').then(m => ({ default: m.AdminLanguagesPage })))
const AdminTeamPage = lazy(() => import('./pages/admin/AdminTeamPage').then(m => ({ default: m.AdminTeamPage })))
const AdminAnalyticsPage = lazy(() => import('./pages/admin/AdminAnalyticsPage').then(m => ({ default: m.AdminAnalyticsPage })))

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <UsageTracker />
        <Suspense fallback={<div className="flex h-screen items-center justify-center p-8"><div className="h-8 w-8 animate-spin rounded-full border-4 border-neutral-200 border-t-neutral-800"></div></div>}>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Layout />}>
              <Route index element={<HomePage />} />
              <Route path="meditation" element={<MeditationPage />} />
              <Route path="qa" element={<QAPage />} />
              <Route path="centers" element={<CentersPage />} />
              <Route path="admin/login" element={<LoginPage />} />
            </Route>

            {/* Protected CMS Routes */}
            <Route path="admin" element={<ProtectedRoute />}>
              <Route element={<AdminLayout />}>
                <Route index element={<AdminDashboardPage />} />
                <Route path="meditation" element={<AdminMeditationPage />} />
                <Route path="meditation/new" element={<AdminMeditationNewPage />} />
                <Route path="meditation/:trackId/edit" element={<AdminMeditationEditPage />} />
                <Route path="meditation/:trackId/audio" element={<AdminMeditationAudioPage />} />
                <Route path="meditation/:trackId/transcript" element={<AdminMeditationTranscriptPage />} />
                <Route path="meditation/:trackId/subtitles" element={<AdminMeditationSubtitlesPage />} />
                <Route path="qa" element={<AdminQAPage />} />
                <Route path="qa/new" element={<AdminQANewPage />} />
                <Route path="qa/:qaId/edit" element={<AdminQAEditPage />} />
                <Route path="centers" element={<AdminCentersPage />} />
                <Route path="centers/new" element={<AdminCentersNewPage />} />
                <Route path="centers/:centerId/edit" element={<AdminCentersEditPage />} />
                <Route path="bio-links" element={<AdminBioLinksPage />} />
                <Route path="bio-links/new" element={<AdminBioLinksNewPage />} />
                <Route path="bio-links/:linkId/edit" element={<AdminBioLinksEditPage />} />
                <Route path="languages" element={<AdminLanguagesPage />} />
                <Route path="analytics" element={<AdminAnalyticsPage />} />
                <Route
                  path="team"
                  element={
                    <OwnerRoute>
                      <AdminTeamPage />
                    </OwnerRoute>
                  }
                />
              </Route>
            </Route>

            {/* Fallback */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App

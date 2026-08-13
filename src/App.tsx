import { BrowserRouter, Routes, Route } from 'react-router'
import { Layout } from './components/Layout'
import { ProtectedRoute } from './components/ProtectedRoute'
import { OwnerRoute } from './components/OwnerRoute'
import { AdminLayout } from './components/AdminLayout'
import { AuthProvider } from './lib/auth'

import { HomePage } from './pages/HomePage'
import { MeditationPage } from './pages/MeditationPage'
import { QAPage } from './pages/QAPage'
import { CentersPage } from './pages/CentersPage'
import { LoginPage } from './pages/LoginPage'
import { NotFoundPage } from './pages/NotFoundPage'

import { AdminDashboardPage } from './pages/admin/AdminDashboardPage'
import { AdminMeditationPage } from './pages/admin/AdminMeditationPage'
import { AdminMeditationNewPage } from './pages/admin/AdminMeditationNewPage'
import { AdminMeditationEditPage } from './pages/admin/AdminMeditationEditPage'
import { AdminMeditationAudioPage } from './pages/admin/AdminMeditationAudioPage'
import { AdminMeditationTranscriptPage } from './pages/admin/AdminMeditationTranscriptPage'
import { AdminMeditationSubtitlesPage } from './pages/admin/AdminMeditationSubtitlesPage'
import { AdminQAPage } from './pages/admin/AdminQAPage'
import { AdminCentersPage } from './pages/admin/AdminCentersPage'
import { AdminBioLinksPage } from './pages/admin/AdminBioLinksPage'
import { AdminLanguagesPage } from './pages/admin/AdminLanguagesPage'
import { AdminTeamPage } from './pages/admin/AdminTeamPage'

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
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
              <Route path="centers" element={<AdminCentersPage />} />
              <Route path="bio-links" element={<AdminBioLinksPage />} />
              <Route path="languages" element={<AdminLanguagesPage />} />
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
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App

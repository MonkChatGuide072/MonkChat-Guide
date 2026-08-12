import { BrowserRouter, Routes, Route } from 'react-router'
import { Layout } from './components/Layout'
import { ProtectedRoute } from './components/ProtectedRoute'
import { AuthProvider } from './lib/auth'
import { HomePage } from './pages/HomePage'
import { MeditationPage } from './pages/MeditationPage'
import { QAPage } from './pages/QAPage'
import { CentersPage } from './pages/CentersPage'
import { LoginPage } from './pages/LoginPage'
import { AdminPage } from './pages/AdminPage'
import { NotFoundPage } from './pages/NotFoundPage'

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            {/* Public Routes */}
            <Route index element={<HomePage />} />
            <Route path="meditation" element={<MeditationPage />} />
            <Route path="qa" element={<QAPage />} />
            <Route path="centers" element={<CentersPage />} />
            <Route path="admin/login" element={<LoginPage />} />

            {/* Protected CMS Routes */}
            <Route path="admin" element={<ProtectedRoute />}>
              <Route index element={<AdminPage />} />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App

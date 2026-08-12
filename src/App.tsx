import { BrowserRouter, Routes, Route } from 'react-router'
import { Layout } from './components/Layout'
import { HomePage } from './pages/HomePage'
import { MeditationPage } from './pages/MeditationPage'
import { QAPage } from './pages/QAPage'
import { CentersPage } from './pages/CentersPage'
import { LoginPage } from './pages/LoginPage'
import { NotFoundPage } from './pages/NotFoundPage'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="meditation" element={<MeditationPage />} />
          <Route path="qa" element={<QAPage />} />
          <Route path="centers" element={<CentersPage />} />
          <Route path="admin/login" element={<LoginPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App

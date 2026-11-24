import { useTranslation } from 'react-i18next'
import { useAuth } from '../../lib/auth'
import { invokeStudentCohorts } from '../../lib/studentPractice'
import { StudentAccessWorkspace, type StudentAccessApi } from '../../components/admin/StudentAccessWorkspace'

const api: StudentAccessApi = {
  list: () => invokeStudentCohorts({ action: 'list' }),
  request: body => invokeStudentCohorts(body),
}

export function AdminStudentsPage() {
  const { profile } = useAuth()
  const { t, i18n } = useTranslation()
  if (!profile?.is_active || profile.role !== 'owner') return <p role="alert">{t('admin.accessDeniedTitle')}</p>
  return <StudentAccessWorkspace api={api} english={(i18n.resolvedLanguage || i18n.language || 'th').startsWith('en')} />
}

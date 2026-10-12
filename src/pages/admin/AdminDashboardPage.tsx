import { Link } from 'react-router'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../../lib/auth'

export function AdminDashboardPage() {
  const { profile } = useAuth()
  const { t } = useTranslation()
  const owner = profile?.role === 'owner'
  const pages = [
    { number: '01', key: 'meditation', path: '/admin/meditation', add: '/admin/meditation/new' },
    { number: '02', key: 'qa', path: '/admin/qa', add: '/admin/qa/new' },
    { number: '03', key: 'centers', path: '/admin/centers', add: '/admin/centers/new' },
    { number: '04', key: 'bioLinks', path: '/admin/bio-links', add: '/admin/bio-links/new' },
  ]

  return <div className="mx-auto max-w-6xl space-y-6 pb-10">
    <header className="rounded-3xl bg-[#293029] p-6 text-white shadow-[0_18px_45px_rgba(36,40,32,.16)] sm:p-9">
      <p className="text-xs font-bold tracking-[.16em] text-[#eec590]">MONK CHAT · CMS</p>
      <div className="mt-4 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div><h1 className="text-3xl font-bold sm:text-4xl">{t('management.dashboardMainTitle')}</h1><p className="mt-3 max-w-xl text-sm leading-6 text-white/80">{t('management.dashboardMainDescription')}</p></div>
        <span className="w-fit rounded-full border border-white/35 bg-white/10 px-4 py-2 text-sm font-semibold">{t('management.dashboardYourRole')}: {t(owner ? 'management.owner' : 'management.member')}</span>
      </div>
    </header>

    <div className="grid gap-6 lg:grid-cols-[minmax(0,1.7fr)_minmax(270px,1fr)]">
      <section aria-labelledby="content-heading" className="min-w-0 space-y-4">
        <h2 id="content-heading" className="text-xl font-bold text-[#293029]">{t('management.dashboardMainTitle')}</h2>
        {owner && <Link to="/admin/home" className="group flex min-h-44 flex-col justify-between overflow-hidden rounded-3xl bg-[#a65338] p-6 text-white shadow-[0_12px_30px_rgba(126,53,32,.16)] transition-transform hover:-translate-y-0.5 sm:p-7">
          <span className="text-xs font-bold tracking-[.14em] text-white/75">01 / HOME · 4 IMAGES</span>
          <span><strong className="block text-2xl font-bold">{t('management.homeTitle')}</strong><span className="mt-2 block text-sm text-white/90">{t('management.dashboardHomeDescription')}</span></span>
          <span className="self-end text-sm font-bold">{t('admin.dashboard.openModule')} ↗</span>
        </Link>}
        <div className="overflow-hidden rounded-3xl border border-[#ded3c3] bg-[#fffcf7]">
          {pages.map((page) => <div key={page.key} className="flex flex-wrap items-center gap-4 border-b border-[#e6ddcf] p-5 last:border-0 sm:flex-nowrap">
            <span className="self-start text-xs font-bold text-[#a65338]">{page.number}</span>
            <div className="min-w-0 flex-1"><h3 className="font-bold text-[#293029]">{t(`admin.modules.${page.key}.title`)}</h3><p className="mt-1 text-sm leading-5 text-[#5d6058]">{t(`admin.modules.${page.key}.description`)}</p></div>
            <div className="flex w-full gap-2 sm:w-auto"><Link to={page.path} className="inline-flex min-h-11 items-center rounded-full border border-[#bbb3a5] px-4 text-sm font-semibold text-[#293029]">{t('admin.dashboard.openModule')}</Link><Link to={page.add} className="inline-flex min-h-11 items-center rounded-full bg-[#293029] px-4 text-sm font-semibold text-white">+ {t('management.dashboardAdd')}</Link></div>
          </div>)}
        </div>
      </section>

      <aside aria-labelledby="access-heading" className="space-y-4">
        <h2 id="access-heading" className="text-xl font-bold text-[#293029]">{t('management.dashboardSettingsTitle')}</h2>
        <div className="rounded-3xl border border-[#ded3c3] bg-white p-6 text-sm leading-6 text-[#464c42]">
          <p className="font-bold text-[#293029]">{t('management.teamCapabilitiesTitle')}</p>
          <p className="mt-2">{t('management.teamCapabilitiesDescription')}</p>
          <p className="mt-4 rounded-2xl bg-[#f8f0e4] p-4">{t(owner ? 'management.teamOwnerRights' : 'management.teamMemberRights')}</p>
          {owner && <Link to="/admin/team" className="mt-4 inline-flex min-h-11 items-center font-bold text-[#91402b] underline underline-offset-4">{t('management.teamTitle')} ↗</Link>}
        </div>
        <div className="rounded-3xl border border-[#ded3c3] bg-white p-5">
          <Link to="/admin/languages" className="block min-h-11 py-2 font-semibold text-[#293029]">{t('admin.modules.languages.title')} ↗</Link>
          <Link to="/admin/analytics" className="block min-h-11 border-t border-[#eee5d9] py-2 font-semibold text-[#293029]">{t('admin.modules.analytics.title')} ↗</Link>
          <Link to="/" target="_blank" rel="noopener noreferrer" className="block min-h-11 border-t border-[#eee5d9] py-2 font-semibold text-[#91402b]">{t('admin.nav.publicSite')} ↗</Link>
        </div>
      </aside>
    </div>
  </div>
}

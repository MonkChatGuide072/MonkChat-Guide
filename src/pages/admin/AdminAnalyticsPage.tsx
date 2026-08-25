import { useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../../lib/auth'
import { supabaseClient } from '../../lib/supabase'
import type { UsageEventType, UserRole } from '../../types/content'

type RangeDays = 7 | 30

interface UsageEventRow {
  id: string
  event_type: UsageEventType
  visitor_id: string | null
  session_id: string | null
  page_path: string | null
  resource_type: 'meditation_track' | 'bio_link' | null
  resource_id: string | null
  created_at: string
}

interface AuditLogRow {
  id: string
  actor_user_id: string | null
  actor_display_name: string
  actor_role: UserRole
  action: 'create' | 'update' | 'delete'
  entity_type: string
  entity_id: string | null
  occurred_at: string
}

interface DailyPoint {
  key: string
  label: string
  visitors: number
  events: number
}

function maskIdentifier(value: string | null): string {
  return value ? `${value.slice(0, 8).toUpperCase()}…` : '—'
}

function formatDateTime(value: string, language: string): string {
  return new Intl.DateTimeFormat(language.startsWith('en') ? 'en-GB' : 'th-TH', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}

function toDateKey(value: string | Date): string {
  const date = typeof value === 'string' ? new Date(value) : value
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function AdminAnalyticsPage() {
  const { t, i18n } = useTranslation()
  const { profile } = useAuth()
  const isOwner = profile?.role === 'owner'
  const [rangeDays, setRangeDays] = useState<RangeDays>(7)
  const [usageEvents, setUsageEvents] = useState<UsageEventRow[]>([])
  const [auditLogs, setAuditLogs] = useState<AuditLogRow[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadAnalytics = useCallback(async () => {
    if (!supabaseClient) {
      setError(t('admin.analytics.errorNoClient'))
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setError(null)

    const rangeStart = new Date()
    rangeStart.setDate(rangeStart.getDate() - rangeDays + 1)
    rangeStart.setHours(0, 0, 0, 0)

    try {
      const usageResult = await supabaseClient
        .from('usage_events')
        .select('id,event_type,visitor_id,session_id,page_path,resource_type,resource_id,created_at')
        .gte('created_at', rangeStart.toISOString())
        .order('created_at', { ascending: false })
        .limit(5000)

      if (usageResult.error) throw usageResult.error

      setUsageEvents((usageResult.data as UsageEventRow[]) ?? [])

      if (isOwner) {
        const auditResult = await supabaseClient
          .from('admin_audit_logs')
          .select('id,actor_user_id,actor_display_name,actor_role,action,entity_type,entity_id,occurred_at')
          .order('occurred_at', { ascending: false })
          .limit(100)

        if (auditResult.error) throw auditResult.error
        setAuditLogs((auditResult.data as AuditLogRow[]) ?? [])
      } else {
        setAuditLogs([])
      }
    } catch {
      setError(t('admin.analytics.errorLoad'))
    } finally {
      setIsLoading(false)
    }
  }, [isOwner, rangeDays, t])

  useEffect(() => {
    void loadAnalytics()
  }, [loadAnalytics])

  const summary = useMemo(() => {
    const visitorIds = new Set(
      usageEvents.flatMap((event) => event.visitor_id ? [event.visitor_id] : []),
    )
    const sessionIds = new Set(
      usageEvents.flatMap((event) => event.session_id ? [event.session_id] : []),
    )

    return {
      visitors: visitorIds.size,
      sessions: sessionIds.size,
      pageViews: usageEvents.filter((event) => event.event_type === 'page_view').length,
      audioPlays: usageEvents.filter((event) => event.event_type === 'audio_play').length,
      audioCompletes: usageEvents.filter((event) => event.event_type === 'audio_complete').length,
      bioClicks: usageEvents.filter((event) => event.event_type === 'bio_link_click').length,
    }
  }, [usageEvents])

  const dailyPoints = useMemo<DailyPoint[]>(() => {
    const language = i18n.resolvedLanguage || i18n.language || 'th'
    const points: DailyPoint[] = []
    const visibleDays = rangeDays

    for (let offset = visibleDays - 1; offset >= 0; offset -= 1) {
      const date = new Date()
      date.setDate(date.getDate() - offset)
      const key = toDateKey(date)
      const dayEvents = usageEvents.filter((event) => toDateKey(event.created_at) === key)
      const visitors = new Set(
        dayEvents.flatMap((event) => event.visitor_id ? [event.visitor_id] : []),
      ).size

      points.push({
        key,
        label: new Intl.DateTimeFormat(language.startsWith('en') ? 'en-GB' : 'th-TH', {
          day: 'numeric',
          month: 'short',
        }).format(date),
        visitors,
        events: dayEvents.length,
      })
    }

    return points
  }, [i18n.language, i18n.resolvedLanguage, rangeDays, usageEvents])

  const maxDailyValue = Math.max(
    1,
    ...dailyPoints.flatMap((point) => [point.visitors, point.events]),
  )

  const summaryCards = [
    { key: 'visitors', value: summary.visitors, color: 'border-l-amber-500' },
    { key: 'sessions', value: summary.sessions, color: 'border-l-blue-500' },
    { key: 'pageViews', value: summary.pageViews, color: 'border-l-violet-500' },
    { key: 'audioPlays', value: summary.audioPlays, color: 'border-l-emerald-500' },
    { key: 'audioCompletes', value: summary.audioCompletes, color: 'border-l-teal-500' },
    { key: 'bioClicks', value: summary.bioClicks, color: 'border-l-rose-500' },
  ]

  const recentUsageEvents = usageEvents.slice(0, 20)
  const recentAuditLogs = auditLogs.slice(0, 20)
  const currentLanguage = i18n.resolvedLanguage || i18n.language || 'th'

  return (
    <div className="space-y-6">
      <section className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              {t('admin.analytics.title')}
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              {t('admin.analytics.subtitle')}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {([7, 30] as RangeDays[]).map((days) => (
              <button
                key={days}
                type="button"
                onClick={() => setRangeDays(days)}
                className={`px-3 py-2 rounded-lg text-sm font-semibold border transition-colors cursor-pointer ${
                  rangeDays === days
                    ? 'bg-amber-600 text-white border-amber-600'
                    : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'
                }`}
              >
                {t('admin.analytics.days', { count: days })}
              </button>
            ))}
            <button
              type="button"
              onClick={() => void loadAnalytics()}
              disabled={isLoading}
              className="px-3 py-2 rounded-lg text-sm font-semibold bg-slate-900 text-white hover:bg-slate-800 disabled:opacity-60 cursor-pointer"
            >
              {t('admin.analytics.refresh')}
            </button>
          </div>
        </div>
      </section>

      <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-900">
        <p className="font-semibold">{t('admin.analytics.privacyTitle')}</p>
        <p className="mt-1 leading-relaxed">{t('admin.analytics.privacyDesc')}</p>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          <p className="font-semibold">{error}</p>
          <button
            type="button"
            onClick={() => void loadAnalytics()}
            className="mt-2 underline font-semibold cursor-pointer"
          >
            {t('admin.analytics.retry')}
          </button>
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center py-20">
          <div className="h-9 w-9 animate-spin rounded-full border-4 border-slate-200 border-t-amber-600" />
        </div>
      ) : !error && (
        <>
          <section className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {summaryCards.map((card) => (
              <div
                key={card.key}
                className={`bg-white rounded-xl border border-slate-200 border-l-4 ${card.color} p-4 sm:p-5 shadow-xs`}
              >
                <p className="text-xs sm:text-sm text-slate-500 font-medium">
                  {t(`admin.analytics.metrics.${card.key}`)}
                </p>
                <p className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1">
                  {card.value.toLocaleString(currentLanguage.startsWith('en') ? 'en-US' : 'th-TH')}
                </p>
              </div>
            ))}
          </section>

          <section className="bg-white rounded-xl border border-slate-200 p-4 sm:p-6 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2 mb-6">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  {t('admin.analytics.dailyTitle')}
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  {t('admin.analytics.dailyHint')}
                </p>
              </div>
              <div className="flex items-center gap-4 text-xs font-medium text-slate-600">
                <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-amber-500" />{t('admin.analytics.visitorsLegend')}</span>
                <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-slate-700" />{t('admin.analytics.eventsLegend')}</span>
              </div>
            </div>

            <div className="overflow-x-auto pb-2">
              <div className="flex items-end gap-2 min-w-[640px] h-56 border-b border-slate-200 px-1">
                {dailyPoints.map((point) => (
                  <div key={point.key} className="flex-1 h-full flex flex-col items-center justify-end gap-1 min-w-10">
                    <div className="w-full flex items-end justify-center gap-1 h-44">
                      <div
                        className="w-2/5 max-w-5 rounded-t bg-amber-500 min-h-0.5"
                        style={{ height: `${Math.max(2, (point.visitors / maxDailyValue) * 100)}%` }}
                        title={`${t('admin.analytics.visitorsLegend')}: ${point.visitors}`}
                      />
                      <div
                        className="w-2/5 max-w-5 rounded-t bg-slate-700 min-h-0.5"
                        style={{ height: `${Math.max(2, (point.events / maxDailyValue) * 100)}%` }}
                        title={`${t('admin.analytics.eventsLegend')}: ${point.events}`}
                      />
                    </div>
                    <span className="text-[10px] text-slate-500 whitespace-nowrap">{point.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 sm:p-6 border-b border-slate-200">
              <h2 className="text-lg font-bold text-slate-900">
                {t('admin.analytics.recentVisitorsTitle')}
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                {t('admin.analytics.recentVisitorsHint')}
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-sm">
                <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="text-left px-4 py-3">{t('admin.analytics.columns.visitor')}</th>
                    <th className="text-left px-4 py-3">{t('admin.analytics.columns.event')}</th>
                    <th className="text-left px-4 py-3">{t('admin.analytics.columns.location')}</th>
                    <th className="text-left px-4 py-3">{t('admin.analytics.columns.time')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {recentUsageEvents.length === 0 ? (
                    <tr><td colSpan={4} className="px-4 py-10 text-center text-slate-500">{t('admin.analytics.emptyUsage')}</td></tr>
                  ) : recentUsageEvents.map((event) => (
                    <tr key={event.id} className="hover:bg-slate-50/70">
                      <td className="px-4 py-3 font-mono text-xs text-slate-700">{maskIdentifier(event.visitor_id)}</td>
                      <td className="px-4 py-3 font-medium text-slate-800">{t(`admin.analytics.eventTypes.${event.event_type}`)}</td>
                      <td className="px-4 py-3 text-slate-600 font-mono text-xs">
                        {event.page_path || (event.resource_id ? `${event.resource_type}: ${maskIdentifier(event.resource_id)}` : '—')}
                      </td>
                      <td className="px-4 py-3 text-slate-500 whitespace-nowrap">{formatDateTime(event.created_at, currentLanguage)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {isOwner && <section className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 sm:p-6 border-b border-slate-200">
              <h2 className="text-lg font-bold text-slate-900">
                {t('admin.analytics.auditTitle')}
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                {t('admin.analytics.auditHint')}
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[820px] text-sm">
                <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="text-left px-4 py-3">{t('admin.analytics.columns.admin')}</th>
                    <th className="text-left px-4 py-3">{t('admin.analytics.columns.action')}</th>
                    <th className="text-left px-4 py-3">{t('admin.analytics.columns.item')}</th>
                    <th className="text-left px-4 py-3">{t('admin.analytics.columns.time')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {recentAuditLogs.length === 0 ? (
                    <tr><td colSpan={4} className="px-4 py-10 text-center text-slate-500">{t('admin.analytics.emptyAudit')}</td></tr>
                  ) : recentAuditLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50/70">
                      <td className="px-4 py-3">
                        <p className="font-semibold text-slate-800">{log.actor_display_name}</p>
                        <p className="text-xs text-slate-500">{t(`admin.analytics.roles.${log.actor_role}`)}</p>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                          log.action === 'create'
                            ? 'bg-emerald-100 text-emerald-800'
                            : log.action === 'delete'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-blue-100 text-blue-800'
                        }`}>
                          {t(`admin.analytics.actions.${log.action}`)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-700">
                        <p className="font-medium">{t(`admin.analytics.entities.${log.entity_type}`, { defaultValue: log.entity_type })}</p>
                        <p className="font-mono text-xs text-slate-500">{maskIdentifier(log.entity_id)}</p>
                      </td>
                      <td className="px-4 py-3 text-slate-500 whitespace-nowrap">{formatDateTime(log.occurred_at, currentLanguage)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>}
        </>
      )}
    </div>
  )
}

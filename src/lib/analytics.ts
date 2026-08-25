import { supabaseClient } from './supabase'

export type PublicUsageEventType =
  | 'session_start'
  | 'page_view'
  | 'audio_play'
  | 'audio_complete'
  | 'bio_link_click'

type ResourceType = 'meditation_track' | 'bio_link'

interface UsageEventInput {
  eventType: PublicUsageEventType
  pagePath?: string
  resourceType?: ResourceType
  resourceId?: string
}

const VISITOR_STORAGE_KEY = 'monkchat_visitor_id'
const SESSION_STORAGE_KEY = 'monkchat_session_id'
const SESSION_STARTED_KEY = 'monkchat_session_started'
const LAST_PAGE_VIEW_KEY = 'monkchat_last_page_view'

function createAnonymousId(): string | null {
  if (typeof crypto === 'undefined' || typeof crypto.randomUUID !== 'function') {
    return null
  }

  return crypto.randomUUID()
}

function readOrCreateId(storage: Storage, key: string): string | null {
  try {
    const existing = storage.getItem(key)
    if (existing) return existing

    const created = createAnonymousId()
    if (!created) return null

    storage.setItem(key, created)
    return created
  } catch {
    return null
  }
}

function getAnonymousContext(): { visitorId: string; sessionId: string } | null {
  if (typeof window === 'undefined') return null

  const visitorId = readOrCreateId(window.localStorage, VISITOR_STORAGE_KEY)
  const sessionId = readOrCreateId(window.sessionStorage, SESSION_STORAGE_KEY)

  if (!visitorId || !sessionId) return null
  return { visitorId, sessionId }
}

function normalizePagePath(pagePath: string): string | null {
  const normalized = pagePath.split('?')[0].split('#')[0].trim()
  if (!normalized.startsWith('/') || normalized.length > 120) return null
  return normalized
}

export async function trackUsageEvent(input: UsageEventInput): Promise<void> {
  const context = getAnonymousContext()
  if (!supabaseClient || !context) return

  const safePagePath = input.pagePath ? normalizePagePath(input.pagePath) : null

  await supabaseClient.rpc('record_usage_event', {
    p_event_type: input.eventType,
    p_visitor_id: context.visitorId,
    p_session_id: context.sessionId,
    p_page_path: safePagePath,
    p_resource_type: input.resourceType ?? null,
    p_resource_id: input.resourceId ?? null,
  })
}

export async function trackPageView(pagePath: string): Promise<void> {
  if (typeof window === 'undefined' || pagePath.startsWith('/admin')) return

  const safePagePath = normalizePagePath(pagePath)
  if (!safePagePath) return

  try {
    if (window.sessionStorage.getItem(SESSION_STARTED_KEY) !== 'true') {
      window.sessionStorage.setItem(SESSION_STARTED_KEY, 'true')
      await trackUsageEvent({ eventType: 'session_start', pagePath: safePagePath })
    }

    const now = Date.now()
    const previousRaw = window.sessionStorage.getItem(LAST_PAGE_VIEW_KEY)
    const previous = previousRaw
      ? JSON.parse(previousRaw) as { path?: string; timestamp?: number }
      : null

    if (
      previous?.path === safePagePath
      && typeof previous.timestamp === 'number'
      && now - previous.timestamp < 1500
    ) {
      return
    }

    window.sessionStorage.setItem(
      LAST_PAGE_VIEW_KEY,
      JSON.stringify({ path: safePagePath, timestamp: now }),
    )
    await trackUsageEvent({ eventType: 'page_view', pagePath: safePagePath })
  } catch {
    // Analytics must never block public content when storage is unavailable.
  }
}


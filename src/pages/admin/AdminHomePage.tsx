import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { Link } from 'react-router'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../../lib/auth'
import { supabaseClient } from '../../lib/supabase'
import { bundledHomeSlides, homeMediaValues, homePhotoUrl, removeHomePhoto, uploadHomePhoto, validateHomePhoto, type HomeMediaRow } from '../../lib/homeMedia'

function PhotoSlot({ slot, row, onSaved }: { slot: number; row?: HomeMediaRow; onSaved: (item: HomeMediaRow) => void }) {
  const { t } = useTranslation()
  const { profile } = useAuth()
  const fallback = bundledHomeSlides[slot - 1]
  const [file, setFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [captionTh, setCaptionTh] = useState(row?.draft_caption_th ?? row?.caption_th ?? fallback.th)
  const [captionEn, setCaptionEn] = useState(row?.draft_caption_en ?? row?.caption_en ?? fallback.en)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  useEffect(() => {
    if (!file) { setPreviewUrl(null); return }
    const url = URL.createObjectURL(file)
    setPreviewUrl(url)
    return () => URL.revokeObjectURL(url)
  }, [file])

  const save = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!supabaseClient || !profile || busy) return
    setError(''); setNotice('')
    const publish = (event.nativeEvent as SubmitEvent).submitter?.getAttribute('value') === 'publish'
    if (!file && !row?.draft_storage_path && !row?.storage_path) { setError(t('management.homeChoosePhoto')); return }
    if (file && validateHomePhoto(file)) { setError(t('management.homeInvalidPhoto')); return }
    if (!captionTh.trim() || !captionEn.trim()) { setError(t('management.homeCaptionsRequired')); return }
    setBusy(true)
    let uploaded: string | null = null
    try {
      if (file) uploaded = await uploadHomePhoto(file, slot)
      const nextPath = uploaded ?? row?.draft_storage_path ?? row?.storage_path
      if (!nextPath) throw new Error('Missing image')
      const values = homeMediaValues(row, nextPath, captionTh.trim(), captionEn.trim(), publish)
      const { data, error: saveError } = await supabaseClient.from('home_media').upsert({
        slot, ...values, updated_by: profile.id, updated_at: new Date().toISOString(),
      }, { onConflict: 'slot' }).select('id,slot,storage_path,caption_th,caption_en,draft_storage_path,draft_caption_th,draft_caption_en,is_published').single()
      if (saveError || !data) throw saveError ?? new Error('Save failed')
      onSaved(data as HomeMediaRow)
      setFile(null)
      setNotice(t(publish ? 'management.homePublished' : 'management.homeDraftSaved'))
      for (const oldPath of new Set([row?.storage_path, row?.draft_storage_path])) {
        if (oldPath && oldPath !== data.storage_path && oldPath !== data.draft_storage_path) {
          try { await removeHomePhoto(oldPath) }
          catch { setNotice(t('management.homeSavedCleanup')) }
        }
      }
    } catch {
      if (uploaded) { try { await removeHomePhoto(uploaded) } catch { /* Owner can clean up an orphaned image later. */ } }
      setError(t('management.homeSaveError'))
    } finally { setBusy(false) }
  }

  return (
    <form onSubmit={save} className="overflow-hidden rounded-2xl border border-[#ddd0bf] bg-white shadow-sm">
      <div className="relative aspect-[16/9] bg-[#efe9df]">
        <img src={previewUrl ?? (row?.draft_storage_path && homePhotoUrl(row.draft_storage_path)) ?? (row?.storage_path && homePhotoUrl(row.storage_path)) ?? fallback.url} alt={captionTh} className="h-full w-full object-cover" />
        <span className="absolute left-4 top-4 rounded-full bg-[#27342b]/90 px-3 py-1 text-xs font-bold text-white">{t('management.homeSlot')} {slot}</span>
      </div>
      <div className="space-y-4 p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="font-bold text-[#27342b]">{slot === 1 ? t('management.homeHero') : t('management.homeGallery')}</h2>
          <span className={`rounded-full px-3 py-1 text-xs font-bold ${row?.is_published ? 'bg-emerald-100 text-emerald-900' : 'bg-amber-100 text-amber-900'}`}>
            {row?.draft_storage_path ? t(row.is_published ? 'management.homeLiveWithDraft' : 'management.homeDraft') : row?.is_published ? t('management.homeLive') : t('management.homeBundled')}
          </span>
        </div>
        <label className="block text-sm font-semibold text-[#27342b]">{t('management.homePhoto')}
          <input type="file" accept="image/jpeg,image/png,image/webp" disabled={busy} onChange={(e) => setFile(e.target.files?.[0] ?? null)} className="mt-2 block w-full text-sm" />
        </label>
        <p className="text-xs leading-5 text-slate-600">{file?.name ?? t('management.homePhotoHint')}</p>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="text-sm font-semibold">{t('management.homeCaptionTh')}
            <input value={captionTh} onChange={(e) => setCaptionTh(e.target.value)} maxLength={80} required className="mt-1 min-h-11 w-full rounded-lg border border-slate-300 px-3" />
          </label>
          <label className="text-sm font-semibold">{t('management.homeCaptionEn')}
            <input value={captionEn} onChange={(e) => setCaptionEn(e.target.value)} maxLength={80} required className="mt-1 min-h-11 w-full rounded-lg border border-slate-300 px-3" />
          </label>
        </div>
        {error && <p role="alert" className="text-sm text-red-800">{error}</p>}
        {notice && <p role="status" className="text-sm text-emerald-800">{notice}</p>}
        <div className="flex flex-wrap gap-3">
          <button type="submit" value="draft" disabled={busy} className="min-h-11 rounded-full border border-[#a54f35] px-6 text-sm font-bold text-[#873c28] disabled:opacity-50">{t(busy ? 'management.saving' : 'management.homeSaveDraft')}</button>
          <button type="submit" value="publish" disabled={busy} className="min-h-11 rounded-full bg-[#a54f35] px-6 text-sm font-bold text-white disabled:opacity-50">{t(busy ? 'management.saving' : 'management.homePublishNow')}</button>
        </div>
      </div>
    </form>
  )
}

export function AdminHomePage() {
  const { t } = useTranslation()
  const [rows, setRows] = useState<HomeMediaRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    setLoading(true); setError('')
    if (!supabaseClient) { setError(t('management.homeUnavailable')); setLoading(false); return }
    const { data, error: loadError } = await supabaseClient.from('home_media')
      .select('id,slot,storage_path,caption_th,caption_en,draft_storage_path,draft_caption_th,draft_caption_en,is_published').order('slot')
    if (loadError) setError(t('management.homeUnavailable'))
    else setRows((data as HomeMediaRow[]) ?? [])
    setLoading(false)
  }, [t])

  useEffect(() => { void load() }, [load])

  return <div className="space-y-6">
    <header className="rounded-3xl bg-[#27342b] p-6 text-white sm:p-8">
      <p className="text-xs font-bold uppercase tracking-[.16em] text-[#e7bc79]">MONK CHAT · HOME</p>
      <h1 className="mt-2 text-3xl font-bold">{t('management.homeTitle')}</h1>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-white/80">{t('management.homeDescription')}</p>
      <Link to="/" target="_blank" rel="noopener noreferrer" className="mt-5 inline-flex min-h-11 items-center rounded-full border border-white/50 px-5 text-sm font-semibold">{t('management.homePreview')} ↗</Link>
    </header>
    <div className="rounded-2xl border border-[#e7d6bc] bg-[#fbf2e4] p-5 text-sm leading-6 text-[#493526]">{t('management.homeImagePolicy')}</div>
    {loading && <p role="status">{t('management.loading')}</p>}
    {error && <div role="alert" className="rounded-xl bg-red-50 p-4 text-red-800">{error} <button onClick={() => void load()} className="underline">{t('management.retry')}</button></div>}
    {!loading && !error && <div className="grid gap-5 lg:grid-cols-2">
      {bundledHomeSlides.map((_, index) => <PhotoSlot key={`${index}-${rows.find(r => r.slot === index + 1)?.id ?? 'default'}`} slot={index + 1} row={rows.find(r => r.slot === index + 1)} onSaved={(saved) => setRows(current => [...current.filter(r => r.slot !== saved.slot), saved])} />)}
    </div>}
  </div>
}

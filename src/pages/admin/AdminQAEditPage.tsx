import { useState, useEffect, type FormEvent } from 'react'
import { useNavigate, useParams, Link } from 'react-router'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../../lib/auth'
import { supabaseClient } from '../../lib/supabase'

export function AdminQAEditPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { qaId } = useParams()
  const { user } = useAuth()

  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [isEditable, setIsEditable] = useState(false)

  // System states (readonly)
  const [contentStatus, setContentStatus] = useState('draft')
  const [verificationStatus, setVerificationStatus] = useState('unverified')
  const [isPublished, setIsPublished] = useState(false)

  // Core metadata
  const [category, setCategory] = useState('')
  const [sourceReference, setSourceReference] = useState('')

  // Translations
  const [thTranslationId, setThTranslationId] = useState<string | null>(null)
  const [thQuestion, setThQuestion] = useState('')
  const [thShortAnswer, setThShortAnswer] = useState('')
  const [thDetailedAnswer, setThDetailedAnswer] = useState('')

  const [enTranslationId, setEnTranslationId] = useState<string | null>(null)
  const [enQuestion, setEnQuestion] = useState('')
  const [enShortAnswer, setEnShortAnswer] = useState('')
  const [enDetailedAnswer, setEnDetailedAnswer] = useState('')

  useEffect(() => {
    let cancelled = false
    async function loadItem() {
      setIsEditable(false)
      setIsLoading(true)
      setFormError(null)
      setThTranslationId(null)
      setThQuestion('')
      setThShortAnswer('')
      setThDetailedAnswer('')
      setEnTranslationId(null)
      setEnQuestion('')
      setEnShortAnswer('')
      setEnDetailedAnswer('')
      if (!qaId || !supabaseClient) {
        setFormError(t(!qaId ? 'admin.qa.edit.errorNotFound' : 'admin.qa.edit.errorNoClient'))
        setIsLoading(false)
        return
      }

      try {
        const { data: item, error: fetchErr } = await supabaseClient
          .from('qa_items')
          .select(`
            *,
            qa_translations (
              id,
              language_code,
              question,
              short_answer,
              detailed_answer
            )
          `)
          .eq('id', qaId)
          .single()

        if (cancelled) return

        if (fetchErr || !item) {
          throw new Error(t('admin.qa.edit.errorNotFound'))
        }

        setContentStatus(item.content_status)
        setVerificationStatus(item.verification_status)
        setIsPublished(item.is_published)

        if (item.content_status === 'archived') {
          throw new Error(t('admin.qa.edit.errorArchived'))
        }
        if (item.verification_status === 'verified') {
          throw new Error(t('admin.qa.edit.errorVerified'))
        }
        if (item.content_status !== 'draft' || item.is_published) {
          throw new Error(t('admin.qa.edit.errorRequiresDraft'))
        }

        setCategory(item.category || '')
        setSourceReference(item.source_reference || '')

        const th = item.qa_translations.find((t: any) => t.language_code === 'th')
        if (th) {
          setThTranslationId(th.id)
          setThQuestion(th.question || '')
          setThShortAnswer(th.short_answer || '')
          setThDetailedAnswer(th.detailed_answer || '')
        }

        const en = item.qa_translations.find((t: any) => t.language_code === 'en')
        if (en) {
          setEnTranslationId(en.id)
          setEnQuestion(en.question || '')
          setEnShortAnswer(en.short_answer || '')
          setEnDetailedAnswer(en.detailed_answer || '')
        }
        setIsEditable(true)
      } catch (err: any) {
        if (!cancelled) setFormError(err.message)
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    loadItem()
    return () => { cancelled = true }
  }, [qaId, t])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (isSubmitting || !qaId || !isEditable) return

    setFormError(null)

    const cat = category.trim()
    const srcRef = sourceReference.trim()
    const thQ = thQuestion.trim()
    const thSA = thShortAnswer.trim()
    const thDA = thDetailedAnswer.trim()
    const enQ = enQuestion.trim()
    const enSA = enShortAnswer.trim()
    const enDA = enDetailedAnswer.trim()

    if (!cat) return setFormError(t('admin.qa.edit.errorCategoryRequired'))
    if (!thQ) return setFormError(t('admin.qa.edit.errorThQuestionRequired'))
    if (!thSA) return setFormError(t('admin.qa.edit.errorThShortAnswerRequired'))
    if ((enSA || enDA) && !enQ) return setFormError(t('admin.qa.edit.errorEnQuestionRequired'))
    if (enQ && !enSA) return setFormError(t('admin.qa.edit.errorEnShortAnswerRequired'))
    if (!user) return setFormError(t('admin.qa.edit.errorNoUser'))
    if (!supabaseClient) return setFormError(t('admin.qa.edit.errorNoClient'))

    setIsSubmitting(true)

    try {
      // Preserve the Windows stale-tab check. The filtered write and database
      // triggers also enforce this if verification changes after this read.
      const { data: current, error: statusError } = await supabaseClient
        .from('qa_items')
        .select('content_status, verification_status, is_published')
        .eq('id', qaId)
        .single()
      if (statusError || !current) throw new Error(t('admin.qa.edit.errorNotFound'))
      if (current.content_status !== 'draft' || current.verification_status !== 'unverified' || current.is_published) {
        setIsEditable(false)
        throw new Error(t(current.verification_status === 'verified' ? 'admin.qa.edit.errorVerified' : 'admin.qa.edit.errorRequiresDraft'))
      }

      // 1. Update Core
      const { data: updatedItem, error: coreErr } = await supabaseClient
        .from('qa_items')
        .update({
          category: cat,
          source_reference: srcRef || null,
          updated_by: user.id,
          updated_at: new Date().toISOString()
        })
        .eq('id', qaId)
        .eq('content_status', 'draft')
        .eq('verification_status', 'unverified')
        .eq('is_published', false)
        .select('id')
        .single()

      if (coreErr?.code === '23514') {
        setIsEditable(false)
        throw new Error(t('admin.qa.edit.errorVerified'))
      }
      if (coreErr || !updatedItem) {
        throw new Error(t('admin.qa.edit.errorUpdateCore'))
      }

      // 2. Upsert Thai
      const thPayload = {
        qa_item_id: qaId,
        language_code: 'th',
        question: thQ,
        short_answer: thSA,
        detailed_answer: thDA || null
      }
      if (thTranslationId) {
        const { error: thErr } = await supabaseClient.from('qa_translations').update(thPayload).eq('id', thTranslationId)
        if (thErr) {
          if (thErr.code === '23514') setIsEditable(false)
          throw new Error(t(thErr.code === '23514' ? 'admin.qa.edit.errorVerified' : 'admin.qa.edit.errorUpdateTh'))
        }
      } else {
        const { error: thErr } = await supabaseClient.from('qa_translations').insert([thPayload])
        if (thErr) {
          if (thErr.code === '23514') setIsEditable(false)
          throw new Error(t(thErr.code === '23514' ? 'admin.qa.edit.errorVerified' : 'admin.qa.edit.errorUpdateTh'))
        }
      }

      // 3. Upsert English (Only when valid question + short answer provided)
      if (enQ && enSA) {
        const enPayload = {
          qa_item_id: qaId,
          language_code: 'en',
          question: enQ,
          short_answer: enSA,
          detailed_answer: enDA || null
        }
        if (enTranslationId) {
          const { error: enErr } = await supabaseClient.from('qa_translations').update(enPayload).eq('id', enTranslationId)
          if (enErr) {
            if (enErr.code === '23514') setIsEditable(false)
            throw new Error(t(enErr.code === '23514' ? 'admin.qa.edit.errorVerified' : 'admin.qa.edit.errorUpdateEn'))
          }
        } else {
          const { error: enErr } = await supabaseClient.from('qa_translations').insert([enPayload])
          if (enErr) {
            if (enErr.code === '23514') setIsEditable(false)
            throw new Error(t(enErr.code === '23514' ? 'admin.qa.edit.errorVerified' : 'admin.qa.edit.errorUpdateEn'))
          }
        }
      }
      // If all English fields are empty, do nothing:
      // - If enTranslationId exists, preserve existing English row unchanged.
      // - If no row exists, create no English row.

      navigate('/admin/qa')
    } catch (err: any) {
      setFormError(err.message)
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-amber-600" />
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          to="/admin/qa"
          className="inline-flex items-center gap-1 text-sm font-medium text-slate-600 hover:text-brand-terracotta-dark transition-colors"
        >
          <span>←</span> {t('admin.qa.edit.backToList')}
        </Link>
      </div>

      {/* Header Info */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-2">
        <h1 className="text-2xl font-medium text-slate-900">
          {t('admin.qa.edit.title')}
        </h1>
        <p className="text-sm text-slate-500">
          {t('admin.qa.edit.subtitle')}
        </p>
      </div>

      {/* System State Notice */}
      <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 text-xs space-y-2">
        <p className="font-semibold flex items-center gap-1.5 text-sm text-slate-900">
          {t('admin.qa.edit.statusTitle')}
        </p>
        <div className="pt-2 border-t border-slate-200 flex flex-wrap gap-3 font-mono text-slate-700">
          <span>{t('admin.qa.create.fixedStatus')}: <strong>{contentStatus}</strong></span>
          <span>{t('admin.qa.create.fixedVerification')}: <strong>{verificationStatus}</strong></span>
          <span>{t('admin.qa.create.fixedPublished')}: <strong>{isPublished ? 'true' : 'false'}</strong></span>
        </div>
      </div>

      {/* Error Alert */}
      {formError && (
        <div role="alert" className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-800">
          <p className="font-semibold">{t('admin.qa.create.errorHeader')}</p>
          <p className="text-xs mt-1 font-mono break-all">{formError}</p>
        </div>
      )}

      {/* Edit Form */}
      {isEditable && <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-slate-200 p-6 space-y-6">
        {/* Core Metadata */}
        <div className="space-y-4">
          <h2 className="text-base font-medium text-slate-900 border-b border-slate-100 pb-2">
            1. {t('admin.qa.create.secMetadata')}
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="cms-adminqaeditpage-1" className="block text-sm font-semibold text-slate-700 mb-1">
                {t('admin.qa.create.labelCategory')} <span className="text-red-500">*</span>
              </label>
              <input id="cms-adminqaeditpage-1"
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder={t('admin.qa.create.phCategory')}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-terracotta/20 focus:border-brand-terracotta"
              />
            </div>

            <div>
              <label htmlFor="cms-adminqaeditpage-2" className="block text-sm font-semibold text-slate-700 mb-1">
                {t('admin.qa.create.labelSourceRef')} ({t('admin.qa.create.optional')})
              </label>
              <input id="cms-adminqaeditpage-2"
                type="text"
                value={sourceReference}
                onChange={(e) => setSourceReference(e.target.value)}
                placeholder={t('admin.qa.create.phSourceRef')}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-terracotta/20 focus:border-brand-terracotta"
              />
            </div>
          </div>
        </div>

        {/* Thai Translation (Required) */}
        <div className="space-y-4 pt-2">
          <div className="border-b border-slate-100 pb-2 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-base font-medium text-slate-900">
              2. {t('admin.qa.create.secThai')} <span className="text-red-500">*</span>
            </h2>
            <span className="text-xs px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-semibold">
              Required
            </span>
          </div>

          <div>
            <label htmlFor="cms-adminqaeditpage-3" className="block text-sm font-semibold text-slate-700 mb-1">
              {t('admin.qa.create.labelQuestion')} (TH) <span className="text-red-500">*</span>
            </label>
            <input id="cms-adminqaeditpage-3"
              type="text"
              value={thQuestion}
              onChange={(e) => setThQuestion(e.target.value)}
              placeholder={t('admin.qa.create.phThQuestion')}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-terracotta/20 focus:border-brand-terracotta"
            />
          </div>

          <div>
            <label htmlFor="cms-adminqaeditpage-4" className="block text-sm font-semibold text-slate-700 mb-1">
              {t('admin.qa.create.labelShortAnswer')} (TH) <span className="text-red-500">*</span>
            </label>
            <textarea id="cms-adminqaeditpage-4"
              rows={3}
              value={thShortAnswer}
              onChange={(e) => setThShortAnswer(e.target.value)}
              placeholder={t('admin.qa.create.phThShortAnswer')}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-terracotta/20 focus:border-brand-terracotta resize-y"
            />
          </div>

          <div>
            <label htmlFor="cms-adminqaeditpage-5" className="block text-sm font-semibold text-slate-700 mb-1">
              {t('admin.qa.create.labelDetailedAnswer')} (TH - {t('admin.qa.create.optional')})
            </label>
            <textarea id="cms-adminqaeditpage-5"
              rows={4}
              value={thDetailedAnswer}
              onChange={(e) => setThDetailedAnswer(e.target.value)}
              placeholder={t('admin.qa.create.phThDetailedAnswer')}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-terracotta/20 focus:border-brand-terracotta resize-y"
            />
          </div>
        </div>

        {/* English Translation (Optional) */}
        <div className="space-y-4 pt-2">
          <div className="border-b border-slate-100 pb-2 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-base font-medium text-slate-900">
              3. {t('admin.qa.create.secEnglish')} ({t('admin.qa.create.optional')})
            </h2>
            <span className="text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-medium">
              Optional
            </span>
          </div>

          {enTranslationId && (
            <p className="text-xs text-amber-800 bg-amber-50 p-3 rounded-lg border border-amber-200 leading-relaxed">
              {t('admin.qa.edit.enPreserveNotice')}
            </p>
          )}

          <div>
            <label htmlFor="cms-adminqaeditpage-6" className="block text-sm font-semibold text-slate-700 mb-1">
              {t('admin.qa.create.labelQuestion')} (EN)
            </label>
            <input id="cms-adminqaeditpage-6"
              type="text"
              value={enQuestion}
              onChange={(e) => setEnQuestion(e.target.value)}
              placeholder={t('admin.qa.create.phEnQuestion')}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          <div>
            <label htmlFor="cms-adminqaeditpage-7" className="block text-sm font-semibold text-slate-700 mb-1">
              {t('admin.qa.create.labelShortAnswer')} (EN)
            </label>
            <textarea id="cms-adminqaeditpage-7"
              rows={3}
              value={enShortAnswer}
              onChange={(e) => setEnShortAnswer(e.target.value)}
              placeholder={t('admin.qa.create.phEnShortAnswer')}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-y"
            />
          </div>

          <div>
            <label htmlFor="cms-adminqaeditpage-8" className="block text-sm font-semibold text-slate-700 mb-1">
              {t('admin.qa.create.labelDetailedAnswer')} (EN - {t('admin.qa.create.optional')})
            </label>
            <textarea id="cms-adminqaeditpage-8"
              rows={4}
              value={enDetailedAnswer}
              onChange={(e) => setEnDetailedAnswer(e.target.value)}
              placeholder={t('admin.qa.create.phEnDetailedAnswer')}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-y"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <Link
            to="/admin/qa"
            className="px-4 py-2 text-sm font-medium rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors"
          >
            {t('admin.qa.create.cancel')}
          </Link>

          <button
            type="submit"
            disabled={isSubmitting}
            className="px-5 py-2 text-sm font-semibold rounded-lg bg-brand-terracotta hover:bg-brand-terracotta-dark text-white transition-colors disabled:opacity-50 cursor-pointer"
          >
            {isSubmitting
              ? t('admin.qa.edit.saving')
              : t('admin.qa.edit.submit')}
          </button>
        </div>
      </form>}
    </div>
  )
}

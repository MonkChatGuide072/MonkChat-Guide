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
    async function loadItem() {
      if (!qaId || !supabaseClient) return

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

        if (fetchErr || !item) {
          throw new Error(t('admin.qa.edit.errorNotFound'))
        }

        if (item.content_status === 'archived') {
          throw new Error(t('admin.qa.edit.errorArchived'))
        }

        setContentStatus(item.content_status)
        setVerificationStatus(item.verification_status)
        setIsPublished(item.is_published)

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
      } catch (err: any) {
        setFormError(err.message)
      } finally {
        setIsLoading(false)
      }
    }

    loadItem()
  }, [qaId, t])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (isSubmitting || !qaId) return

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
      // 1. Update Core
      const { error: coreErr } = await supabaseClient
        .from('qa_items')
        .update({
          category: cat,
          source_reference: srcRef || null,
          updated_by: user.id,
          updated_at: new Date().toISOString()
        })
        .eq('id', qaId)

      if (coreErr) {
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
        if (thErr) throw new Error(t('admin.qa.edit.errorUpdateTh'))
      } else {
        const { error: thErr } = await supabaseClient.from('qa_translations').insert([thPayload])
        if (thErr) throw new Error(t('admin.qa.edit.errorUpdateTh'))
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
          if (enErr) throw new Error(t('admin.qa.edit.errorUpdateEn'))
        } else {
          const { error: enErr } = await supabaseClient.from('qa_translations').insert([enPayload])
          if (enErr) throw new Error(t('admin.qa.edit.errorUpdateEn'))
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
      <div className="flex items-center justify-between">
        <Link
          to="/admin/qa"
          className="inline-flex items-center gap-1 text-sm font-medium text-slate-600 hover:text-amber-700 transition-colors"
        >
          <span>←</span> {t('admin.qa.edit.backToList')}
        </Link>
      </div>

      {/* Header Info */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-2">
        <h1 className="text-2xl font-bold text-slate-900">
          {t('admin.qa.edit.title')}
        </h1>
        <p className="text-sm text-slate-500">
          {t('admin.qa.edit.subtitle')}
        </p>
      </div>

      {/* System State Notice */}
      <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 text-xs space-y-2">
        <p className="font-semibold flex items-center gap-1.5 text-sm text-slate-900">
          <span>ℹ️</span> {t('admin.qa.edit.statusTitle')}
        </p>
        <div className="pt-2 border-t border-slate-200 flex flex-wrap gap-3 font-mono text-slate-700">
          <span>{t('admin.qa.create.fixedStatus')}: <strong>{contentStatus}</strong></span>
          <span>{t('admin.qa.create.fixedVerification')}: <strong>{verificationStatus}</strong></span>
          <span>{t('admin.qa.create.fixedPublished')}: <strong>{isPublished ? 'true' : 'false'}</strong></span>
        </div>
      </div>

      {/* Error Alert */}
      {formError && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-800">
          <p className="font-semibold">{t('admin.qa.create.errorHeader')}</p>
          <p className="text-xs mt-1 font-mono break-all">{formError}</p>
        </div>
      )}

      {/* Edit Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-6">
        {/* Core Metadata */}
        <div className="space-y-4">
          <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-2">
            1. {t('admin.qa.create.secMetadata')}
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {t('admin.qa.create.labelCategory')} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder={t('admin.qa.create.phCategory')}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {t('admin.qa.create.labelSourceRef')} ({t('admin.qa.create.optional')})
              </label>
              <input
                type="text"
                value={sourceReference}
                onChange={(e) => setSourceReference(e.target.value)}
                placeholder={t('admin.qa.create.phSourceRef')}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
              />
            </div>
          </div>
        </div>

        {/* Thai Translation (Required) */}
        <div className="space-y-4 pt-2">
          <div className="border-b border-slate-100 pb-2 flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900">
              2. {t('admin.qa.create.secThai')} <span className="text-red-500">*</span>
            </h2>
            <span className="text-xs px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-semibold">
              Required
            </span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {t('admin.qa.create.labelQuestion')} (TH) <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={thQuestion}
              onChange={(e) => setThQuestion(e.target.value)}
              placeholder={t('admin.qa.create.phThQuestion')}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {t('admin.qa.create.labelShortAnswer')} (TH) <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={3}
              value={thShortAnswer}
              onChange={(e) => setThShortAnswer(e.target.value)}
              placeholder={t('admin.qa.create.phThShortAnswer')}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 resize-y"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {t('admin.qa.create.labelDetailedAnswer')} (TH - {t('admin.qa.create.optional')})
            </label>
            <textarea
              rows={4}
              value={thDetailedAnswer}
              onChange={(e) => setThDetailedAnswer(e.target.value)}
              placeholder={t('admin.qa.create.phThDetailedAnswer')}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 resize-y"
            />
          </div>
        </div>

        {/* English Translation (Optional) */}
        <div className="space-y-4 pt-2">
          <div className="border-b border-slate-100 pb-2 flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900">
              3. {t('admin.qa.create.secEnglish')} ({t('admin.qa.create.optional')})
            </h2>
            <span className="text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-medium">
              Optional
            </span>
          </div>

          {enTranslationId && (
            <p className="text-xs text-amber-800 bg-amber-50 p-3 rounded-lg border border-amber-200 leading-relaxed">
              ℹ️ {t('admin.qa.edit.enPreserveNotice')}
            </p>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {t('admin.qa.create.labelQuestion')} (EN)
            </label>
            <input
              type="text"
              value={enQuestion}
              onChange={(e) => setEnQuestion(e.target.value)}
              placeholder={t('admin.qa.create.phEnQuestion')}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {t('admin.qa.create.labelShortAnswer')} (EN)
            </label>
            <textarea
              rows={3}
              value={enShortAnswer}
              onChange={(e) => setEnShortAnswer(e.target.value)}
              placeholder={t('admin.qa.create.phEnShortAnswer')}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-y"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {t('admin.qa.create.labelDetailedAnswer')} (EN - {t('admin.qa.create.optional')})
            </label>
            <textarea
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
            className="px-5 py-2 text-sm font-semibold rounded-lg bg-amber-600 hover:bg-amber-500 text-white transition-colors disabled:opacity-50 cursor-pointer"
          >
            {isSubmitting
              ? t('admin.qa.edit.saving')
              : t('admin.qa.edit.submit')}
          </button>
        </div>
      </form>
    </div>
  )
}

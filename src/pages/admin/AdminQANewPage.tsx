import { useState, type FormEvent } from 'react'
import { useNavigate, Link } from 'react-router'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../../lib/auth'
import { supabaseClient } from '../../lib/supabase'

export function AdminQANewPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { user } = useAuth()

  const [category, setCategory] = useState('')
  const [sourceReference, setSourceReference] = useState('')

  // Thai Translation (Required)
  const [thQuestion, setThQuestion] = useState('')
  const [thShortAnswer, setThShortAnswer] = useState('')
  const [thDetailedAnswer, setThDetailedAnswer] = useState('')

  // English Translation (Optional)
  const [enQuestion, setEnQuestion] = useState('')
  const [enShortAnswer, setEnShortAnswer] = useState('')
  const [enDetailedAnswer, setEnDetailedAnswer] = useState('')

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  // ── Form Submission Handler ────────────────────────────────────────────────

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (isSubmitting) return

    setFormError(null)

    const cat = category.trim()
    const srcRef = sourceReference.trim()
    const thQ = thQuestion.trim()
    const thSA = thShortAnswer.trim()
    const thDA = thDetailedAnswer.trim()
    const enQ = enQuestion.trim()
    const enSA = enShortAnswer.trim()
    const enDA = enDetailedAnswer.trim()

    // 1. Validation
    if (!cat) {
      setFormError(t('admin.qa.create.errorCategoryRequired'))
      return
    }

    if (!thQ) {
      setFormError(t('admin.qa.create.errorThQuestionRequired'))
      return
    }

    if (!thSA) {
      setFormError(t('admin.qa.create.errorThShortAnswerRequired'))
      return
    }

    if ((enSA || enDA) && !enQ) {
      setFormError(t('admin.qa.create.errorEnQuestionRequired'))
      return
    }

    if (enQ && !enSA) {
      setFormError(t('admin.qa.create.errorEnShortAnswerRequired'))
      return
    }

    if (!user) {
      setFormError(t('admin.qa.create.errorNoUser'))
      return
    }

    if (!supabaseClient) {
      setFormError(t('admin.qa.create.errorNoClient'))
      return
    }

    setIsSubmitting(true)

    try {
      // 2. Insert Core qa_items row
      const { data: newItem, error: coreErr } = await supabaseClient
        .from('qa_items')
        .insert({
          category: cat,
          source_reference: srcRef || null,
          content_status: 'draft',
          verification_status: 'unverified',
          is_published: false,
          verified_by: null,
          verified_at: null,
          created_by: user.id,
          updated_by: user.id,
        })
        .select('id')
        .single()

      if (coreErr || !newItem) {
        setFormError(coreErr?.message || t('admin.qa.create.errorGeneric'))
        setIsSubmitting(false)
        return
      }

      // 3. Build Translation Rows
      const translationsToInsert = [
        {
          qa_item_id: newItem.id,
          language_code: 'th',
          question: thQ,
          short_answer: thSA,
          detailed_answer: thDA || null,
        },
      ]

      if (enQ && enSA) {
        translationsToInsert.push({
          qa_item_id: newItem.id,
          language_code: 'en',
          question: enQ,
          short_answer: enSA,
          detailed_answer: enDA || null,
        })
      }

      // 4. Batch Insert Translations
      const { error: transErr } = await supabaseClient
        .from('qa_translations')
        .insert(translationsToInsert)

      if (transErr) {
        // Partial-Save Recovery: Archive core row if translations fail
        try {
          await supabaseClient
            .from('qa_items')
            .update({
              content_status: 'archived',
              archived_at: new Date().toISOString(),
            })
            .eq('id', newItem.id)
        } catch {
          // Ignore archive failure error
        }

        setFormError(t('admin.qa.create.errorPartialSaveWarning'))
        setIsSubmitting(false)
        return
      }

      // 5. Success -> Navigate back to Q&A List
      navigate('/admin/qa')
    } catch (err) {
      setFormError(
        err instanceof Error ? err.message : t('admin.qa.create.errorGeneric')
      )
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Link
          to="/admin/qa"
          className="inline-flex items-center gap-1 text-sm font-medium text-slate-600 hover:text-amber-700 transition-colors"
        >
          <span>←</span> {t('admin.qa.create.backToList')}
        </Link>
      </div>

      {/* Header Info */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-2">
        <h1 className="text-2xl font-bold text-slate-900">
          {t('admin.qa.create.title')}
        </h1>
        <p className="text-sm text-slate-500">
          {t('admin.qa.create.subtitle')}
        </p>
      </div>

      {/* Safety Policy & Fixed State Notice */}
      <div className="bg-amber-50 rounded-xl border border-amber-200 p-4 text-xs text-amber-900 space-y-2">
        <p className="font-semibold flex items-center gap-1.5 text-sm text-amber-950">
          <span>⚠️</span> {t('admin.qa.create.policyTitle')}
        </p>
        <p className="text-amber-800 leading-relaxed">
          {t('admin.qa.create.policyDesc')}
        </p>
        <div className="pt-2 border-t border-amber-200/80 flex flex-wrap gap-3 text-[11px] font-mono text-amber-900">
          <span>{t('admin.qa.create.fixedStatus')}: <strong>draft</strong></span>
          <span>{t('admin.qa.create.fixedVerification')}: <strong>unverified</strong></span>
          <span>{t('admin.qa.create.fixedPublished')}: <strong>false</strong></span>
        </div>
      </div>

      {/* Error Alert */}
      {formError && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-800">
          <p className="font-semibold">{t('admin.qa.create.errorHeader')}</p>
          <p className="text-xs mt-1 font-mono break-all">{formError}</p>
        </div>
      )}

      {/* Create Form */}
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
              ? t('admin.qa.create.saving')
              : t('admin.qa.create.submit')}
          </button>
        </div>
      </form>
    </div>
  )
}

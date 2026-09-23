import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { supabaseClient } from '../lib/supabase'

export function AudioLanguageField({ value, onChange, disabled }: { value: string; onChange: (value: string) => void; disabled: boolean }) {
  const { t } = useTranslation()
  const [languages, setLanguages] = useState<Array<{code: string; native_name: string; is_active: boolean}>>([])
  const [failed, setFailed] = useState(false)
  const [attempt, setAttempt] = useState(0)
  useEffect(() => {
    let active = true
    const load = async () => {
      setFailed(false)
      try {
        if (!supabaseClient) throw new Error()
        const { data, error } = await supabaseClient.from('languages').select('code,native_name,is_active').order('code')
        if (error) throw error
        if (active) setLanguages(data ?? [])
      } catch { if (active) setFailed(true) }
    }
    void load()
    return () => { active = false }
  }, [attempt])
  return (
    <div>
      <label className="block text-sm font-semibold">{t('management.sourceLanguage')}
        <select value={value} onChange={event => onChange(event.target.value)} disabled={disabled} required className="mt-2 w-full rounded-lg border border-slate-300 bg-white p-3">
          {!languages.some(language => language.code === value) && <option value={value}>{value}</option>}
          {languages.filter(language => language.is_active || language.code === value).map(language => <option key={language.code} value={language.code}>{language.native_name} ({language.code})</option>)}
        </select>
      </label>
      <p className="mt-2 text-xs text-slate-600">{t('management.sourceLanguageHelp')}</p>
      {failed && <div role="alert" className="mt-2 text-sm text-red-700">{t('management.error')} <button type="button" onClick={() => setAttempt(value => value + 1)} className="min-h-11 px-3 underline">{t('management.retry')}</button></div>}
    </div>
  )
}

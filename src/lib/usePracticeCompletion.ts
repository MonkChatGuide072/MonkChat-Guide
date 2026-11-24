import { useCallback, useEffect, useRef, useState } from 'react'
import { fetchStudentCompletedKeys, setStudentItemCompleted, type ProgressModuleType } from './studentPractice'

function readCache(key: string): string[] {
  try { const value: unknown = JSON.parse(localStorage.getItem(key) || '[]'); return Array.isArray(value) ? value.filter((id): id is string => typeof id === 'string') : [] }
  catch { return [] }
}

/** Student completion is acknowledged by the server before being shown as saved. Guests use device storage. */
export function usePracticeCompletion({ storageKey, studentId, moduleType, english }: {
  storageKey: string; studentId?: string; moduleType: ProgressModuleType; english: boolean
}) {
  const scope = useRef(storageKey)
  scope.current = storageKey
  const lock = useRef(false)
  const epoch = useRef(0)
  const invalidate = useCallback(() => { epoch.current += 1 }, [])
  const [revision, setRevision] = useState(0)
  const [state, setState] = useState({ key: storageKey, ids: readCache(storageKey), ready: !studentId, busy: false, error: '', notice: '' })
  useEffect(() => {
    let current = true
    const generation = ++epoch.current
    lock.current = false
    setState({ key: storageKey, ids: readCache(storageKey), ready: !studentId, busy: false, error: '', notice: '' })
    if (!studentId) return () => { current = false; invalidate() }
    void fetchStudentCompletedKeys(studentId, moduleType).then(keys => {
      if (!current || generation !== epoch.current || scope.current !== storageKey) return
      if (keys === null) {
        setState(s => ({ ...s, ready: false, error: english ? 'Could not load saved progress. Reload before saving.' : 'โหลดผลฝึกจากระบบไม่ได้ กรุณาโหลดใหม่ก่อนบันทึก' }))
        return
      }
      setState(s => ({ ...s, ids: keys, ready: true }))
      try { localStorage.setItem(storageKey, JSON.stringify(keys)) } catch { /* Server remains authoritative. */ }
    }).catch(() => {
      if (current && generation === epoch.current && scope.current === storageKey) setState(s => ({ ...s, ready: false, error: english ? 'Could not load saved progress. Please retry.' : 'โหลดผลฝึกไม่ได้ กรุณาลองใหม่' }))
    })
    return () => { current = false; invalidate() }
  }, [storageKey, studentId, moduleType, revision, english, invalidate])

  const toggle = useCallback(async (id: string) => {
    if (scope.current !== storageKey || state.key !== storageKey || !state.ready || lock.current) return
    lock.current = true
    const generation = epoch.current
    const completed = !state.ids.includes(id)
    const next = completed ? [...state.ids, id] : state.ids.filter(value => value !== id)
    setState(s => ({ ...s, busy: true, error: '', notice: '' }))
    try {
      if (studentId) {
        const saved = await setStudentItemCompleted(studentId, moduleType, id, completed)
        if (!saved) throw new Error('remote')
      } else {
        localStorage.setItem(storageKey, JSON.stringify(next))
      }
      if (scope.current !== storageKey || generation !== epoch.current) return
      setState(s => ({ ...s, ids: next, notice: studentId
        ? (english ? 'Progress saved to your account.' : 'บันทึกผลเข้าบัญชีแล้ว')
        : (english ? 'Saved on this device.' : 'บันทึกในเครื่องนี้แล้ว') }))
      if (studentId) {
        try { localStorage.setItem(storageKey, JSON.stringify(next)) } catch { /* The confirmed server save still succeeded. */ }
      }
    } catch {
      if (scope.current === storageKey && generation === epoch.current) setState(s => ({ ...s, error: studentId
        ? (english ? 'Progress was not saved to your account. Check your connection and try again.' : 'ยังบันทึกผลเข้าบัญชีไม่สำเร็จ กรุณาตรวจอินเทอร์เน็ตแล้วกดบันทึกอีกครั้ง')
        : (english ? 'Could not save on this device. Check browser storage and try again.' : 'บันทึกในเครื่องไม่ได้ กรุณาตรวจพื้นที่จัดเก็บของเบราว์เซอร์แล้วลองใหม่') }))
    } finally {
      if (scope.current === storageKey && generation === epoch.current) { lock.current = false; setState(s => ({ ...s, busy: false })) }
    }
  }, [storageKey, studentId, moduleType, english, state.key, state.ready, state.ids])
  return {
    completedIds: state.key === storageKey ? state.ids : readCache(storageKey),
    isReady: state.key === storageKey && state.ready,
    busy: state.key === storageKey && state.busy,
    error: state.key === storageKey ? state.error : '', notice: state.key === storageKey ? state.notice : '',
    toggle, reload: () => setRevision(value => value + 1),
  }
}

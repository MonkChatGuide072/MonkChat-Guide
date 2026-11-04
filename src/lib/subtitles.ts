export interface SubtitleCue {
  id: string
  start: number
  end: number
  text: string
}

export function formatMediaTime(seconds: number): string {
  const safe = Number.isFinite(seconds) ? Math.max(0, Math.floor(seconds)) : 0
  return `${Math.floor(safe / 60).toString().padStart(2, '0')}:${(safe % 60).toString().padStart(2, '0')}`
}

function timestamp(value: string): number {
  if (!/^(?:\d{2,}:)?[0-5]\d:[0-5]\d\.\d{3}$/.test(value)) return NaN
  return value.split(':').reduce((total, part) => total * 60 + Number(part), 0)
}

export function parseWebVTT(input: string): SubtitleCue[] {
  const cues: SubtitleCue[] = []
  const lines = input.replace(/^\uFEFF/, '').replace(/\r\n?/g, '\n').split('\n')
  let current: { start: number; end: number; lines: string[] } | null = null
  let skipDirective = false
  const flush = () => {
    if (!current) return
    const text = current.lines.join('\n').replace(/<[^>]*>/g, '').trim()
    if (text && Number.isFinite(current.start) && Number.isFinite(current.end) && current.end > current.start) {
      cues.push({ id: `cue-${cues.length}`, start: current.start, end: current.end, text })
    }
    current = null
  }

  for (const rawLine of lines) {
    const line = rawLine.trim()
    if (!line) {
      flush()
      skipDirective = false
      continue
    }
    if (/^(NOTE|STYLE|REGION)(?:\s|$)/.test(line)) {
      flush()
      skipDirective = true
      continue
    }
    if (skipDirective || /^WEBVTT(?:\s|$)/.test(line)) continue

    // Some published files omit cue separators and put caption text after the end time.
    const timing = line.match(/^(\S+)\s+-->\s+(\S+)(?:\s+(.*))?$/)
    if (timing) {
      flush()
      const tail = timing[3]?.trim() || ''
      const inlineText = /^(?:line|position|size|align|vertical):/.test(tail) ? '' : tail
      current = { start: timestamp(timing[1]), end: timestamp(timing[2]), lines: inlineText ? [inlineText] : [] }
    } else if (current) {
      current.lines.push(rawLine)
    }
  }
  flush()
  return cues.sort((a, b) => a.start - b.start)
}

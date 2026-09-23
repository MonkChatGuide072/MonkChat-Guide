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
  const blocks = input.replace(/^\uFEFF/, '').replace(/\r\n?/g, '\n').split(/\n[ \t]*\n/)
  for (const block of blocks) {
    const lines = block.trim().split('\n')
    if (/^(WEBVTT|NOTE|STYLE|REGION)(?:\s|$)/.test(lines[0])) continue
    const timingIndex = lines[0].includes('-->') ? 0 : 1
    const match = lines[timingIndex]?.match(/^(\S+)\s+-->\s+(\S+)/)
    if (!match) continue
    const start = timestamp(match[1])
    const end = timestamp(match[2])
    const text = lines.slice(timingIndex + 1).join('\n').replace(/<[^>]*>/g, '').trim()
    if (!text || !Number.isFinite(start) || !Number.isFinite(end) || end <= start) continue
    cues.push({ id: `cue-${cues.length}`, start, end, text })
  }
  return cues.sort((a, b) => a.start - b.start)
}

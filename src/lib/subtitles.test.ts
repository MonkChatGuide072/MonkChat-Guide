import { describe, expect, it } from 'vitest'
import { formatMediaTime, parseWebVTT } from './subtitles'
import { isSafeWebUrl } from './publicContent'

describe('public media helpers', () => {
  it('parses bilingual captions, cue identifiers, CRLF and settings', () => {
    expect(parseWebVTT('\uFEFFWEBVTT\r\n\r\nintro\r\n00:00:01.000 --> 00:00:03.500 align:start\r\n<b>ตัวอย่าง</b>\r\nExample\r\n\r\n00:04.000 --> 00:06.000\r\nNext')).toEqual([
      { id: 'cue-0', start: 1, end: 3.5, text: 'ตัวอย่าง\nExample' },
      { id: 'cue-1', start: 4, end: 6, text: 'Next' },
    ])
  })

  it('ignores notes, invalid times and reversed or empty cues', () => {
    expect(parseWebVTT('WEBVTT\n\nNOTE hidden\n00:01.000 --> 00:02.000\nDo not show\n\n00:99.000 --> 01:00.000\nInvalid\n\n00:04.000 --> 00:01.000\nReversed\n\ninvalid --> 00:01.000\nInvalid\n\n00:00.000 --> 00:01.000')).toEqual([])
  })

  it('formats time and rejects unsafe outbound URLs', () => {
    expect(formatMediaTime(65.5)).toBe('01:05')
    expect(formatMediaTime(NaN)).toBe('00:00')
    expect(isSafeWebUrl('https://example.org/path')).toBe(true)
    for (const url of [null, '', 'javascript:alert(1)', 'data:text/html,hi', '//example.org', 'https://', 'https://user:password@example.org']) {
      expect(isSafeWebUrl(url)).toBe(false)
    }
  })
})

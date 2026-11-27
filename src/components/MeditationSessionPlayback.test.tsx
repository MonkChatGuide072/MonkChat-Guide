import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { MeditationPlayer } from './MeditationPlayer'

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key: string) => key }) }))
vi.mock('../lib/analytics', () => ({ trackUsageEvent: vi.fn(async () => {}) }))
vi.mock('../lib/supabase', () => ({ supabaseClient: { storage: { from: () => ({ createSignedUrl: async () => ({ data: { signedUrl: 'https://example.org/real-test-audio.mp3' }, error: null }) }) } } }))
const callbacks = { onPlay: vi.fn(), onPause: vi.fn(), onError: vi.fn() }
beforeEach(() => {
  vi.clearAllMocks()
  vi.spyOn(HTMLMediaElement.prototype, 'play').mockResolvedValue()
  vi.spyOn(HTMLMediaElement.prototype, 'pause').mockImplementation(() => {})
})
afterEach(() => { cleanup(); vi.restoreAllMocks() })
it('controls audio through the session and pauses it when removed', async () => {
  const view = render(<MeditationPlayer trackId="test" title="Guidance" audioPath="test.mp3" subtitlePath={null} playbackControl={{ ...callbacks, playing: false, locked: false }} />)
  await screen.findByLabelText('meditation.audioPlayerTitle: Guidance')
  expect(HTMLMediaElement.prototype.play).not.toHaveBeenCalled()
  view.rerender(<MeditationPlayer trackId="test" title="Guidance" audioPath="test.mp3" subtitlePath={null} playbackControl={{ ...callbacks, playing: true, locked: true }} />)
  await waitFor(() => expect(HTMLMediaElement.prototype.play).toHaveBeenCalledOnce())
  const audio = screen.getByLabelText('meditation.audioPlayerTitle: Guidance')
  fireEvent.play(audio)
  expect(callbacks.onPlay).toHaveBeenCalledOnce()
  fireEvent.pause(audio)
  expect(callbacks.onPause).toHaveBeenCalledOnce()
  view.unmount()
  expect(HTMLMediaElement.prototype.pause).toHaveBeenCalled()
})
it('reports rejected playback to the session instead of pretending it played', async () => {
  vi.mocked(HTMLMediaElement.prototype.play).mockRejectedValueOnce(new Error('Playback blocked'))
  render(<MeditationPlayer trackId="test" title="Guidance" audioPath="test.mp3" subtitlePath={null} playbackControl={{ ...callbacks, playing: true, locked: true }} />)
  await screen.findByLabelText('meditation.audioPlayerTitle: Guidance')
  await waitFor(() => expect(callbacks.onError).toHaveBeenCalledOnce())
})

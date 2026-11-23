export const postcardPalettes = [
  { id: 'garden', th: 'สวนร่มไม้', en: 'Temple garden', paper: '#e5efdd', sky: '#e4f0e8', leaf: '#568670', dark: '#345b4d', accent: '#bd795c', petal: '#f0c4b1' },
  { id: 'sunlight', th: 'แสงอุ่นอยุธยา', en: 'Ayutthaya sunshine', paper: '#f8e2cd', sky: '#f9ecd4', leaf: '#829061', dark: '#79563e', accent: '#c47b52', petal: '#edd09b' },
  { id: 'lotus', th: 'บัวละมุน', en: 'Soft lotus', paper: '#eee3ef', sky: '#f1e6ed', leaf: '#7b9181', dark: '#68516d', accent: '#b8798e', petal: '#e8bfce' },
] as const
export type PostcardPaletteId = typeof postcardPalettes[number]['id']

// Word-aware wrapping for both English and Thai, including unbroken long names.
export function wrapPostcardText(text: string, maxCharacters: number): string[] {
  const words = Array.from(new Intl.Segmenter('th', { granularity: 'word' }).segment(text.trim()), (s) => s.segment)
  const lines: string[] = []
  let line = ''
  for (const word of words) {
    const characters = Array.from(word)
    if (characters.length > maxCharacters) {
      if (line.trim()) lines.push(line.trim())
      line = ''
      while (characters.length > maxCharacters) lines.push(characters.splice(0, maxCharacters).join(''))
      line = characters.join('')
    } else if (Array.from(line + word).length > maxCharacters && line.trim()) {
      lines.push(line.trim()); line = word.trimStart()
    } else line += word
  }
  if (line.trim()) lines.push(line.trim())
  return lines
}

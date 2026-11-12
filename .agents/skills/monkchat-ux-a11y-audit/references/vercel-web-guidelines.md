# Web Interface Guidelines Reference (Adapted for MonkChat Guide)

Adapted from [vercel-labs/web-interface-guidelines](https://github.com/vercel-labs/web-interface-guidelines) under the MIT License:

```text
MIT License

Copyright (c) 2025 Vercel Labs

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.
```

## MonkChat Guide Adaptations (Precedence Over Defaults)

- **Sentence case copy**: Keep Thai/English headings and buttons in calm Sentence case (never force Chicago Title Case or replace "and" with `&` where awkward).
- **Vite + React CSR PWA**: Ignore Next.js/SSR-only directives (`next/image`, `suppressHydrationWarning`, URL query-string sync for ephemeral flashcard or tab states unless deep-linking is requested).
- **Outdoor calm aesthetic**: Prefer `AGENTS.md` + `unslop` brand palette (`brand-cream`, `brand-surface`, `brand-maroon`, `brand-terracotta`, `#11223C` CMS) and zero emojis/glows.

---

## Audit Checklist Rules

### Accessibility
- Icon-only buttons need descriptive `aria-label`.
- Every form `<input>`, `<select>`, and `<textarea>` needs an explicit `<label>` (`htmlFor` or wrapping) or `aria-label`.
- Interactive custom controls need keyboard handlers (`Enter` / `Space` / arrow keys for `role="tab"`).
- Use `<button type="button|submit">` for actions and `<a href>` / `<Link to>` for navigation (never `<div onClick>`).
- Meaningful images need descriptive `alt`; decorative icons inside labeled buttons/links need `aria-hidden="true"`.
- Dynamic status/error regions should expose `role="alert"` or `role="status"` / `aria-live="polite"`.
- Maintain logical heading hierarchy (`<h1>` -> `<h2>` -> `<h3>`, no skipped major levels) and clear landmark structure (`<header>`, `<nav>`, `<main>`, `<footer>`, skip link).
- Audio/video experiences need transcripts, captions/VTT subtitles, or clear descriptive fallbacks and keyboard-operable controls.

### Focus States
- Interactive controls must keep visible `:focus-visible` outlines/rings (`focus-visible:ring-*` or equivalent browser ring); never strip `outline-none` without a clear replacement.
- Prefer `:focus-visible` over `:focus` where click rings are noisy.
- Sticky headers/nav bars must not obscure focused targets (`scroll-margin-top` or safe spacing).

### Forms & Error Recovery
- Auth inputs should set appropriate `type` (`email`, `password`, `text`), `inputMode` (`numeric` for 7-digit IDs), `autoComplete` (`current-password`, `new-password`, `off` on invite/search codes), and `spellCheck={false}` on IDs/codes/emails.
- Keep `>= 16px` (`text-base`) font size on mobile inputs/selects to prevent iOS Safari zoom.
- Never block copy/paste (`onPaste` + `preventDefault`) on password or code inputs.
- Checkboxes/radios and their labels must share one clickable hit target with `>= 44px` (`min-h-11`) height on touch devices.
- Submit buttons stay enabled until submission starts (show disabled/loading feedback during flight); render errors inline next to fields with a clear recovery instruction.
- Placeholders illustrate format cleanly (e.g., `6611018`, `AYT66-XXXX-YYYY`).

### Animation & Motion
- Respect `prefers-reduced-motion: reduce`.
- Never use `transition-all`; specify `transition-colors` / `transition-transform` / `transition-opacity`.
- Avoid purposeless continuous pulsing/bouncing (`animate-pulse`, `animate-bounce`).

### Typography & Content Handling
- Use `tabular-nums` on schedules (`13:15`), student codes (`6611018`), timers, and progress counters (`1 / 7`).
- Flex/grid children with long text or Thai/URL strings need `min-w-0` and `break-words` / `[overflow-wrap:anywhere]` so layouts never push past `360px` viewport width.
- Loading, empty, and error states must always show calm, clear messaging and an action path (e.g., Retry, Switch tab, Go back).

### Images & Media
- `<img>` elements should provide explicit `width` and `height` (or fixed aspect wrapper) to prevent Cumulative Layout Shift (CLS).
- Below-fold/secondary gallery images use `loading="lazy"`; hero/LCP visuals stay eager/high priority.

### Touch, Layout & Locale
- Touch targets across mobile/tablet/desktop (`<button>`, `<a>`, tabs, checkboxes) meet `>= 44px` height (`min-h-11`).
- Keep zero horizontal document overflow across `360px`, `390px`, `768px`, `1024px`, `1440px`.
- Dates, numbers, and bilingual labels handle both Thai (`th`, default) and English (`en`) cleanly; code identifiers or brand names avoid confusing auto-translation quirks (`translate="no"` where helpful).

### Anti-Patterns to Flag
- `user-scalable=no` or `maximum-scale=1` disabling zoom
- `onPaste` preventing password/code pasting
- `transition-all`
- `outline-none` without `focus-visible` ring
- Non-semantic `<div onClick>` / `<span onClick>` acting as buttons or links
- Icon-only buttons missing `aria-label`
- Form fields missing accessible `<label>`
- Input font `< 16px` (`text-xs` / `text-sm`) on mobile forms
- Sticky bars covering scrolled/focused content
- Unrecoverable dead-end errors without Retry or alternative navigation


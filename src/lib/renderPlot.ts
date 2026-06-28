import * as Plot from '@observablehq/plot'
import { JSDOM } from 'jsdom'

/**
 * Renders an Observable Plot spec to a static SVG string at build time.
 *
 * Plot needs a DOM, so we provide one via jsdom. Theming defaults make the
 * output adapt to the site theme: a transparent background and `color:
 * var(--text)` let axes/labels inherit the current theme text color through
 * `currentColor`, and CSS variables (e.g. `var(--accent)`) used in the spec are
 * resolved by the browser against the active `.dark-theme` tokens at render
 * time — so a single inlined SVG works in both light and dark mode.
 *
 * Note: jsdom does not implement `getBBox`/`getComputedTextLength`, so Plot's
 * automatic margins are unreliable. Always pass explicit `width`/`height` and
 * margins in the spec.
 */
export function renderPlotToSVG(options: Plot.PlotOptions): string {
  const { window } = new JSDOM('')
  const node = Plot.plot({
    document: window.document,
    style: { background: 'transparent', color: 'var(--text)', overflow: 'visible', fontSize: '12px' },
    ...options,
  })
  return (node as Element).outerHTML
}

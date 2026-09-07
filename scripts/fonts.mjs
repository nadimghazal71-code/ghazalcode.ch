/**
 * Downloads the Poppins woff2 files Google would otherwise serve, and writes a
 * local stylesheet pointing at them. Poppins is licensed under the SIL Open
 * Font License, which explicitly permits redistribution, so self-hosting is
 * allowed - and it stops every visitor's IP being handed to Google.
 */
import { mkdirSync, writeFileSync } from 'node:fs'
import path from 'node:path'

const OUT = process.argv[2]
const WANTED = new Set(['latin', 'latin-ext'])
const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36'

const css = await fetch(
  'https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap',
  { headers: { 'User-Agent': UA } },
).then((r) => r.text())

// Each face is preceded by a /* subset */ comment.
const blocks = css.split('/*').slice(1)
const faces = []

for (const raw of blocks) {
  const subset = raw.slice(0, raw.indexOf('*/')).trim()
  if (!WANTED.has(subset)) continue
  const weight = raw.match(/font-weight:\s*(\d+)/)?.[1]
  const url = raw.match(/url\((https:\/\/[^)]+\.woff2)\)/)?.[1]
  const range = raw.match(/unicode-range:\s*([^;]+);/)?.[1]
  if (weight && url && range) faces.push({ subset, weight, url, range: range.trim() })
}

mkdirSync(OUT, { recursive: true })

let out = `/*
  Poppins, self-hosted.

  Loading this from fonts.googleapis.com would send every visitor's IP address
  to Google, which is a GDPR / revised-FADP problem for a Swiss-facing site.
  These files are served from our own origin instead. Poppins is SIL Open Font
  License 1.1, which permits redistribution.

  Regenerate with scripts/fonts.mjs if the weights ever change.
*/
`

for (const face of faces) {
  const file = `poppins-${face.weight}-${face.subset}.woff2`
  const bytes = Buffer.from(await fetch(face.url).then((r) => r.arrayBuffer()))
  writeFileSync(path.join(OUT, file), bytes)
  console.log('  ', file, bytes.length, 'bytes')
  out += `
@font-face {
  font-family: 'Poppins';
  font-style: normal;
  font-weight: ${face.weight};
  font-display: swap;
  src: url('${file}') format('woff2');
  unicode-range: ${face.range};
}
`
}

writeFileSync(path.join(OUT, 'poppins.css'), out)
console.log('\nwrote poppins.css with', faces.length, 'faces')

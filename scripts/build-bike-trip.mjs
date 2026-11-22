// Builds src/data/bike-trip.json, the pre-projected map drawn by BikeTripCard.astro.
//
// It turns the full trip GPX (~30k points) and Natural Earth's 1:10m land and border
// layers into a few small SVG paths, so the site ships no map library and no tiles.
// Re-run it only if the trace or the map frame changes:
//
//   node scripts/build-bike-trip.mjs <trip.gpx> <ne_10m_land.geojson> <ne_10m_admin_0_boundary_lines_land.geojson>
//
// Natural Earth (public domain): https://github.com/nvkelso/natural-earth-vector/tree/master/geojson

import { readFileSync, writeFileSync } from 'node:fs'

const [gpxPath, landPath, bordersPath] = process.argv.slice(2)
if (!gpxPath || !landPath || !bordersPath) {
  console.error('usage: node scripts/build-bike-trip.mjs <trip.gpx> <land.geojson> <borders.geojson>')
  process.exit(1)
}

// Map frame (degrees). Wide enough to show the Balearics and the tip of Morocco for context.
const FRAME = { west: -7.1, east: 6.6, south: 35.3, north: 45.75 }
const WIDTH = 400
// Simplification tolerances, in viewBox units
const ROUTE_TOLERANCE = 0.35
const COAST_TOLERANCE = 0.45

// Main cities on the road, with their label placement (offset from the dot, in viewBox units)
const CITIES = [
  { name: 'Grenoble', lat: 45.188, lon: 5.724, dx: -7, dy: -5, anchor: 'end', role: 'start' },
  { name: 'Montpellier', lat: 43.611, lon: 3.877, dx: -6, dy: -6, anchor: 'end' },
  { name: 'Perpignan', lat: 42.699, lon: 2.895, dx: -6, dy: 3.5, anchor: 'end' },
  { name: 'Barcelona', lat: 41.387, lon: 2.17, dx: -6, dy: 3.5, anchor: 'end' },
  { name: 'Valencia', lat: 39.47, lon: -0.376, dx: -6, dy: 3.5, anchor: 'end' },
  { name: 'Alicante', lat: 38.345, lon: -0.481, dx: 7, dy: 4.5, anchor: 'start' },
  { name: 'Almería', lat: 36.834, lon: -2.464, dx: 3, dy: 12, anchor: 'start' },
  { name: 'Granada', lat: 37.177, lon: -3.599, dx: 0, dy: -7, anchor: 'middle' },
  { name: 'Málaga', lat: 36.721, lon: -4.421, dx: 2, dy: 12, anchor: 'middle' },
  { name: 'Tarifa', lat: 36.013, lon: -5.606, dx: 0, dy: 14, anchor: 'middle' },
  { name: 'Sevilla', lat: 37.389, lon: -5.984, dx: 0, dy: -8, anchor: 'middle', role: 'end' },
]

// --- projection (Web Mercator, scaled to the frame) ---
const rad = (d) => (d * Math.PI) / 180
const mercY = (lat) => Math.log(Math.tan(Math.PI / 4 + rad(lat) / 2))
const scale = WIDTH / (rad(FRAME.east) - rad(FRAME.west))
const HEIGHT = (mercY(FRAME.north) - mercY(FRAME.south)) * scale
const project = ([lon, lat]) => [(rad(lon) - rad(FRAME.west)) * scale, (mercY(FRAME.north) - mercY(lat)) * scale]

// --- geometry helpers (all in projected coordinates) ---
function simplify(points, tolerance) {
  // Iterative Douglas-Peucker
  if (points.length < 3) return points
  const keep = new Uint8Array(points.length)
  keep[0] = keep[points.length - 1] = 1
  const stack = [[0, points.length - 1]]
  const t2 = tolerance * tolerance
  while (stack.length) {
    const [a, b] = stack.pop()
    const [ax, ay] = points[a]
    const [bx, by] = points[b]
    const dx = bx - ax
    const dy = by - ay
    const len2 = dx * dx + dy * dy
    let maxD = -1
    let idx = -1
    for (let i = a + 1; i < b; i++) {
      const [px, py] = points[i]
      let t = len2 ? ((px - ax) * dx + (py - ay) * dy) / len2 : 0
      t = Math.max(0, Math.min(1, t))
      const ex = ax + t * dx - px
      const ey = ay + t * dy - py
      const d = ex * ex + ey * ey
      if (d > maxD) {
        maxD = d
        idx = i
      }
    }
    if (maxD > t2) {
      keep[idx] = 1
      stack.push([a, idx], [idx, b])
    }
  }
  return points.filter((_, i) => keep[i])
}

// Sutherland-Hodgman clip of a closed ring against the (slightly padded) viewBox
function clipRing(ring, pad = 4) {
  const edges = [
    { inside: (p) => p[0] >= -pad, cross: (p, q) => lerpAt(p, q, 0, -pad) },
    { inside: (p) => p[0] <= WIDTH + pad, cross: (p, q) => lerpAt(p, q, 0, WIDTH + pad) },
    { inside: (p) => p[1] >= -pad, cross: (p, q) => lerpAt(p, q, 1, -pad) },
    { inside: (p) => p[1] <= HEIGHT + pad, cross: (p, q) => lerpAt(p, q, 1, HEIGHT + pad) },
  ]
  let out = ring
  for (const edge of edges) {
    const input = out
    out = []
    for (let i = 0; i < input.length; i++) {
      const cur = input[i]
      const prev = input[(i + input.length - 1) % input.length]
      if (edge.inside(cur)) {
        if (!edge.inside(prev)) out.push(edge.cross(prev, cur))
        out.push(cur)
      } else if (edge.inside(prev)) {
        out.push(edge.cross(prev, cur))
      }
    }
    if (!out.length) break
  }
  return out
}

function lerpAt(p, q, axis, value) {
  const t = (value - p[axis]) / (q[axis] - p[axis])
  return [p[0] + t * (q[0] - p[0]), p[1] + t * (q[1] - p[1])]
}

// Splits a line into the runs that pass through the padded viewBox
function clipLine(line, pad = 4) {
  const inBox = ([x, y]) => x >= -pad && x <= WIDTH + pad && y >= -pad && y <= HEIGHT + pad
  const runs = []
  let run = []
  line.forEach((p, i) => {
    if (inBox(p)) {
      if (!run.length && i > 0) run.push(line[i - 1])
      run.push(p)
    } else if (run.length) {
      run.push(p)
      runs.push(run)
      run = []
    }
  })
  if (run.length) runs.push(run)
  return runs
}

const fmt = (n) => Math.round(n * 10) / 10
const toPath = (points, close = false) =>
  points.map(([x, y], i) => `${i ? 'L' : 'M'}${fmt(x)} ${fmt(y)}`).join('') + (close ? 'Z' : '')

const bboxTouchesFrame = (coords) => {
  let w = Infinity, e = -Infinity, s = Infinity, n = -Infinity
  for (const [lon, lat] of coords) {
    w = Math.min(w, lon); e = Math.max(e, lon); s = Math.min(s, lat); n = Math.max(n, lat)
  }
  return !(e < FRAME.west - 1 || w > FRAME.east + 1 || n < FRAME.south - 1 || s > FRAME.north + 1)
}

// --- route ---
const gpx = readFileSync(gpxPath, 'utf8')
const tracks = [...gpx.matchAll(/<trk>([\s\S]*?)<\/trk>/g)].map((m) =>
  [...m[1].matchAll(/<trkseg>([\s\S]*?)<\/trkseg>/g)].map((s) =>
    [...s[1].matchAll(/<trkpt lat="([-\d.]+)" lon="([-\d.]+)"/g)].map((p) => [Number(p[2]), Number(p[1])]),
  ),
)
// Track 1 is a single segment that fills the gap between day 3's two recordings
// (Pont-St-Esprit -> Avignon), so it slots in after the third segment of track 0.
const [rides, [gapFill]] = tracks
const segments = [...rides.slice(0, 3), gapFill, ...rides.slice(3)]
const routePoints = segments.flat()

function haversineKm([lon1, lat1], [lon2, lat2]) {
  const a = Math.sin(rad(lat2 - lat1) / 2) ** 2 + Math.cos(rad(lat1)) * Math.cos(rad(lat2)) * Math.sin(rad(lon2 - lon1) / 2) ** 2
  return 2 * 6371 * Math.asin(Math.sqrt(a))
}
const distanceKm = segments.reduce((sum, seg) => sum + seg.slice(1).reduce((s, p, i) => s + haversineKm(seg[i], p), 0), 0)

const route = simplify(routePoints.map(project), ROUTE_TOLERANCE)

// --- land ---
const land = JSON.parse(readFileSync(landPath, 'utf8'))
const landPaths = []
for (const feature of land.features) {
  const polygons = feature.geometry.type === 'Polygon' ? [feature.geometry.coordinates] : feature.geometry.coordinates
  for (const polygon of polygons) {
    for (const ring of polygon) {
      if (!bboxTouchesFrame(ring)) continue
      const clipped = clipRing(ring.map(project))
      if (clipped.length < 3) continue
      const simplified = simplify(clipped, COAST_TOLERANCE)
      if (simplified.length >= 3) landPaths.push(toPath(simplified, true))
    }
  }
}

// --- borders ---
const borders = JSON.parse(readFileSync(bordersPath, 'utf8'))
const borderPaths = []
for (const feature of borders.features) {
  const lines = feature.geometry.type === 'LineString' ? [feature.geometry.coordinates] : feature.geometry.coordinates
  for (const line of lines) {
    if (!bboxTouchesFrame(line)) continue
    for (const run of clipLine(line.map(project))) {
      const simplified = simplify(run, COAST_TOLERANCE)
      if (simplified.length >= 2) borderPaths.push(toPath(simplified))
    }
  }
}

const out = {
  width: WIDTH,
  height: fmt(HEIGHT),
  distanceKm: Math.round(distanceKm),
  route: toPath(route),
  land: landPaths.join(''),
  borders: borderPaths.join(''),
  cities: CITIES.map(({ lat, lon, ...city }) => {
    const [x, y] = project([lon, lat])
    return { ...city, x: fmt(x), y: fmt(y) }
  }),
}

const target = new URL('../src/data/bike-trip.json', import.meta.url)
writeFileSync(target, JSON.stringify(out, null, 2) + '\n')
console.log(
  `route: ${routePoints.length} -> ${route.length} points, ${out.distanceKm} km; ` +
    `land: ${landPaths.length} rings; borders: ${borderPaths.length} lines; ` +
    `${(JSON.stringify(out).length / 1024).toFixed(1)} KB`,
)

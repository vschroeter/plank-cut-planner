export function parseFlexibleNumber (raw: string | number | null | undefined): number | null {
  if (raw === undefined || raw === null) {
    return null
  }
  if (typeof raw === 'number') {
    return Number.isFinite(raw) ? raw : null
  }
  const s = String(raw).trim()
  if (s === '') {
    return null
  }
  const n = Number(s.replace(',', '.'))
  return Number.isFinite(n) ? n : null
}

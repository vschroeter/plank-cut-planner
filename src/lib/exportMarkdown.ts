/* eslint-disable unicorn/prefer-single-call */
import type { Plank, RequiredPieceInput } from '@/types/planner'
import { formatLength } from '@/composables/useUnits'

function rects (count: number, groupAt = 5): string {
  if (groupAt) {
    const lines: string[] = []
    for (let i = 0; i < Math.floor(count / groupAt); i++) {
      lines.push(Array.from({ length: groupAt }, () => '□').join(' '))
    }

    // Add the rest
    lines.push(Array.from({ length: count % groupAt }, () => '□').join(' '))
    return lines.join('  ')
  }

  return Array.from({ length: count }, () => '□').join(' ')
}

function fmtPiece (lengthMm: number, widthMm: number, unit: 'mm' | 'inch'): string {
  const a = formatLength(lengthMm, unit)
  const b = formatLength(widthMm, unit)
  return `${a} x ${b}`
}

export function buildCutPlanMarkdown (planks: Plank[], required: RequiredPieceInput[], unit: 'mm' | 'inch'): string {
  const lines: string[] = []
  lines.push('# Cut Plan')
  lines.push('')
  // Section A
  lines.push('## Planks and assigned pieces')
  const sortedPlanks = [...planks].toSorted((a, b) => b.lengthMm - a.lengthMm)
  for (const [idx, plank] of sortedPlanks.entries()) {
    const plankHeader = `Plank ${idx + 1}: ${fmtPiece(plank.lengthMm, plank.widthMm, unit)}`
    lines.push(plankHeader)
    // pieces sorted by width desc then length desc
    const pieces = [...plank.pieces].toSorted((a, b) => (b.widthMm - a.widthMm) || (b.lengthMm - a.lengthMm))
    for (const piece of pieces) {
      lines.push(`- ${fmtPiece(piece.lengthMm, piece.widthMm, unit)} ${rects(1)}`)
    }
    lines.push('')
  }

  // Section B
  lines.push('## Unique pieces with totals')
  const grouped = new Map<string, { widthMm: number, lengthMm: number, count: number }>()
  for (const r of required) {
    const key = `${r.widthMm}x${r.lengthMm}`
    const cur = grouped.get(key) ?? { widthMm: r.widthMm, lengthMm: r.lengthMm, count: 0 }
    cur.count += r.quantity
    grouped.set(key, cur)
  }
  // Order groups by width desc then length desc
  const groups = Array.from(grouped.values()).toSorted((a, b) => (b.widthMm - a.widthMm) || (b.lengthMm - a.lengthMm))
  for (const g of groups) {
    lines.push(`${g.count} x ${fmtPiece(g.lengthMm, g.widthMm, unit)} ${rects(g.count)}`)
  }

  return lines.join('\n')
}

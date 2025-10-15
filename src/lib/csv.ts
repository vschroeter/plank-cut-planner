// CSV helpers shared by tables

export type CsvRow = Record<string, string | number | null | undefined>

function escapeCsvValue (value: string): string {
  // Escape quotes by doubling them and wrap in quotes if needed
  const needsQuotes = /[",\n]/.test(value) || value.startsWith(' ') || value.endsWith(' ')
  const escaped = value.replaceAll('"', '""')
  return needsQuotes ? `"${escaped}"` : escaped
}

export function buildCsv (headers: string[], rows: CsvRow[]): string {
  const headerLine = headers.map(h => escapeCsvValue(h)).join(',')
  const dataLines = rows.map(row => headers.map(h => {
    const v = row[h]
    if (v === null || v === undefined) {
      return ''
    }
    return escapeCsvValue(String(v))
  }).join(','))
  return [headerLine, ...dataLines].join('\n')
}

export function parseCsv (text: string): string[][] {
  // Minimal CSV parser supporting quotes and commas
  const rows: string[][] = []
  let field = ''
  let row: string[] = []
  let inQuotes = false
  for (let i = 0; i < text.length; i++) {
    const ch = text[i]
    if (inQuotes) {
      if (ch === '"') {
        const next = text[i + 1]
        if (next === '"') { // escaped quote
          field += '"'
          i++
        } else {
          inQuotes = false
        }
      } else {
        field += ch
      }
    } else {
      switch (ch) {
        case '"': {
          inQuotes = true

          break
        }
        case ',': {
          row.push(field)
          field = ''

          break
        }
        case '\n':
        case '\r': {
        // finalize row on newline; support CRLF
          if (ch === '\r' && text[i + 1] === '\n') {
            i++
          }
          row.push(field)
          rows.push(row)
          row = []
          field = ''

          break
        }
        default: {
          field += ch
        }
      }
    }
  }
  // push last field/row if any
  if (inQuotes) {
    // Unbalanced quotes; treat as best-effort by closing
    inQuotes = false
  }
  if (field.length > 0 || row.length > 0) {
    row.push(field)
    rows.push(row)
  }
  return rows
}

export function downloadTextFile (content: string, filename: string): void {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.append(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

export async function readFileAsText (file: File): Promise<string> {
  return await new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.addEventListener('load', () => resolve(String(reader.result ?? '')))
    reader.onerror = () => reject(reader.error)
    reader.readAsText(file)
  })
}

function escapeHtml(s: string) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

export type JsonViewerOptions = { indentSize?: number; maxStringLength?: number }
const isPlain = (v: unknown): v is Record<string, unknown> =>
  !!v && typeof v === 'object' && !Array.isArray(v) && Object.getPrototypeOf(v) === Object.prototype

function primaryKeyOf(o: Record<string, unknown>): string | null {
  for (const k of ['id', 'name', 'label', 'slug']) if (k in o) return k
  return null
}

export function prettyJsonToHtml(value: unknown, opts: JsonViewerOptions = {}, level = 0): string {
  const size = opts.indentSize ?? 2
  const indent = Number.isFinite(size) ? Math.max(0, Math.min(10, Math.floor(size))) : 2
  const pad = '&nbsp;'.repeat(indent * level)

  if (Array.isArray(value)) {
    if (value.length === 0) return `${pad}<span class="pd-bracket">[ ]</span>`
    const open = `${pad}<span class="pd-bracket">[</span>\n`
    const items = value.map((v) => renderArrayItem(v, opts, level + 1)).join('\n')
    const close = `\n${pad}<span class="pd-bracket">]</span>`
    return open + items + close
  }

  if (isPlain(value)) {
    const entries = Object.entries(value)
    if (entries.length === 0) return `${pad}<span class="pd-empty">(empty)</span>`
    return entries
      .map(([k, v]) => {
        const keyHtml = `<span class="pd-key">${escapeHtml(k)}</span><span class="pd-colon">:</span>`
        if (isPlain(v) || Array.isArray(v)) {
          const child = prettyJsonToHtml(v, opts, level + 1)
          return `${pad}${keyHtml}\n${child}`
        } else {
          return `${pad}${keyHtml} <span class="pd-value">${formatPrimitive(v, opts)}</span>`
        }
      })
      .join('\n')
  }

  return `${pad}<span class="pd-value">${formatPrimitive(value, opts)}</span>`
}

function renderArrayItem(v: unknown, opts: JsonViewerOptions, level: number): string {
  const pad = '&nbsp;'.repeat((opts.indentSize ?? 2) * level)
  const bullet = `<span class="pd-bullet">-</span>`

  if (Array.isArray(v)) {
    const child = prettyJsonToHtml(v, opts, level + 1)
    return `${pad}${bullet}\n${child}`
  }

  if (isPlain(v)) {
    const obj = v as Record<string, unknown>
    const pk = primaryKeyOf(obj)

    if (pk) {
      const header =
        `${pad}${bullet} <span class="pd-key">${escapeHtml(pk)}</span><span class="pd-colon">:</span> ` +
        `<span class="pd-value">${formatPrimitive(obj[pk], opts)}</span>`

      const rest: Record<string, unknown> = {}
      for (const [k, val] of Object.entries(obj)) if (k !== pk) rest[k] = val

      const body = Object.keys(rest).length ? '\n' + prettyJsonToHtml(rest, opts, level + 1) : ''

      return header + body
    }

    const child = prettyJsonToHtml(v, opts, level + 1)
      .replace(/^\s*(&nbsp;)+/, '')
      .replace(/^\n+/, '')
    return `${pad}${bullet} ${child}`
  }

  return `${pad}${bullet} <span class="pd-value">${formatPrimitive(v, opts)}</span>`
}

function formatPrimitive(v: unknown, opts: JsonViewerOptions): string {
  if (v === null) return `<span class="pd-null">null</span>`
  switch (typeof v) {
    case 'string': {
      const requested = opts.maxStringLength ?? 500
      const limit = Number.isFinite(requested) ? Math.max(0, Math.floor(requested)) : 500
      // Avoid leaving a dangling surrogate when the boundary falls inside an emoji.
      const preview = v.length > limit ? `${v.slice(0, limit).replace(/[\uD800-\uDBFF]$/, '')}…` : v
      return `<span class="pd-string">${escapeHtml(preview)}</span>`
    }
    case 'number':
      return `<span class="pd-number">${String(v)}</span>`
    case 'boolean':
      return `<span class="pd-boolean">${String(v)}</span>`
    default:
      return `<span class="pd-string">${escapeHtml(String(v))}</span>`
  }
}

/** Normalize DTOs and dates without mutating the input. */
export function toSafeJson(value: unknown): unknown {
  const ancestors: object[] = []
  const json = JSON.stringify(value, function (_key, current: unknown) {
    if (typeof current === 'bigint') return current.toString()
    if (current === null || typeof current !== 'object') return current
    while (ancestors.length && ancestors[ancestors.length - 1] !== this) ancestors.pop()
    if (ancestors.includes(current)) return '[Circular]'
    ancestors.push(current)
    return current
  })
  return json === undefined ? null : JSON.parse(json)
}

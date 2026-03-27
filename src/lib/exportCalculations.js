import * as XLSX from 'xlsx'
import { displaySellingPrice } from './formatMoney'

function escapeCsvCell(v) {
  if (v == null) return ''
  const s = String(v)
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`
  return s
}

export function exportCalculationsCsv(rows, settings, filename = 'kalqulaciebi.csv') {
  const headers = [
    'სახელი', 'ტიპი', 'კატეგორია', 'ულუფა', 'ჯამი', '1 ულუფა', 'თარიღი', 'შენიშვნა',
    'გასაყიდი (+მარჟა+დღგ)',
  ]
  const lines = [headers.join(',')]
  for (const c of rows) {
    const sell = displaySellingPrice(c.total_cost, settings)
    const line = [
      c.name,
      c.type === 'bulk' ? 'ნ/ფაბრიკატი' : '1 ულუფა',
      c.category || '',
      c.servings ?? '',
      c.total_cost ?? '',
      c.cost_per_serving ?? '',
      c.created_at ? new Date(c.created_at).toLocaleString('ka-GE') : '',
      c.note || '',
      sell.toFixed(2),
    ].map(escapeCsvCell)
    lines.push(line.join(','))
  }
  const bom = '\uFEFF'
  const blob = new Blob([bom + lines.join('\n')], { type: 'text/csv;charset=utf-8' })
  downloadBlob(blob, filename)
}

export function exportCalculationsXlsx(rows, settings, filename = 'kalqulaciebi.xlsx') {
  const data = rows.map(c => ({
    სახელი: c.name,
    ტიპი: c.type === 'bulk' ? 'ნ/ფაბრიკატი' : '1 ულუფა',
    კატეგორია: c.category || '',
    ულუფა: c.servings ?? '',
    ჯამი: c.total_cost != null ? Number(c.total_cost) : '',
    '1 ულუფა': c.cost_per_serving != null ? Number(c.cost_per_serving) : '',
    თარიღი: c.created_at ? new Date(c.created_at).toLocaleString('ka-GE') : '',
    შენიშვნა: c.note || '',
    'გასაყიდი_მარჟა_დღგ': displaySellingPrice(c.total_cost, settings),
  }))
  const ws = XLSX.utils.json_to_sheet(data)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'კალკულაციები')
  XLSX.writeFile(wb, filename)
}

export function printCalculationsReport(rows, settings, title = 'კალკულაციების ანგარიში') {
  const sym = settings?.currencySymbol || '₾'
  const rowsHtml = rows.map(c => {
    const sell = displaySellingPrice(c.total_cost, settings)
    return `<tr>
      <td>${escapeHtml(c.name)}</td>
      <td>${c.type === 'bulk' ? 'ნ/ფ.' : '1 ულ.'}</td>
      <td>${escapeHtml(c.category || '')}</td>
      <td style="text-align:right">${c.total_cost != null ? Number(c.total_cost).toFixed(2) : ''}</td>
      <td style="text-align:right">${sell.toFixed(2)}</td>
      <td>${c.created_at ? new Date(c.created_at).toLocaleDateString('ka-GE') : ''}</td>
    </tr>`
  }).join('')
  const html = `<!DOCTYPE html><html lang="ka"><head><meta charset="utf-8"/><title>${escapeHtml(title)}</title>
  <style>
    body{font-family:system-ui,sans-serif;padding:16px;color:#111}
    h1{font-size:18px;margin-bottom:12px}
    table{border-collapse:collapse;width:100%;font-size:12px}
    th,td{border:1px solid #ccc;padding:6px 8px;text-align:left}
    th{background:#f0f0f0}
    @media print { body { padding: 0 } }
  </style></head><body>
  <h1>${escapeHtml(title)}</h1>
  <p style="font-size:11px;color:#666">${new Date().toLocaleString('ka-GE')} · ვალუტა: ${escapeHtml(sym)}</p>
  <table><thead><tr>
    <th>სახელი</th><th>ტიპი</th><th>კატეგორია</th><th>ჯამი</th><th>გასაყიდი</th><th>თარიღი</th>
  </tr></thead><tbody>${rowsHtml}</tbody></table>
  <script>window.onload=function(){window.print()}</script>
  </body></html>`
  const w = window.open('', '_blank')
  if (!w) return false
  w.document.write(html)
  w.document.close()
  return true
}

function escapeHtml(s) {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function downloadBlob(blob, filename) {
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = filename
  a.click()
  URL.revokeObjectURL(a.href)
}

/**
 * საერთო ლუქს სტილები — ფერები იღება index.css-ის CSS ცვლადებიდან (data-theme)
 */
export const lux = {
  card: {
    background: 'var(--surface)',
    borderRadius: 22,
    border: '1px solid var(--border-card)',
    boxShadow: 'var(--shadow-card)',
    padding: '20px',
    marginBottom: 16,
  },
  inp: {
    padding: '12px 14px',
    background: 'var(--input-fill)',
    border: '1.5px solid var(--input-border)',
    borderRadius: 12,
    color: 'var(--text)',
    fontSize: 13,
    outline: 'none',
    width: '100%',
    fontFamily: "'Noto Sans Georgian', sans-serif",
    transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
  },
  lbl: {
    fontSize: 10,
    fontWeight: 700,
    color: 'var(--text-muted)',
    marginBottom: 8,
    letterSpacing: '0.14em',
    textTransform: 'uppercase',
    display: 'block',
  },
}

const s = {
  overlay: {
    position: 'fixed', inset: 0, zIndex: 80,
    background: 'rgba(0,0,0,0.72)',
    display: 'flex', alignItems: 'flex-end',
  },
  sheet: {
    background: 'var(--surface)',
    borderRadius: 'var(--radius) var(--radius) 0 0',
    padding: '20px 16px 48px',
    width: '100%', maxHeight: '88vh',
    overflowY: 'auto',
    animation: 'slideUp 0.28s cubic-bezier(0.32,0.72,0,1)',
  },
  handle: {
    width: 40, height: 4,
    background: 'var(--border2)',
    borderRadius: 2, margin: '0 auto 18px',
  },
  title: { fontSize: 19, fontWeight: 800, marginBottom: 3 },
  sub: { fontSize: 12, color: 'var(--text3)', marginBottom: 18 },
  typeBadge: {
    display: 'inline-flex', alignItems: 'center',
    padding: '3px 10px', borderRadius: 20,
    fontSize: 11, fontWeight: 700,
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 11, fontWeight: 700,
    color: 'var(--accent)',
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    margin: '18px 0 10px',
  },
  ingRow: {
    display: 'grid',
    gridTemplateColumns: '1fr auto auto',
    gap: 8, padding: '8px 0',
    borderBottom: '1px solid var(--border)',
    fontSize: 13, alignItems: 'center',
  },
  ingName: { color: 'var(--text2)' },
  ingQty: { color: 'var(--text3)', fontSize: 12 },
  ingCost: { color: 'var(--accent)', fontWeight: 700 },
  totalBox: {
    background: 'var(--surface2)',
    borderRadius: 'var(--radius-sm)',
    padding: '12px 14px',
    display: 'flex', justifyContent: 'space-between',
    alignItems: 'center', marginTop: 12,
  },
  totalLabel: { color: 'var(--text2)', fontSize: 13 },
  totalVal: { color: 'var(--accent)', fontSize: 20, fontWeight: 800 },
  statGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 8, marginBottom: 14,
  },
  statCard: {
    background: 'var(--surface2)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-sm)',
    padding: '12px',
  },
  statLabel: { fontSize: 10, color: 'var(--text3)', fontWeight: 600, marginBottom: 4 },
  statVal: { fontSize: 16, fontWeight: 700, color: 'var(--text)' },
  closeBtn: {
    width: '100%', padding: 13, marginTop: 18,
    background: 'var(--surface2)', color: 'var(--text)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius)',
    fontSize: 14, fontWeight: 600, cursor: 'pointer',
  },
}

export default function DetailModal({ calc, onClose }) {
  if (!calc) return null

  const isBulk = calc.type === 'bulk'
  const date = new Date(calc.created_at).toLocaleDateString('ka-GE', {
    day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
  })

  const badgeStyle = isBulk
    ? { ...s.typeBadge, background: 'var(--blue-dim)', color: 'var(--blue)', border: '1px solid rgba(74,144,224,0.3)' }
    : { ...s.typeBadge, background: 'var(--green-dim)', color: 'var(--green)', border: '1px solid rgba(74,184,106,0.3)' }

  return (
    <div style={s.overlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={s.sheet}>
        <div style={s.handle} />
        <div style={badgeStyle}>{isBulk ? '🧪 ნახევრადფაბრიკატი' : '🍽️ 1 ულუფა'}</div>
        <div style={s.title}>{calc.name}</div>
        <div style={s.sub}>{calc.category} · {date}</div>

        <div style={s.statGrid}>
          {isBulk && (
            <>
              <div style={s.statCard}>
                <div style={s.statLabel}>ულუფების რაოდ.</div>
                <div style={s.statVal}>{calc.servings} ც</div>
              </div>
              <div style={s.statCard}>
                <div style={s.statLabel}>1 ულუფის ღირებ.</div>
                <div style={{ ...s.statVal, color: 'var(--accent)' }}>
                  ₾ {parseFloat(calc.cost_per_serving || 0).toFixed(2)}
                </div>
              </div>
              {calc.yield_amount && (
                <>
                  <div style={s.statCard}>
                    <div style={s.statLabel}>გამოსავლიანობა</div>
                    <div style={s.statVal}>{calc.yield_amount} {calc.yield_unit}</div>
                  </div>
                  <div style={s.statCard}>
                    <div style={s.statLabel}>1 {calc.yield_unit}-ს ღირებ.</div>
                    <div style={s.statVal}>₾ {parseFloat(calc.cost_per_unit || 0).toFixed(4)}</div>
                  </div>
                </>
              )}
            </>
          )}
          {!isBulk && calc.yield_amount && (
            <div style={{ ...s.statCard, gridColumn: '1/-1' }}>
              <div style={s.statLabel}>ულუფის წონა</div>
              <div style={s.statVal}>{calc.yield_amount} გ</div>
            </div>
          )}
        </div>

        <div style={s.sectionTitle}>ინგრედიენტები</div>
        {(calc.ingredients || []).map((ing, i) => (
          <div key={i} style={{ ...s.ingRow, borderBottom: i === calc.ingredients.length - 1 ? 'none' : '1px solid var(--border)' }}>
            <span style={s.ingName}>{ing.name}</span>
            <span style={s.ingQty}>{ing.qty_g}გ · ₾{ing.price_per_kg}/კგ</span>
            <span style={s.ingCost}>₾{parseFloat(ing.cost).toFixed(2)}</span>
          </div>
        ))}

        <div style={s.totalBox}>
          <span style={s.totalLabel}>სულ ღირებულება</span>
          <span style={s.totalVal}>₾ {parseFloat(calc.total_cost || 0).toFixed(2)}</span>
        </div>

        {calc.note && (
          <>
            <div style={s.sectionTitle}>შენიშვნა</div>
            <div style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.65 }}>{calc.note}</div>
          </>
        )}

        <button style={s.closeBtn} onClick={onClose}>დახურვა</button>
      </div>
    </div>
  )
}

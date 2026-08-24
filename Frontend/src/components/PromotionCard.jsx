import { Phone, X, Sparkles } from 'lucide-react'

export default function PromotionCard({ onCall, onCancelCall, loading, status }) {
  const rows = [
    { label: 'Customer',    value: 'Vikas',                     valueStyle: { color: 'var(--text-primary)', fontWeight: 600 } },
    { label: 'Phone',       value: '+91 9057262630',             valueStyle: { color: '#e00000', fontFamily: 'monospace', fontWeight: 700 } },
    { label: 'Promo Plan',  value: '300 Mbps Ultra Fiber',      valueStyle: { color: 'var(--text-secondary)', fontWeight: 500 } },
    { label: 'Free Perks',  value: '14 OTT Apps Included',      valueStyle: { color: '#059669', fontWeight: 500 } },
    { label: 'Offer Price', value: '₹999 / month',              valueStyle: { color: 'var(--text-primary)', fontWeight: 700 } },
  ]

  return (
    <div className="cg-card overflow-hidden h-fit">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
        <div>
          <p className="forbes-label-red mb-0.5">CAMPAIGN</p>
          <p style={{ fontFamily: "'Source Serif 4', serif", color: 'var(--text-primary)' }} className="font-bold text-base leading-tight">
            Promotion Target Details
          </p>
        </div>
        <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600 border border-purple-300 bg-purple-50 dark:border-purple-500/20 dark:bg-purple-500/5 dark:text-purple-400 px-2.5 py-1 rounded-md flex items-center gap-1.5">
          <Sparkles size={10} />
          Festive Offer
        </span>
      </div>

      {/* Data rows */}
      <div className="px-5 py-4 space-y-0" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
        {rows.map((r, i) => (
          <div key={i} className="flex items-center justify-between py-2.5" style={{ borderBottom: i < rows.length - 1 ? '1px solid var(--border-subtle)' : 'none' }}>
            <span className="text-[11px] font-mono uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>{r.label}</span>
            <span className="text-[12px]" style={r.valueStyle}>{r.value}</span>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="px-5 py-4 flex gap-2.5">
        <button onClick={onCall} disabled={loading} className="btn-primary flex items-center gap-1.5 flex-1 justify-center py-2.5">
          <Phone size={12} />
          {loading ? 'Launching...' : 'Send Promotion Call'}
        </button>
        <button onClick={onCancelCall} className="btn-ghost flex items-center gap-1 px-3 py-2.5">
          <X size={12} />
          Cancel
        </button>
      </div>

      {status && (
        <div className="mx-5 mb-4 px-4 py-2.5 rounded-lg" style={{ background: 'rgba(147,51,234,0.06)', border: '1px solid rgba(147,51,234,0.15)' }}>
          <p className="text-[11px] font-mono text-purple-600 dark:text-purple-400">{status}</p>
        </div>
      )}
    </div>
  )
}

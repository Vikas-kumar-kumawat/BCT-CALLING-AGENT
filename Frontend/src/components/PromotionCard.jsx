import { Phone, X, Sparkles } from 'lucide-react'

export default function PromotionCard({ onCall, onCancelCall, loading, status }) {
  const rows = [
    { label: 'Customer',    value: 'Demo Customer',                   valueStyle: { color: 'var(--text-primary)', fontWeight: 700 } },
    { label: 'Phone',       value: '+91 99999 99999',           valueStyle: { color: 'var(--accent)', fontFamily: 'monospace', fontWeight: 700 } },
    { label: 'Promo Plan',  value: '300 Mbps Ultra Fiber',    valueStyle: { color: 'var(--text-secondary)' } },
    { label: 'Free Perks',  value: '14 OTT Apps Included',    valueStyle: { color: '#4ade80', fontWeight: 600 } },
    { label: 'Offer Price', value: '₹999 / month',            valueStyle: { color: 'var(--text-primary)', fontWeight: 800, fontSize: '14px' } },
  ]
  return (
    <div className="cg-card overflow-hidden h-fit">
      <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
        <div>
          <p className="meta-label mb-0.5" style={{ color: 'var(--accent-light)' }}>Campaign</p>
          <p style={{ fontFamily: 'Inter, sans-serif', color: 'var(--text-primary)', fontWeight: 700, fontSize: '15px' }}>Promotion Target</p>
        </div>
        <span className="flex items-center gap-1.5 text-purple-400 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider"
          style={{ border: '1px solid rgba(168,85,247,0.2)', background: 'rgba(168,85,247,0.08)' }}>
          <Sparkles size={10} /> Festive Offer
        </span>
      </div>
      <div className="px-5 py-3">
        {rows.map((r, i) => (
          <div key={i} className="flex items-center justify-between py-2.5" style={{ borderBottom: i < rows.length - 1 ? '1px solid var(--border-subtle)' : 'none' }}>
            <span style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>{r.label}</span>
            <span style={{ fontSize: '12px', ...r.valueStyle }}>{r.value}</span>
          </div>
        ))}
      </div>
      <div className="px-5 pb-5 flex gap-2.5">
        <button onClick={onCall} disabled={loading} className="btn-primary flex items-center gap-1.5 flex-1 justify-center">
          <Phone size={12} /> {loading ? 'Launching...' : 'Send Promotion Call'}
        </button>
        <button onClick={onCancelCall} className="btn-ghost flex items-center gap-1 px-3">
          <X size={12} /> Cancel
        </button>
      </div>
      {status && (
        <div className="mx-5 mb-5 px-4 py-2.5 rounded-xl" style={{ background: 'rgba(168,85,247,0.06)', border: '1px solid rgba(168,85,247,0.15)' }}>
          <p className="text-[11px] font-mono text-purple-400">{status}</p>
        </div>
      )}
    </div>
  )
}

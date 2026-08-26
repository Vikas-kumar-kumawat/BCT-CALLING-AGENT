import { Phone, X } from 'lucide-react'

export default function RechargeCard({ onCall, onCancelCall, loading, status }) {
  const rows = [
    { label: 'Customer',       value: 'Vikas',             valueStyle: { color: 'var(--text-primary)', fontWeight: 700 } },
    { label: 'Phone',          value: '+91 9057262630',     valueStyle: { color: 'var(--accent)', fontFamily: 'monospace', fontWeight: 700 } },
    { label: 'Current Plan',   value: '100 Mbps Unlimited', valueStyle: { color: 'var(--text-secondary)' } },
    { label: 'Renewal Amount', value: '₹799',              valueStyle: { color: 'var(--text-primary)', fontWeight: 800, fontSize: '14px' } },
  ]
  return (
    <div className="cg-card overflow-hidden h-fit">
      <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
        <div>
          <p className="forbes-label-red mb-0.5">Account Expiry</p>
          <p style={{ fontFamily: 'Manrope, sans-serif', color: 'var(--text-primary)', fontWeight: 700, fontSize: '15px' }}>Expiring Account</p>
        </div>
        <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider"
          style={{ color: '#f5a623', border: '1px solid rgba(245,166,35,0.2)', background: 'rgba(245,166,35,0.08)' }}>
          Expires Tomorrow
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
          <Phone size={12} /> {loading ? 'Initiating...' : 'Send Reminder Call'}
        </button>
        <button onClick={onCancelCall} className="btn-ghost flex items-center gap-1 px-3">
          <X size={12} /> Cancel
        </button>
      </div>
      {status && (
        <div className="mx-5 mb-5 px-4 py-2.5 rounded-xl" style={{ background: 'rgba(245,166,35,0.06)', border: '1px solid rgba(245,166,35,0.15)' }}>
          <p className="text-[11px] font-mono" style={{ color: '#f5a623' }}>{status}</p>
        </div>
      )}
    </div>
  )
}

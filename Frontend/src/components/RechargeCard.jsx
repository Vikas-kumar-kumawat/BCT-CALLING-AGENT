import { Phone, X } from 'lucide-react'

export default function RechargeCard({ onCall, onCancelCall, loading, status }) {
  const rows = [
    { label: 'Customer',       value: 'Vikas',               valueStyle: { color: 'var(--text-primary)', fontWeight: 600 } },
    { label: 'Phone',          value: '+91 9057262630',       valueStyle: { color: '#e00000', fontFamily: 'monospace', fontWeight: 700 } },
    { label: 'Current Plan',   value: '100 Mbps Unlimited',  valueStyle: { color: 'var(--text-secondary)' } },
    { label: 'Renewal Amount', value: '₹799',                valueStyle: { color: 'var(--text-primary)', fontWeight: 700 } },
  ]

  return (
    <div className="cg-card overflow-hidden h-fit">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
        <div>
          <p className="forbes-label-red mb-0.5">ACCOUNT EXPIRY</p>
          <p style={{ fontFamily: "'Source Serif 4', serif", color: 'var(--text-primary)' }} className="font-bold text-base leading-tight">
            Expiring Account Details
          </p>
        </div>
        <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 border border-amber-300 bg-amber-50 dark:border-amber-500/20 dark:bg-amber-500/5 dark:text-amber-400 px-2.5 py-1 rounded-md">
          Expires Tomorrow
        </span>
      </div>

      {/* Data rows */}
      <div className="px-5 py-4">
        {rows.map((r, i) => (
          <div key={i} className="flex items-center justify-between py-2.5" style={{ borderBottom: i < rows.length - 1 ? '1px solid var(--border-subtle)' : 'none' }}>
            <span className="text-[11px] font-mono uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>{r.label}</span>
            <span className="text-[12px]" style={r.valueStyle}>{r.value}</span>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="px-5 pb-4 flex gap-2.5">
        <button onClick={onCall} disabled={loading} className="btn-primary flex items-center gap-1.5 flex-1 justify-center py-2.5">
          <Phone size={12} />
          {loading ? 'Initiating...' : 'Send Reminder Call'}
        </button>
        <button onClick={onCancelCall} className="btn-ghost flex items-center gap-1 px-3 py-2.5">
          <X size={12} />
          Cancel
        </button>
      </div>

      {status && (
        <div className="mx-5 mb-4 px-4 py-2.5 rounded-lg" style={{ background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.2)' }}>
          <p className="text-[11px] font-mono text-amber-700 dark:text-amber-400">{status}</p>
        </div>
      )}
    </div>
  )
}

import { Phone, X } from 'lucide-react'

export default function CustomerCard({ customerName = 'Customer', onCall, onCancelCall, loading, status, phoneInput, onPhoneChange }) {
  return (
    <div className="cg-card overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
        <div>
          <p className="forbes-label-red mb-0.5">Target Profile</p>
          <p style={{ fontFamily: 'Manrope, sans-serif', color: 'var(--text-primary)', fontWeight: 700, fontSize: '15px' }}>Active Recipient</p>
        </div>
        {status && <span className="text-[10px] font-mono truncate max-w-[150px] sm:max-w-[200px]" style={{ color: 'var(--text-muted)' }}>{status}</span>}
      </div>

      <div className="px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: 'var(--accent)', boxShadow: '0 4px 14px rgba(232,96,46,0.35)' }}>
            <span className="text-white font-black text-sm uppercase">{customerName?.[0] || 'C'}</span>
          </div>
          <span style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: '15px' }} className="truncate">
            {customerName}
          </span>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <input type="tel" value={phoneInput} onChange={e => onPhoneChange(e.target.value)}
            className="cg-input font-mono text-xs text-right flex-1 sm:flex-none sm:w-32"
            style={{ padding: '8px 10px', minWidth: '120px' }} />
          <button onClick={onCall} disabled={loading} className="btn-primary flex items-center gap-1.5 shrink-0">
            <Phone size={12} /> {loading ? 'Dialing...' : 'Call'}
          </button>
          {onCancelCall && (
            <button onClick={onCancelCall} className="btn-ghost flex items-center gap-1 shrink-0">
              <X size={11} /> Cancel
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

import { Phone, X } from 'lucide-react'

export default function CustomerCard({ customerName = 'Customer', onCall, onCancelCall, loading, status, phoneInput, onPhoneChange }) {
  return (
    <div className="cg-card overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3.5" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
        <div>
          <p className="forbes-label-red mb-0.5">TARGET PROFILE</p>
          <p className="font-semibold text-sm" style={{ fontFamily: "'Source Serif 4', serif", color: 'var(--text-primary)' }}>
            Active Recipient
          </p>
        </div>
        {status && (
          <span className="text-[10px] font-mono truncate max-w-[140px] sm:max-w-[180px]" style={{ color: 'var(--text-muted)' }}>{status}</span>
        )}
      </div>

      {/* Body — stacks vertically on very small screens */}
      <div className="px-4 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Name */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-lg bg-[#e00000] flex items-center justify-center shrink-0">
            <span className="text-white font-bold text-sm uppercase">{customerName?.[0] || 'C'}</span>
          </div>
          <span style={{ fontFamily: "'Source Serif 4', serif", color: 'var(--text-primary)', fontWeight: 700, fontSize: '15px' }} className="truncate">
            {customerName}
          </span>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          <input
            type="tel"
            value={phoneInput}
            onChange={e => onPhoneChange(e.target.value)}
            className="cg-input font-mono text-xs text-right flex-1 sm:flex-none sm:w-32"
            style={{ padding: '7px 10px', minWidth: '120px' }}
          />
          <button onClick={onCall} disabled={loading} className="btn-primary flex items-center gap-1.5 shrink-0">
            <Phone size={12} />
            {loading ? 'Dialing...' : 'Call'}
          </button>
          {onCancelCall && (
            <button onClick={onCancelCall} className="btn-ghost flex items-center gap-1 shrink-0">
              <X size={11} />
              Cancel
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

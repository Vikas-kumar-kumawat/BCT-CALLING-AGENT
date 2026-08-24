export default function SupportIVRCard({ activeOption, onSelectOption }) {
  const opts = [
    { key: '1', label: '1 · Complaint' },
    { key: '2', label: '2 · New Conn' },
    { key: '3', label: '3 · Billing' },
    { key: '4', label: '4 · Support' },
  ]
  return (
    <div className="flex items-center gap-2">
      <span className="forbes-label pr-1">DTMF:</span>
      <div className="flex gap-1.5">
        {opts.map(o => (
          <button
            key={o.key}
            onClick={() => onSelectOption(o.key)}
            className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1.5 rounded-md transition-all cursor-pointer"
            style={activeOption === o.key
              ? { background: '#e00000', color: '#fff', border: '1px solid #e00000' }
              : { color: 'var(--text-muted)', border: '1px solid var(--border-subtle)', background: 'transparent' }
            }
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  )
}

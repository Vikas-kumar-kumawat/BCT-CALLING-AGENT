export default function SupportIVRCard({ activeOption, onSelectOption }) {
  const opts = [
    { key: '1', label: 'Complaint' },
    { key: '2', label: 'New Conn'  },
    { key: '3', label: 'Billing'   },
    { key: '4', label: 'Support'   },
  ]
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span style={{ fontSize: '9px', fontWeight: 800, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>DTMF</span>
      <div className="flex gap-1.5 flex-wrap">
        {opts.map(o => (
          <button key={o.key} onClick={() => onSelectOption(o.key)}
            className="transition-all cursor-pointer"
            style={{
              fontSize: '10px', fontWeight: 700, letterSpacing: '0.06em',
              padding: '5px 10px', borderRadius: '8px',
              ...(activeOption === o.key
                ? { background: 'var(--accent)', color: '#fff', border: '1px solid var(--accent)', boxShadow: '0 4px 14px rgba(232,96,46,0.35)' }
                : { background: 'transparent', color: 'var(--text-muted)', border: '1px solid var(--border-subtle)' })
            }}>
            {o.key} · {o.label}
          </button>
        ))}
      </div>
    </div>
  )
}

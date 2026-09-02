export default function MetricCards({ callsCount = 1, feedbackCount = 1 }) {
  const metrics = [
    { label: 'CALLS EXECUTED', value: `${callsCount}`, badge: '+18%' },
    { label: 'FEEDBACKS COLLECTED', value: `${feedbackCount}`, badge: '+12%' },
    { label: 'POSITIVE SENTIMENT', value: '0%', badge: '+8%' },
    { label: 'NEGATIVE SENTIMENT', value: '0%', badge: '-5%' },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
      {metrics.map((m, i) => (
        <div key={i} className="cg-card rounded-2xl p-5 space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-xs font-extrabold uppercase tracking-widest" style={{ color: 'var(--text-secondary)' }}>
              {m.label}
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-md font-bold" style={{ background: 'var(--row-hover)', border: '1px solid var(--border-subtle)', color: 'var(--text-secondary)' }}>
              {m.badge}
            </span>
          </div>
          <div className="text-3xl font-extrabold tracking-tight" style={{ color: 'var(--text-primary)' }}>
            {m.value}
          </div>
        </div>
      ))}
    </div>
  )
}

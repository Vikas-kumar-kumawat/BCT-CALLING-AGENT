import { useState } from 'react'
import { ChevronRight, Mic, Archive, X } from 'lucide-react'

function StatusBadge({ status }) {
  if (status === 'RESOLVED')    return <span className="badge-resolved">{status}</span>
  if (status === 'IN PROGRESS') return <span className="badge-progress">{status}</span>
  return <span className="badge-open">{status}</span>
}

export default function ComplaintsListCard({ complaints = [], onToggleStatus, onAddComplaint }) {
  const [showForm, setShowForm] = useState(false)
  const [selected, setSelected] = useState(null)
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [issue, setIssue] = useState('')
  const [category, setCategory] = useState('Broadband Outage')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!issue) return
    onAddComplaint({ customerName: name || 'Customer', phone: phone || '9000000000', issue, category })
    setName(''); setPhone(''); setIssue('')
    setShowForm(false)
  }

  return (
    <>
      <div className="cg-card flex flex-col min-h-[540px] overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
          <div>
            <p className="forbes-label-red mb-0.5">COMPLAINT CENTER</p>
            <p style={{ fontFamily: "'Source Serif 4', serif", color: 'var(--text-primary)' }} className="font-bold text-lg leading-tight">
              Customer Tickets
              <span className="ml-2 text-sm font-normal" style={{ color: 'var(--text-muted)', fontFamily: "'Inter', sans-serif" }}>
                {complaints.length} active
              </span>
            </p>
          </div>
          <button onClick={() => setShowForm(!showForm)} className={showForm ? 'btn-ghost' : 'btn-primary'}>
            {showForm ? 'Cancel' : '+ Raise Ticket'}
          </button>
        </div>

        {/* Form */}
        {showForm && (
          <form onSubmit={handleSubmit} className="px-6 py-4 space-y-3" style={{ borderBottom: '1px solid var(--border-subtle)', background: 'rgba(0,0,0,0.02)' }}>
            <div className="grid grid-cols-2 gap-3">
              <input className="cg-input" type="text" placeholder="Customer Name" value={name} onChange={e => setName(e.target.value)} />
              <input className="cg-input" type="text" placeholder="Phone Number" value={phone} onChange={e => setPhone(e.target.value)} />
            </div>
            <input className="cg-input" type="text" placeholder="Describe the issue" value={issue} onChange={e => setIssue(e.target.value)} required />
            <div className="flex items-center justify-between">
              <select
                value={category} onChange={e => setCategory(e.target.value)}
                className="cg-input"
                style={{ width: 'auto', padding: '7px 12px' }}
              >
                <option>Broadband Outage</option>
                <option>Speed & Latency</option>
                <option>Plan Change</option>
                <option>Billing Discrepancy</option>
              </select>
              <button type="submit" className="btn-primary">Save Ticket</button>
            </div>
          </form>
        )}

        {/* Column labels */}
        <div className="grid grid-cols-12 px-6 py-2.5" style={{ borderBottom: '1px solid var(--border-subtle)', background: 'rgba(0,0,0,0.02)' }}>
          <span className="col-span-2 forbes-label">Ticket ID</span>
          <span className="col-span-2 forbes-label">Customer</span>
          <span className="col-span-5 forbes-label">Issue</span>
          <span className="col-span-2 forbes-label">Status</span>
          <span className="col-span-1 forbes-label text-right">Act</span>
        </div>

        {/* Rows */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {complaints.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.03)', border: '1px solid var(--border-subtle)' }}>
                <Mic size={16} style={{ color: 'var(--text-muted)' }} />
              </div>
              <p className="text-[10px] uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>No active complaints</p>
            </div>
          ) : complaints.map(item => {
            const isOpen = item.status === 'OPEN'
            const borderColor = isOpen ? '#e00000' : item.status === 'IN PROGRESS' ? '#f59e0b' : '#10b981'
            return (
              <div
                key={item.id}
                onClick={() => setSelected(item)}
                className="grid grid-cols-12 px-6 py-4 items-center cursor-pointer transition-all duration-100"
                style={{
                  borderBottom: '1px solid var(--border-subtle)',
                  borderLeft: `2px solid ${borderColor}`,
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,0,0,0.02)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <div className="col-span-2">
                  <span className="text-[10px] font-mono font-bold" style={{ color: 'var(--text-muted)' }}>{item.id}</span>
                </div>
                <div className="col-span-2">
                  <p className="text-[13px] font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{item.customerName}</p>
                  <p className="text-[10px] font-mono" style={{ color: 'var(--text-muted)' }}>{item.phone}</p>
                </div>
                <div className="col-span-5 pr-4">
                  <p className="text-[12px] leading-snug line-clamp-2" style={{ color: 'var(--text-secondary)' }}>"{item.issue}"</p>
                </div>
                <div className="col-span-2">
                  <StatusBadge status={item.status} />
                </div>
                <div className="col-span-1 flex justify-end" onClick={e => e.stopPropagation()}>
                  <button
                    onClick={() => setSelected(item)}
                    className="p-1.5 rounded-md transition-all cursor-pointer"
                    style={{ color: 'var(--text-muted)' }}
                    onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'}
                    onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
                  >
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Detail Modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6" style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(8px)' }}>
          <div className="cg-card w-full max-w-2xl flex flex-col max-h-[90vh]">

            {/* Modal Header */}
            <div className="flex items-start justify-between px-6 py-5" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
              <div>
                <p className="forbes-label-red mb-1">COMPLAINT DETAIL</p>
                <div className="flex items-center gap-2.5">
                  <span className="text-[11px] font-mono font-bold" style={{ color: 'var(--text-muted)' }}>{selected.id}</span>
                  <h3 style={{ fontFamily: "'Source Serif 4', serif", color: 'var(--text-primary)' }} className="font-bold text-xl leading-tight">
                    {selected.customerName}
                  </h3>
                  <span className="text-[11px] font-mono" style={{ color: 'var(--text-muted)' }}>({selected.phone})</span>
                </div>
                <p className="text-[11px] mt-1" style={{ color: 'var(--text-muted)' }}>
                  {selected.category || 'Broadband Outage'} · {selected.createdAt}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <StatusBadge status={selected.status} />
                <button
                  onClick={() => setSelected(null)}
                  className="p-1.5 rounded-full transition-colors cursor-pointer ml-1"
                  style={{ color: 'var(--text-muted)' }}
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Transcript */}
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4 custom-scrollbar">
              <div className="flex items-center gap-2 mb-4">
                <Archive size={11} style={{ color: 'var(--text-muted)' }} />
                <span className="text-[10px] uppercase tracking-widest font-semibold" style={{ color: 'var(--text-muted)' }}>IVR Session Transcript</span>
              </div>

              {[
                { sender: 'agent',    speaker: 'IVR SYSTEM',    text: 'Welcome to BCT Support. For complaint press 1, for new connection press 2, for billing details press 3, for other support press 4.' },
                { sender: 'customer', speaker: `${selected.customerName} (DTMF)`, text: 'Pressed Key [ 1: Complaint Registration ]' },
                { sender: 'agent',    speaker: 'VOICE AGENT',   text: 'What is your complaint? Please state your issue.' },
                { sender: 'customer', speaker: selected.customerName, text: `"${selected.issue}"` },
                { sender: 'agent',    speaker: 'VOICE AGENT',   text: 'Your complaint is registered and our technical team will reach you as soon as possible.' },
              ].map((msg, i) => {
                const isAgent = msg.sender === 'agent'
                return (
                  <div key={i} className={`flex flex-col ${isAgent ? 'items-start' : 'items-end'}`}>
                    <span className="text-[9px] font-bold uppercase tracking-widest mb-1.5" style={{ color: isAgent ? '#e00000' : 'var(--text-muted)' }}>
                      {msg.speaker}
                    </span>
                    <div
                      className="max-w-[88%] px-4 py-3 rounded-2xl text-xs leading-relaxed"
                      style={isAgent
                        ? { background: 'rgba(224,0,0,0.04)', border: '1px solid rgba(224,0,0,0.12)', borderLeft: '2px solid #e00000', color: 'var(--text-primary)' }
                        : { background: 'rgba(0,0,0,0.03)', border: '1px solid var(--border-subtle)', color: 'var(--text-secondary)' }
                      }
                    >
                      {msg.text}
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 flex items-center justify-between" style={{ borderTop: '1px solid var(--border-subtle)' }}>
              <button
                onClick={() => {
                  onToggleStatus(selected.id)
                  const next = selected.status === 'OPEN' ? 'IN PROGRESS' : selected.status === 'IN PROGRESS' ? 'RESOLVED' : 'OPEN'
                  setSelected({ ...selected, status: next })
                }}
                className="btn-primary"
              >
                {selected.status === 'OPEN' ? 'Mark In Progress' : selected.status === 'IN PROGRESS' ? 'Mark Resolved' : 'Reopen Ticket'}
              </button>
              <button onClick={() => setSelected(null)} className="btn-ghost">Close</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

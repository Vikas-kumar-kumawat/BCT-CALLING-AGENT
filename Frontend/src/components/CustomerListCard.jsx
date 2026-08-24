import { useState, useEffect } from 'react'
import { getApiUrl } from '../api'
import { Phone, Trash2, UserCircle2 } from 'lucide-react'

export default function CustomerListCard({ onCall, onCancelCall, onSelectCustomer, selectedCustomerId, activeCallId, status }) {
  const [customers, setCustomers] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [newName, setNewName] = useState('')
  const [newPhone, setNewPhone] = useState('')
  const [newFeedback, setNewFeedback] = useState('')

  useEffect(() => { fetchCustomers() }, [])

  const fetchCustomers = async () => {
    try {
      const res = await fetch(getApiUrl('/api/customers'))
      if (!res.ok) throw new Error('Failed')
      setCustomers(await res.json())
    } catch (err) { console.error(err) }
    finally { setIsLoading(false) }
  }

  const handleAddSubmit = async (e) => {
    e.preventDefault()
    if (!newName || !newPhone) return
    try {
      await fetch(getApiUrl('/api/customers'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName, phone: newPhone, feedback: newFeedback || 'No feedback yet.' })
      })
      fetchCustomers()
      setShowForm(false)
      setNewName(''); setNewPhone(''); setNewFeedback('')
    } catch (err) { alert('Error: ' + err.message) }
  }

  const handleDelete = async (e, id) => {
    e.stopPropagation()
    if (!confirm('Delete customer?')) return
    try {
      await fetch(getApiUrl(`/api/customers/${id}`), { method: 'DELETE' })
      fetchCustomers()
    } catch (err) { alert('Error: ' + err.message) }
  }

  return (
    <div className="cg-card flex flex-col overflow-hidden" style={{ minHeight: '480px' }}>

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3.5" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
        <div className="min-w-0 mr-3">
          <p className="forbes-label-red mb-0.5">CUSTOMER DIRECTORY</p>
          <p className="font-semibold text-sm truncate" style={{ fontFamily: "'Source Serif 4', serif", color: 'var(--text-primary)' }}>
            Contact List <span className="font-mono font-normal text-xs ml-1" style={{ color: 'var(--text-muted)' }}>{customers.length}</span>
          </p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className={`shrink-0 ${showForm ? 'btn-ghost' : 'btn-primary'}`} style={{ padding: '6px 12px', fontSize: '11px' }}>
          {showForm ? 'Cancel' : '+ Add'}
        </button>
      </div>

      {/* Add form */}
      {showForm && (
        <form onSubmit={handleAddSubmit} className="px-4 py-3 space-y-2.5" style={{ borderBottom: '1px solid var(--border-subtle)', background: 'var(--row-hover)' }}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <input className="cg-input" type="text" placeholder="Full Name" value={newName} onChange={e => setNewName(e.target.value)} required />
            <input className="cg-input" type="tel" placeholder="Phone Number" value={newPhone} onChange={e => setNewPhone(e.target.value)} required />
          </div>
          <input className="cg-input" type="text" placeholder="Feedback note (optional)" value={newFeedback} onChange={e => setNewFeedback(e.target.value)} />
          <div className="flex justify-end">
            <button type="submit" className="btn-primary">Save</button>
          </div>
        </form>
      )}

      {/* Column labels — simplified on mobile */}
      <div className="grid px-4 py-2" style={{ borderBottom: '1px solid var(--border-subtle)', background: 'var(--row-hover)', gridTemplateColumns: '1fr auto' }}>
        <span className="forbes-label">Name / Phone</span>
        <span className="forbes-label">Actions</span>
      </div>

      {/* Rows */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {isLoading ? (
          <div className="flex items-center justify-center py-12 text-xs uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
            Loading...
          </div>
        ) : customers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 gap-2">
            <UserCircle2 size={28} style={{ color: 'var(--border-subtle)' }} />
            <p className="text-xs uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>No customers yet</p>
          </div>
        ) : customers.map(c => {
          const isActive = activeCallId === c.id
          const isSelected = selectedCustomerId === c.id || isActive

          return (
            <div
              key={c.id}
              onClick={() => onSelectCustomer?.(c)}
              className="flex items-center px-4 py-3 cursor-pointer transition-all duration-100 gap-3"
              style={{
                borderBottom: '1px solid var(--border-subtle)',
                borderLeft: `3px solid ${isActive ? '#e00000' : isSelected ? 'var(--text-muted)' : 'transparent'}`,
                background: isActive ? 'rgba(224,0,0,0.04)' : isSelected ? 'var(--row-hover)' : 'transparent',
              }}
            >
              {/* Avatar + info */}
              <div className="flex-1 flex items-center gap-3 min-w-0">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold text-white uppercase"
                  style={{ background: isActive ? '#e00000' : 'var(--text-muted)' }}
                >
                  {c.name?.[0] || '?'}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate" style={{ color: isSelected ? 'var(--text-primary)' : 'var(--text-secondary)' }}>{c.name}</p>
                  <p className="text-[11px] font-mono" style={{ color: 'var(--text-muted)' }}>{c['mobile-number']}</p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1.5 shrink-0" onClick={e => e.stopPropagation()}>
                <button
                  onClick={() => onCall({ ...c, phone: c['mobile-number'] })}
                  disabled={activeCallId && activeCallId !== c.id}
                  className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1.5 rounded-md transition-all cursor-pointer disabled:opacity-25"
                  style={isActive
                    ? { color: '#e00000', border: '1px solid rgba(224,0,0,0.3)', background: 'rgba(224,0,0,0.05)' }
                    : { color: 'var(--text-muted)', border: '1px solid var(--border-subtle)', background: 'transparent' }
                  }
                >
                  <Phone size={10} />
                  <span className="hidden sm:inline">{isActive ? 'Live' : 'Call'}</span>
                </button>
                {isActive && onCancelCall && (
                  <button
                    onClick={() => onCancelCall()}
                    className="text-[10px] font-bold uppercase px-2 py-1.5 rounded-md cursor-pointer"
                    style={{ color: 'var(--text-muted)', border: '1px solid var(--border-subtle)' }}
                  >
                    Stop
                  </button>
                )}
                <button onClick={(e) => handleDelete(e, c.id)} className="p-1.5 rounded-md cursor-pointer hover:text-[#e00000] transition-colors" style={{ color: 'var(--text-muted)' }}>
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

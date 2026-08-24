import { useState, useEffect } from 'react'
import { getApiUrl } from '../api'

export default function CustomerListCard({ onCall, onCancelCall, onSelectCustomer, selectedCustomerId, activeCallId, status }) {
  const [customers, setCustomers] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [newName, setNewName] = useState('')
  const [newPhone, setNewPhone] = useState('')
  const [newFeedback, setNewFeedback] = useState('')

  useEffect(() => {
    fetchCustomers()
  }, [])

  const fetchCustomers = async () => {
    try {
      const res = await fetch(getApiUrl('/api/customers'))
      if (!res.ok) throw new Error('Failed to fetch customers')
      const data = await res.json()
      setCustomers(data)
    } catch (err) {
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddSubmit = async (e) => {
    e.preventDefault()
    if (!newName || !newPhone) return
    
    try {
      const res = await fetch(getApiUrl('/api/customers'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName, phone: newPhone, feedback: newFeedback || 'No feedback yet.' })
      })
      if (!res.ok) throw new Error('Failed to add customer')
      fetchCustomers()
      setShowForm(false)
      setNewName('')
      setNewPhone('')
      setNewFeedback('')
    } catch (err) {
      alert("Error adding customer: " + err.message)
    }
  }

  const handleDeleteCustomer = async (e, id) => {
    e.stopPropagation()
    if (!confirm("Delete customer?")) return
    try {
      const res = await fetch(getApiUrl(`/api/customers/${id}`), { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete customer')
      fetchCustomers()
    } catch (err) {
      alert("Error deleting customer: " + err.message)
    }
  }

  return (
    <div className="bg-[#111215] border border-[#22242b] rounded-2xl p-6 space-y-4 shadow-xl font-sans h-full flex flex-col min-h-[580px]">
      <div className="flex justify-between items-center border-b border-[#1c1e24] pb-3">
        <div className="flex items-center gap-2">
          <h2 className="text-xs font-extrabold uppercase tracking-widest text-zinc-200">Customer Directory</h2>
          <span className="text-[10px] font-mono text-zinc-400 bg-[#17181c] border border-[#262832] px-2.5 py-1 rounded-md font-bold">
            {customers.length} ENTRIES
          </span>
        </div>
        <button 
          onClick={() => setShowForm(!showForm)}
          className={`text-[10px] px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer border ${
            showForm 
              ? 'bg-zinc-800 text-zinc-300 border-zinc-700 hover:bg-zinc-700' 
              : 'bg-white/10 hover:bg-white/20 text-white border-white/20'
          }`}
        >
          {showForm ? 'CANCEL' : '+ ADD NEW'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleAddSubmit} className="p-4 bg-[#17181c] border border-[#262832] rounded-xl space-y-3 text-xs">
          <div className="grid grid-cols-2 gap-2.5">
            <input 
              type="text" 
              placeholder="Name" 
              value={newName} 
              onChange={(e) => setNewName(e.target.value)}
              className="bg-[#111215] border border-[#262832] text-white text-xs px-3 py-2 rounded-lg focus:outline-none focus:border-white"
              required
            />
            <input 
              type="text" 
              placeholder="Phone" 
              value={newPhone} 
              onChange={(e) => setNewPhone(e.target.value)}
              className="bg-[#111215] border border-[#262832] text-white text-xs px-3 py-2 rounded-lg focus:outline-none focus:border-white"
              required
            />
          </div>
          <input 
            type="text" 
            placeholder="Feedback" 
            value={newFeedback} 
            onChange={(e) => setNewFeedback(e.target.value)}
            className="w-full bg-[#111215] border border-[#262832] text-white text-xs px-3 py-2 rounded-lg focus:outline-none focus:border-white"
          />
          <div className="flex justify-end pt-1">
            <button 
              type="submit"
              className="px-4 py-1.5 text-xs font-bold bg-white text-black hover:bg-zinc-200 rounded-lg transition-colors cursor-pointer shadow-md"
            >
              Save
            </button>
          </div>
        </form>
      )}

      {/* High-density, clickable customer list rows in strict B&W */}
      <div className="space-y-2 flex-1 max-h-[520px] overflow-y-auto pr-1.5 custom-scrollbar">
        {isLoading ? (
          <div className="text-zinc-500 text-xs text-center py-10 font-mono">Loading directory...</div>
        ) : customers.length === 0 ? (
          <div className="text-zinc-500 text-xs text-center py-10 font-mono">No customers found</div>
        ) : customers.map((c) => {
          const isSelected = selectedCustomerId === c.id || (activeCallId === c.id)

          return (
            <div 
              key={c.id} 
              onClick={() => onSelectCustomer && onSelectCustomer(c)}
              className={`px-3.5 py-2.5 border rounded-xl transition-all flex items-center justify-between gap-3 cursor-pointer ${
                activeCallId === c.id
                  ? 'border-white bg-[#1c1d22] ring-1 ring-white/40' 
                  : isSelected
                  ? 'border-zinc-500 bg-[#17181c] ring-1 ring-zinc-500/40'
                  : 'bg-[#17181c] border-[#262832] hover:border-zinc-600 hover:bg-[#1c1d22]'
              }`}
            >
              {/* Customer Info Inline */}
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${isSelected ? 'bg-white animate-pulse' : 'bg-zinc-600'}`}></span>
                <span className={`text-xs font-semibold truncate max-w-[120px] sm:max-w-[150px] ${isSelected ? 'text-white font-bold' : 'text-zinc-200'}`}>
                  {c.name}
                </span>
                <span className="text-zinc-500 font-mono text-[11px] shrink-0">{c['mobile-number']}</span>
                {c.feedback && (
                  <span className="text-zinc-300 text-[10px] bg-[#111215] px-2 py-0.5 rounded border border-zinc-800 truncate max-w-[160px] hidden sm:inline-block">
                    {c.feedback}
                  </span>
                )}
              </div>

              {/* Actions Inline */}
              <div className="flex items-center gap-1.5 shrink-0" onClick={(e) => e.stopPropagation()}>
                <button
                  onClick={() => onCall({ ...c, phone: c['mobile-number'] })}
                  disabled={activeCallId && activeCallId !== c.id}
                  className="bg-white hover:bg-zinc-200 text-black font-extrabold py-1 px-3 rounded-lg transition-all text-xs tracking-wide shadow-md active:scale-98 cursor-pointer disabled:opacity-40"
                >
                  {activeCallId === c.id ? 'Calling...' : 'Call'}
                </button>
                {activeCallId === c.id && onCancelCall && (
                  <button
                    onClick={() => onCancelCall()}
                    className="bg-zinc-800 hover:bg-zinc-700 text-white font-semibold py-1 px-2.5 rounded-lg border border-zinc-700 transition-all text-xs cursor-pointer shadow-md"
                  >
                    Stop
                  </button>
                )}
                <button
                  onClick={(e) => handleDeleteCustomer(e, c.id)}
                  title="Delete Customer"
                  className="text-zinc-500 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer text-xs font-bold"
                >
                  ✕
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

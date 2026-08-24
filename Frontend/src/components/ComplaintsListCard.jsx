import { useState } from 'react'

export default function ComplaintsListCard({ complaints = [], onToggleStatus, onAddComplaint }) {
  const [showForm, setShowForm] = useState(false)
  const [selectedTicket, setSelectedTicket] = useState(null)
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [issue, setIssue] = useState('')
  const [category, setCategory] = useState('Broadband Outage')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!issue) return
    onAddComplaint({ customerName: name || 'Vikas', phone: phone || '9057262630', issue, category })
    setName('')
    setPhone('')
    setIssue('')
    setShowForm(false)
  }

  return (
    <div className="bg-[#111215] border border-[#22242b] rounded-2xl p-6 space-y-5 shadow-xl font-sans flex flex-col justify-between relative min-h-[580px]">
      {/* Header */}
      <div className="flex justify-between items-center border-b border-[#1c1e24] pb-4">
        <div className="flex items-center gap-3">
          <h2 className="text-xs font-extrabold uppercase tracking-widest text-zinc-200">
            Customer Complaints
          </h2>
          <span className="text-[10px] font-mono text-zinc-400 bg-[#17181c] border border-[#262832] px-2.5 py-0.5 rounded-md font-bold">
            {complaints.length} TICKETS
          </span>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className={`text-xs px-3.5 py-1.5 rounded-lg font-bold transition-all cursor-pointer border ${
            showForm 
              ? 'bg-zinc-800 text-zinc-300 border-zinc-700 hover:bg-zinc-700' 
              : 'bg-white/10 hover:bg-white/20 text-white border-white/20'
          }`}
        >
          {showForm ? 'CANCEL' : '+ RAISE TICKET'}
        </button>
      </div>

      {/* New Complaint Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="p-4 bg-[#17181c] border border-[#262832] rounded-xl space-y-3 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <input 
              type="text" 
              placeholder="Customer Name" 
              value={name} 
              onChange={(e) => setName(e.target.value)}
              className="bg-[#111215] border border-[#262832] text-white text-xs px-3 py-2 rounded-lg focus:outline-none focus:border-white"
            />
            <input 
              type="text" 
              placeholder="Phone Number" 
              value={phone} 
              onChange={(e) => setPhone(e.target.value)}
              className="bg-[#111215] border border-[#262832] text-white text-xs px-3 py-2 rounded-lg focus:outline-none focus:border-white"
            />
          </div>
          <input 
            type="text" 
            placeholder="Complaint Issue Description" 
            value={issue} 
            onChange={(e) => setIssue(e.target.value)}
            className="w-full bg-[#111215] border border-[#262832] text-white text-xs px-3 py-2 rounded-lg focus:outline-none focus:border-white"
            required
          />
          <div className="flex justify-between items-center pt-1">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="bg-[#111215] border border-[#262832] text-zinc-300 text-xs px-3 py-1.5 rounded-lg focus:outline-none"
            >
              <option value="Broadband Outage">Broadband Outage</option>
              <option value="Speed & Latency">Speed & Latency</option>
              <option value="Plan Change">Plan Change</option>
              <option value="Billing Discrepancy">Billing Discrepancy</option>
            </select>
            <button 
              type="submit"
              className="px-4 py-1.5 text-xs font-bold bg-white text-black hover:bg-zinc-200 rounded-lg transition-colors cursor-pointer shadow-md"
            >
              Save Ticket
            </button>
          </div>
        </form>
      )}

      {/* Ultra-Clean 2-Column Complaints Grid */}
      <div className="flex-1 max-h-[560px] overflow-y-auto pr-1 custom-scrollbar">
        {complaints.length === 0 ? (
          <div className="text-zinc-500 text-xs text-center py-16 font-mono">No active complaints</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {complaints.map((item) => {
              const isResolved = item.status === 'RESOLVED'
              const isInProgress = item.status === 'IN PROGRESS'

              return (
                <div 
                  key={item.id} 
                  onClick={() => setSelectedTicket(item)}
                  className="p-4 border border-[#262832] rounded-xl transition-all space-y-3 bg-[#17181c] flex flex-col justify-between cursor-pointer hover:border-zinc-500 shadow-sm"
                >
                  <div className="space-y-2">
                    {/* Header Row */}
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[11px] font-extrabold text-white bg-black/60 px-2 py-0.5 rounded border border-zinc-700">
                          {item.id}
                        </span>
                        <span className="text-xs font-bold text-white truncate max-w-[130px]">
                          {item.customerName}
                        </span>
                      </div>

                      <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${
                        isResolved 
                          ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' 
                          : isInProgress 
                          ? 'text-amber-400 bg-amber-500/10 border-amber-500/20' 
                          : 'text-rose-400 bg-rose-500/10 border-rose-500/20'
                      }`}>
                        {item.status}
                      </span>
                    </div>

                    {/* Issue Description */}
                    <p className="text-xs text-zinc-300 leading-relaxed font-sans min-h-[36px]">
                      "{item.issue}"
                    </p>
                  </div>

                  {/* Footer Info */}
                  <div className="pt-2 border-t border-[#22242b] flex items-center justify-between gap-2 text-[10px] font-mono text-zinc-400">
                    <span>Phone: <strong className="text-white">{item.phone}</strong></span>
                    <span className="text-zinc-400 hover:text-white font-bold transition-colors">Details →</span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Clean Complaint Detail Modal */}
      {selectedTicket && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#111215] border border-[#22242b] rounded-2xl max-w-2xl w-full p-6 space-y-4 shadow-2xl font-sans">
            {/* Modal Header */}
            <div className="flex justify-between items-center border-b border-[#1c1e24] pb-3">
              <div className="flex items-center gap-2.5">
                <span className="font-mono text-xs font-extrabold text-white bg-black/60 px-2.5 py-0.5 rounded border border-zinc-700">
                  {selectedTicket.id}
                </span>
                <h3 className="text-sm font-extrabold text-white">
                  {selectedTicket.customerName}
                </h3>
                <span className="text-xs font-mono text-zinc-400">
                  ({selectedTicket.phone})
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded border ${
                  selectedTicket.status === 'RESOLVED' 
                    ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' 
                    : selectedTicket.status === 'IN PROGRESS' 
                    ? 'text-amber-400 bg-amber-500/10 border-amber-500/20' 
                    : 'text-rose-400 bg-rose-500/10 border-rose-500/20'
                }`}>
                  {selectedTicket.status}
                </span>
                <button
                  onClick={() => setSelectedTicket(null)}
                  className="text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-zinc-800 transition-colors text-sm font-bold cursor-pointer"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Conversation Log Transcript */}
            <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1.5 custom-scrollbar text-xs">
              {/* Step 1: Greeting */}
              <div className="flex flex-col items-start space-y-1">
                <div className="text-[10px] font-mono text-zinc-400">VOICE AGENT • {selectedTicket.createdAt}</div>
                <div className="bg-[#17181c] text-zinc-100 border border-[#262832] p-3 rounded-xl max-w-[90%] leading-relaxed">
                  Welcome to BCT Support. For complaint press 1, for new connection press 2, for billing details press 3, for other support press 4.
                </div>
              </div>

              {/* Step 2: Customer Key Press */}
              <div className="flex flex-col items-end space-y-1">
                <div className="text-[10px] font-mono text-zinc-400">{selectedTicket.customerName} (DTMF)</div>
                <div className="bg-[#22242b] text-zinc-100 border border-[#323642] p-2.5 rounded-xl max-w-[85%] font-mono">
                  Pressed Key [ 1: Broadband Complaint ]
                </div>
              </div>

              {/* Step 3: Agent Prompt */}
              <div className="flex flex-col items-start space-y-1">
                <div className="text-[10px] font-mono text-zinc-400">VOICE AGENT</div>
                <div className="bg-[#17181c] text-zinc-100 border border-[#262832] p-3 rounded-xl max-w-[90%] leading-relaxed">
                  What is your complaint? Please state your issue.
                </div>
              </div>

              {/* Step 4: Customer Voice Speech */}
              <div className="flex flex-col items-end space-y-1">
                <div className="text-[10px] font-mono text-zinc-400">{selectedTicket.customerName}</div>
                <div className="bg-[#22242b] text-zinc-100 border border-[#323642] p-3 rounded-xl max-w-[90%] leading-relaxed">
                  "{selectedTicket.issue}"
                </div>
              </div>

              {/* Step 5: Resolution */}
              <div className="flex flex-col items-start space-y-1">
                <div className="text-[10px] font-mono text-zinc-400">VOICE AGENT</div>
                <div className="bg-[#17181c] text-zinc-100 border border-[#262832] p-3 rounded-xl max-w-[90%] leading-relaxed">
                  Thank you. We recorded your complaint. Complaint ticket #{selectedTicket.id} has been raised. Your issue will be solved within 2 hours.
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="pt-3 border-t border-[#1c1e24] flex justify-between items-center">
              <button
                onClick={() => {
                  onToggleStatus(selectedTicket.id)
                  const updatedStatus = selectedTicket.status === 'OPEN' ? 'IN PROGRESS' : selectedTicket.status === 'IN PROGRESS' ? 'RESOLVED' : 'OPEN'
                  setSelectedTicket({ ...selectedTicket, status: updatedStatus })
                }}
                className="px-4 py-2 bg-white text-black hover:bg-zinc-200 text-xs font-extrabold rounded-xl transition-all cursor-pointer shadow-md"
              >
                Change Status ({selectedTicket.status === 'OPEN' ? 'IN PROGRESS' : selectedTicket.status === 'IN PROGRESS' ? 'RESOLVED' : 'OPEN'})
              </button>

              <button
                onClick={() => setSelectedTicket(null)}
                className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-bold rounded-xl border border-zinc-700 transition-all cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

import { useState } from 'react'
import ConversationStream from './components/ConversationStream'
import { useConversation } from './hooks/useConversation'
import { getApiUrl } from './api'

export default function PlanPromotion() {
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState('')
  const { logs, displayedTextMap, fetchLogs } = useConversation('/api/promotion/logs')

  const handleCall = async () => {
    setLoading(true)
    setStatus('')
    try {
      const res = await fetch(getApiUrl('/api/promotion'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Vikas',
          phone: '9057262630',
          promoPlan: '300 Mbps Ultra Fiber + 14 Free OTT Apps (₹999/mo)'
        })
      })
      const data = await res.json()
      setStatus(res.ok ? data.message || 'Promotion call initiated!' : `Call failed: ${data.message}`)
      if (res.ok) fetchLogs()
    } catch (err) {
      setStatus(`Error: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  const handleCancelCall = async () => {
    try {
      await fetch(getApiUrl('/api/promotion/cancel'), { method: 'POST' })
      setStatus('Call cancelled by agent.')
      fetchLogs()
    } catch (err) {
      setStatus('Call session ended.')
    }
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-extrabold text-white tracking-tight">Plan Promotion Campaign</h1>
        <p className="text-xs text-zinc-400 mt-1">Outbound high-speed fiber upgrade & OTT bundle calls.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-[#111215] border border-[#22242b] rounded-2xl p-6 space-y-4 shadow-xl font-sans h-fit">
          <div className="flex justify-between items-center border-b border-[#1c1e24] pb-3">
            <h2 className="text-xs font-extrabold uppercase tracking-widest text-zinc-300">Campaign Target Details</h2>
            <span className="text-[10px] font-mono bg-[#17181c] border border-[#262832] text-purple-400 px-2 py-0.5 rounded-md font-bold">
              FESTIVE OFFER
            </span>
          </div>

          <div className="space-y-2.5 text-xs text-zinc-400">
            <div className="flex justify-between py-1 border-b border-[#1c1e24]/60">
              <span className="text-zinc-500 font-mono">Customer:</span>
              <span className="text-white font-semibold">Vikas</span>
            </div>
            <div className="flex justify-between py-1 border-b border-[#1c1e24]/60">
              <span className="text-zinc-500 font-mono">Phone:</span>
              <span className="text-purple-400 font-mono font-bold">+91 9057262630</span>
            </div>
            <div className="flex justify-between py-1 border-b border-[#1c1e24]/60">
              <span className="text-zinc-500 font-mono">Promo Plan:</span>
              <span className="text-purple-300 font-semibold">300 Mbps Ultra Fiber</span>
            </div>
            <div className="flex justify-between py-1 border-b border-[#1c1e24]/60">
              <span className="text-zinc-500 font-mono">Free Perks:</span>
              <span className="text-emerald-400">14 Free OTT Apps</span>
            </div>
            <div className="flex justify-between py-1 border-b border-[#1c1e24]/60">
              <span className="text-zinc-500 font-mono">Offer Price:</span>
              <span className="text-white font-bold">₹999 / month</span>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleCall}
              disabled={loading}
              className="flex-1 bg-white hover:bg-zinc-200 text-black font-semibold py-3 px-4 rounded-xl transition-all text-xs tracking-wide shadow-md active:scale-98 cursor-pointer disabled:opacity-50"
            >
              {loading ? 'Launching...' : 'Send Promotion Call'}
            </button>
            <button
              onClick={handleCancelCall}
              className="bg-rose-600/90 hover:bg-rose-600 text-white font-semibold py-3 px-4 rounded-xl transition-all text-xs tracking-wide shadow-md active:scale-98 cursor-pointer"
            >
              Cancel Call
            </button>
          </div>

          {status && (
            <div className="p-3 bg-[#17181c] border border-[#262832] rounded-xl text-xs font-mono text-purple-400">
              {status}
            </div>
          )}
        </div>

        <ConversationStream logs={logs} displayedTextMap={displayedTextMap} />
      </div>
    </div>
  )
}

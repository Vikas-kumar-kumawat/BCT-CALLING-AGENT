import { useState } from 'react'
import ConversationStream from './components/ConversationStream'
import { useConversation } from './hooks/useConversation'
import { getApiUrl } from './api'

export default function InboundCalls() {
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState('')
  const { logs, displayedTextMap, fetchLogs } = useConversation('/api/support/logs')

  const handleSimulateInbound = async () => {
    setLoading(true)
    setStatus('')
    try {
      const res = await fetch(getApiUrl('/api/support'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Vikas', phone: '9057262630' })
      })
      const data = await res.json()
      setStatus(res.ok ? data.message || 'Support call initiated!' : `Call failed: ${data.message}`)
      if (res.ok) fetchLogs()
    } catch (err) {
      setStatus(`Error: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  const handleCancelCall = async () => {
    try {
      await fetch(getApiUrl('/api/support/cancel'), { method: 'POST' })
      setStatus('Call cancelled by agent.')
      fetchLogs()
    } catch (err) {
      setStatus('Call session ended.')
    }
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-extrabold text-white tracking-tight">BCT Support IVR</h1>
        <p className="text-xs text-zinc-400 mt-1">Simulated inbound automated helpline.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-[#111215] border border-[#22242b] rounded-2xl p-6 space-y-4 shadow-xl font-sans h-fit">
          <div className="flex justify-between items-center border-b border-[#1c1e24] pb-3">
            <h2 className="text-xs font-extrabold uppercase tracking-widest text-zinc-300">Support Config</h2>
            <span className="text-[10px] font-mono bg-[#17181c] border border-[#262832] text-cyan-400 px-2 py-0.5 rounded-md font-bold">
              SIMULATED HOTLINE
            </span>
          </div>

          <div className="space-y-2.5 text-xs text-zinc-400">
            <div className="flex justify-between py-1 border-b border-[#1c1e24]/60">
              <span className="text-zinc-500 font-mono">Greeting:</span>
              <span className="text-cyan-400 font-medium">"Welcome to BCT Support"</span>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleSimulateInbound}
              disabled={loading}
              className="flex-1 bg-white hover:bg-zinc-200 text-black font-semibold py-3 px-4 rounded-xl transition-all text-xs tracking-wide shadow-md active:scale-98 cursor-pointer disabled:opacity-50"
            >
              {loading ? 'Connecting...' : 'Test Support Greeting'}
            </button>
            <button
              onClick={handleCancelCall}
              className="bg-rose-600/90 hover:bg-rose-600 text-white font-semibold py-3 px-4 rounded-xl transition-all text-xs tracking-wide shadow-md active:scale-98 cursor-pointer"
            >
              Cancel Call
            </button>
          </div>

          {status && (
            <div className="p-3 bg-[#17181c] border border-[#262832] rounded-xl text-xs font-mono text-cyan-400">
              {status}
            </div>
          )}
        </div>

        <ConversationStream logs={logs} displayedTextMap={displayedTextMap} />
      </div>
    </div>
  )
}

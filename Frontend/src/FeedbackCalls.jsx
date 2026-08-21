import { useState } from 'react'
import CustomerCard from './components/CustomerCard'
import ConversationStream from './components/ConversationStream'
import { useConversation } from './hooks/useConversation'
import { getApiUrl } from './api'

export default function FeedbackCalls() {
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState('')
  const { logs, displayedTextMap, fetchLogs } = useConversation('/api/feedbackcalls/logs')

  const handleCall = async () => {
    setLoading(true)
    setStatus('')
    try {
      const res = await fetch(getApiUrl('/api/feedbackcalls'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Vikas', phone: '9057262630' })
      })
      const data = await res.json()
      setStatus(res.ok ? data.message || 'Call initiated!' : `Call failed: ${data.message}`)
      if (res.ok) fetchLogs()
    } catch (err) {
      setStatus(`Error: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  const handleCancelCall = async () => {
    try {
      const res = await fetch(getApiUrl('/api/feedbackcalls/cancel'), { method: 'POST' })
      const data = await res.json()
      setStatus('Call cancelled by agent.')
      fetchLogs()
    } catch (err) {
      setStatus('Call session ended.')
    }
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-extrabold text-white tracking-tight">Customer Feedback Agent</h1>
        <p className="text-xs text-zinc-400 mt-1">Automated customer satisfaction calls & speech analysis.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <CustomerCard onCall={handleCall} onCancelCall={handleCancelCall} loading={loading} status={status} />
        <ConversationStream logs={logs} displayedTextMap={displayedTextMap} />
      </div>
    </div>
  )
}

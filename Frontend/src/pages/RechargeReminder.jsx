import { useState } from 'react'
import RechargeCard from '../components/RechargeCard'
import ConversationStream from '../components/ConversationStream'
import { useConversation } from '../hooks/useConversation'
import { getApiUrl } from '../api'

export default function RechargeReminder() {
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState('')
  const { logs, displayedTextMap, fetchLogs } = useConversation('/api/rechargereminder/logs')

  const handleCall = async () => {
    setLoading(true)
    setStatus('')
    try {
      const res = await fetch(getApiUrl('/api/rechargereminder'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Vikas',
          phone: '9057262630',
          plan: '100 Mbps Unlimited (₹799)'
        })
      })
      const data = await res.json()
      setStatus(res.ok ? data.message || 'Recharge reminder call initiated!' : `Call failed: ${data.message}`)
      if (res.ok) fetchLogs()
    } catch (err) {
      setStatus(`Error: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  const handleCancelCall = async () => {
    try {
      await fetch(getApiUrl('/api/rechargereminder/cancel'), { method: 'POST' })
      setStatus('Call cancelled by agent.')
      fetchLogs()
    } catch (err) {
      setStatus('Call session ended.')
    }
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-extrabold text-white tracking-tight">Recharge Reminder Bot</h1>
        <p className="text-xs text-zinc-400 mt-1">Automated broadband plan expiry & payment link calls.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <RechargeCard 
          onCall={handleCall}
          onCancelCall={handleCancelCall}
          loading={loading}
          status={status}
        />
        <ConversationStream logs={logs} displayedTextMap={displayedTextMap} />
      </div>
    </div>
  )
}

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
      <div className="pb-4" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
        <h1 style={{ fontFamily: "'Source Serif 4', serif", color: 'var(--text-primary)' }} className="text-3xl font-bold tracking-tight">
          Recharge Reminder
        </h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
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

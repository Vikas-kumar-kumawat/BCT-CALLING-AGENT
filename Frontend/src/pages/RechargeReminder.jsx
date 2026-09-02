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
          name: 'Demo Customer',
          phone: '+919999999999',
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
      <div style={{ marginBottom: '32px' }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: '6px',
          marginBottom: '12px',
          fontSize: '12px', color: 'var(--text-muted)', fontFamily: 'Inter, sans-serif',
        }}>
          <span>BCT Fibernet</span>
          <span>/</span>
          <span>Outbound Campaigns</span>
          <span>/</span>
          <span style={{ color: 'var(--text-secondary)' }}>Recharge Reminder</span>
        </div>
        <h1 style={{
          fontFamily: 'Inter, sans-serif',
          fontSize: 'clamp(26px, 4vw, 34px)',
          fontWeight: 800,
          letterSpacing: '-0.03em',
          color: 'var(--text-primary)',
          lineHeight: 1.2,
        }}>
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

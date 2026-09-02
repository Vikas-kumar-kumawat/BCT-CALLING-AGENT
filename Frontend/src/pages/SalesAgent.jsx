import { useState } from 'react'
import CustomerCard from '../components/CustomerCard'
import ConversationStream from '../components/ConversationStream'
import { useConversation } from '../hooks/useConversation'
import { getApiUrl } from '../api'

export default function SalesAgent() {
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState('')
  const [phone, setPhone] = useState('9057262630')
  const { logs, displayedTextMap, fetchLogs } = useConversation('/api/salesagent/logs')

  const handleCall = async () => {
    setLoading(true)
    setStatus('')
    try {
      const res = await fetch(getApiUrl('/api/salesagent'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Prospect Customer', phone: phone })
      })
      const data = await res.json()
      setStatus(res.ok ? data.message || 'Sales outbound call initiated!' : `Call failed: ${data.message}`)
      if (res.ok) fetchLogs()
    } catch (err) {
      setStatus(`Error: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  const handleCancelCall = async () => {
    setStatus('Sales call ended by agent.')
    fetchLogs()
  }

  return (
    <div className="max-w-5xl mx-auto">
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
          <span style={{ color: 'var(--text-secondary)' }}>Sales Agent</span>
        </div>
        <h1 style={{
          fontFamily: 'Inter, sans-serif',
          fontSize: 'clamp(26px, 4vw, 34px)',
          fontWeight: 800,
          letterSpacing: '-0.03em',
          color: 'var(--text-primary)',
          lineHeight: 1.2,
        }}>
          Sales Agent
        </h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <CustomerCard 
          onCall={handleCall} 
          onCancelCall={handleCancelCall} 
          loading={loading} 
          status={status} 
          phoneInput={phone}
          onPhoneChange={setPhone}
        />
        <ConversationStream logs={logs} displayedTextMap={displayedTextMap} />
      </div>
    </div>
  )
}

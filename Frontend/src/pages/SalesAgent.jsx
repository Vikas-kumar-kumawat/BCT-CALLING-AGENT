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
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-extrabold text-white tracking-tight">Sales Agent</h1>
        <p className="text-xs text-zinc-400 mt-1">Outbound sales outreach & broadband upgrade pitches.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

import { useState, useEffect } from 'react'
import SupportIVRCard from '../components/SupportIVRCard'
import SupportStatsBar from '../components/SupportStatsBar'
import ComplaintsListCard from '../components/ComplaintsListCard'
import { getApiUrl } from '../api'

export default function InboundCalls() {
  const [activeOption, setActiveOption] = useState(null)
  const [complaints, setComplaints] = useState([])
  const [stats, setStats] = useState({ totalCalls: 24, openComplaints: 2, inProgressComplaints: 1, resolvedComplaints: 1 })

  useEffect(() => { fetchComplaints() }, [])

  const fetchComplaints = async () => {
    try {
      const res = await fetch(getApiUrl('/api/support/complaints'))
      if (!res.ok) throw new Error('Failed')
      const data = await res.json()
      if (data.complaints) setComplaints(data.complaints)
      if (data.stats) setStats(data.stats)
    } catch (err) { console.error(err) }
  }

  const handleSelectOption = async (optionKey) => {
    setActiveOption(optionKey)
    try {
      const selectedVoice = localStorage.getItem('swarvam-voice')
      const res = await fetch(getApiUrl('/api/support/option'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ option: optionKey, name: 'Demo Customer', phone: '+919999999999', voice: selectedVoice })
      })
      if (res.ok) fetchComplaints()
    } catch (err) { console.error(err) }
  }

  const handleToggleStatus = async (id) => {
    try {
      const res = await fetch(getApiUrl(`/api/support/complaints/${id}/status`), { method: 'PUT' })
      if (res.ok) fetchComplaints()
    } catch (err) { console.error(err) }
  }

  const handleAddComplaint = async (newComplaint) => {
    try {
      const selectedVoice = localStorage.getItem('swarvam-voice')
      const payload = Object.assign({}, newComplaint, { voice: selectedVoice })
      const res = await fetch(getApiUrl('/api/support/complaints'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      if (res.ok) fetchComplaints()
    } catch (err) { console.error(err) }
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">

      {/* Header */}
      <div className="pb-5 flex items-start justify-between flex-wrap gap-4" style={{ borderBottom: '1px solid var(--border-subtle)', marginBottom: '32px' }}>
        <div style={{ marginBottom: '0' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            marginBottom: '12px',
            fontSize: '12px', color: 'var(--text-muted)', fontFamily: 'Inter, sans-serif',
          }}>
            <span>BCT Fibernet</span>
            <span>/</span>
            <span>Inbound System</span>
            <span>/</span>
            <span style={{ color: 'var(--text-secondary)' }}>Customer Support</span>
          </div>
          <h1 style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: 'clamp(26px, 4vw, 34px)',
            fontWeight: 800,
            letterSpacing: '-0.03em',
            color: 'var(--text-primary)',
            lineHeight: 1.2,
          }}>
            Customer Support
          </h1>
        </div>
        <SupportIVRCard activeOption={activeOption} onSelectOption={handleSelectOption} />
      </div>

      <SupportStatsBar stats={stats} />

      <ComplaintsListCard
        complaints={complaints}
        onToggleStatus={handleToggleStatus}
        onAddComplaint={handleAddComplaint}
      />
    </div>
  )
}

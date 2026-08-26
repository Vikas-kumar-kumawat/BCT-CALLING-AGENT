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
      const res = await fetch(getApiUrl('/api/support/option'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ option: optionKey, name: 'Vikas', phone: '9057262630' })
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
      const res = await fetch(getApiUrl('/api/support/complaints'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newComplaint)
      })
      if (res.ok) fetchComplaints()
    } catch (err) { console.error(err) }
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">

      {/* Header */}
      <div className="pb-5 flex items-start justify-between flex-wrap gap-4" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
        <div className="space-y-1">
          <p style={{ fontSize: '10px', fontWeight: 800, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--accent)' }}>Inbound IVR</p>
          <h1 style={{ fontFamily: 'Manrope, sans-serif', color: 'var(--text-primary)', fontSize: 'clamp(22px, 4vw, 32px)', fontWeight: 900, letterSpacing: '-0.03em' }}>Customer Support</h1>
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

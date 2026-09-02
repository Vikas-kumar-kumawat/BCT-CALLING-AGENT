import { useState, useEffect } from 'react'
import { getApiUrl } from '../api'

const VOICES = [
  { id: 'rajasthani_male', name: 'Ratan Singh (Rajasthani Male)' },
  { id: 'marwadi_male', name: 'Kishore (Marwadi Male)' },
  { id: 'hindi_female', name: 'Aditi (Hindi Female)' },
  { id: 'neutral_male', name: 'Swaram Neutral (Male)' },
  { id: 'neutral_female', name: 'Swaram Neutral (Female)' }
]

export default function VoicePersonaSelector() {
  const [playing, setPlaying] = useState(false)
  const [selected, setSelected] = useState(() => localStorage.getItem('swarvam-voice') || VOICES[0].id)

  useEffect(() => { localStorage.setItem('swarvam-voice', selected) }, [selected])

  const handlePlaySample = async (voiceId) => {
    setPlaying(true)
    try {
      const res = await fetch(getApiUrl('/api/tts/sample'), {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: 'Namaste. This is a voice sample.', voiceId })
      })
      const data = await res.json()
      if (res.ok && data.url) {
        const audio = new Audio(data.url)
        audio.play().catch(() => {})
        audio.onended = () => setPlaying(false)
      } else {
        setPlaying(false)
      }
    } catch (e) { setPlaying(false) }
  }

  return (
    <div className="cg-card p-5 flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <p className="meta-label" style={{ margin: 0, color: 'var(--text-muted)' }}>Voice</p>
          <p style={{ margin: '6px 0 0', fontFamily: 'Inter, sans-serif', fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)' }}>
            Select a simple voice profile
          </p>
        </div>
        <button
          onClick={() => handlePlaySample(selected)}
          className="btn-ghost"
          disabled={playing}
          style={{ minWidth: '110px' }}
        >
          {playing ? 'Playing...' : 'Play sample'}
        </button>
      </div>

      <div style={{ display: 'grid', gap: '10px' }}>
        <label style={{ display: 'grid', gap: '6px' }}>
          <span style={{ fontSize: '11px', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
            Voice profile
          </span>
          <select
            value={selected}
            onChange={e => setSelected(e.target.value)}
            className="cg-input"
            style={{ appearance: 'none' }}
          >
            {VOICES.map(v => (
              <option key={v.id} value={v.id}>{v.name}</option>
            ))}
          </select>
        </label>

        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
          Current profile: {VOICES.find(v => v.id === selected)?.name}
        </div>
      </div>
    </div>
  )
}

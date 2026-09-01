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
    <div className="bg-[#111215] border border-[#22242b] rounded-2xl p-5 flex flex-col gap-4 shadow-xl">
      <div className="flex items-center gap-3">
        <div className="bg-[#17181c] border border-[#262832] p-2.5 rounded-xl text-zinc-200">🎙️</div>
        <div className="flex flex-col">
          <span className="text-xs font-extrabold uppercase tracking-widest text-zinc-300">Voice Persona Models</span>
          <span className="text-[10px] font-mono bg-[#17181c] border border-[#262832] text-zinc-400 px-2 py-0.5 rounded-md font-bold">Swarvam</span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-2">
        {VOICES.map(v => (
          <div key={v.id} className="flex items-center justify-between p-3 bg-[#0b0b0c] rounded-lg border border-[#1f2024]">
            <div>
              <div className="font-semibold text-sm">{v.name}</div>
              <div className="text-xs text-zinc-400">{v.id}</div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => handlePlaySample(v.id)}
                className="bg-white hover:bg-zinc-200 text-black text-xs px-3 py-1.5 rounded-md">
                {playing ? 'Playing...' : 'Demo'}
              </button>
              <input type="radio" name="voice" checked={selected === v.id}
                onChange={() => setSelected(v.id)} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

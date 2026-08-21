import { useState } from 'react'

export default function VoicePersonaSelector() {
  const [playing, setPlaying] = useState(false)

  const handlePlaySample = () => {
    setPlaying(true)
    const audio = new Audio('https://files.catbox.moe/wjlx8c.mp3')
    audio.play().catch(() => {})
    audio.onended = () => setPlaying(false)
  }

  return (
    <div className="bg-[#111215] border border-[#22242b] rounded-2xl p-5 flex flex-col md:flex-row items-center justify-between gap-4 shadow-xl">
      <div className="flex items-center gap-3">
        <div className="bg-[#17181c] border border-[#262832] p-2.5 rounded-xl text-zinc-200">
          🎙️
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-extrabold uppercase tracking-widest text-zinc-300">
            Voice Persona Model
          </span>
          <span className="text-[10px] font-mono bg-[#17181c] border border-[#262832] text-zinc-400 px-2 py-0.5 rounded-md font-bold">
            TTS.V2
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2.5 w-full md:w-auto">
        <select className="bg-[#17181c] text-zinc-200 border border-[#262832] rounded-xl text-xs px-3.5 py-2.5 focus:outline-none cursor-pointer font-medium">
          <option>Ratan Singh (Rajasthani & Marwari Male)</option>
          <option>Polly Aditi (Hindi Female)</option>
          <option>Sarvam AI Neural (Hindi)</option>
        </select>

        <button
          onClick={handlePlaySample}
          className="bg-white hover:bg-zinc-200 text-black font-semibold text-xs px-4 py-2.5 rounded-xl transition-all shadow-md active:scale-98 cursor-pointer shrink-0"
        >
          {playing ? 'Playing Sample...' : 'Voice Sample'}
        </button>
      </div>
    </div>
  )
}

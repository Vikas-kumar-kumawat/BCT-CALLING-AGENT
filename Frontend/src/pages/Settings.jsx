import VoicePersonaSelector from '../components/VoicePersonaSelector'

export default function Settings() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="space-y-1 pb-3" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
        <p style={{ fontSize: '10px', fontWeight: 800, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--accent)' }}>Settings</p>
        <h1 style={{ fontFamily: 'Manrope, sans-serif', color: 'var(--text-primary)', fontSize: '20px', fontWeight: 800 }}>Voice Settings</h1>
      </div>

      <div className="grid grid-cols-1 gap-4">
        <VoicePersonaSelector />
      </div>
    </div>
  )
}

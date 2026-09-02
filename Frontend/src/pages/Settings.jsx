import VoicePersonaSelector from '../components/VoicePersonaSelector'

export default function Settings() {
  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <section className="cg-card px-5 py-4">
        <p className="meta-label" style={{ margin: 0, color: 'var(--text-muted)' }}>Settings</p>
        <h1 style={{
          margin: '6px 0 0',
          fontFamily: 'Inter, sans-serif',
          fontSize: '22px',
          fontWeight: 700,
          letterSpacing: '-0.03em',
          color: 'var(--text-primary)',
          lineHeight: 1.2,
        }}>
          Voice profile
        </h1>
      </section>

      <div>
        <VoicePersonaSelector />
      </div>
    </div>
  )
}

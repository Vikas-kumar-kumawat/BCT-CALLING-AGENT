import VoicePersonaSelector from '../components/VoicePersonaSelector'

export default function Settings() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div style={{ marginBottom: '32px' }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: '6px',
          marginBottom: '12px',
          fontSize: '12px', color: 'var(--text-muted)', fontFamily: 'Inter, sans-serif',
        }}>
          <span>BCT Fibernet</span>
          <span>/</span>
          <span>System</span>
          <span>/</span>
          <span style={{ color: 'var(--text-secondary)' }}>Voice Settings</span>
        </div>
        <h1 style={{
          fontFamily: 'Inter, sans-serif',
          fontSize: '24px',
          fontWeight: 800,
          letterSpacing: '-0.02em',
          color: 'var(--text-primary)',
          lineHeight: 1.2,
        }}>
          Voice Settings
        </h1>
      </div>

      <div className="grid grid-cols-1 gap-4">
        <VoicePersonaSelector />
      </div>
    </div>
  )
}

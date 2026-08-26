const path = require('path')
const { spawn } = require('child_process')

let cloudflared = null
try { cloudflared = require('cloudflared') } catch (_) {}

let liveUrl = '', tunnelPromise = null

const getTunnelUrl = () =>
  (process.env.RENDER_EXTERNAL_URL || process.env.BASE_URL || liveUrl || '').replace(/\/$/, '')

function startTunnel(port = 8000) {
  const existing = getTunnelUrl()
  if (existing) {
    console.log(`[Host URL] ${existing}`)
    return Promise.resolve(existing)
  }

  if (tunnelPromise) return tunnelPromise

  tunnelPromise = new Promise(ok => {
    try {
      const bin = cloudflared?.bin || path.join(__dirname, '../node_modules/cloudflared/bin/cloudflared.exe')
      const child = spawn(bin, ['tunnel', '--url', `http://localhost:${port}`])

      child.on('error', e => console.error('[CF Tunnel err]', e.message))

      const handle = d => {
        const match = d.toString().match(/https:\/\/[a-zA-Z0-9-]+\.trycloudflare\.com/i)
        if (match && !liveUrl) {
          process.env.BASE_URL = liveUrl = match[0]
          console.log(`[CF Tunnel] ${liveUrl}`)
          ok(liveUrl)
        }
      }

      child.stdout.on('data', handle)
      child.stderr.on('data', handle)

      setTimeout(() => {
        if (liveUrl) return ok(liveUrl)
        console.log('[CF Tunnel] Slow/Failed. Trying Tunnelmole...')
        try {
          const tm = spawn('npx', ['tunnelmole', `${port}`], { shell: true })
          tm.on('error', e => console.error('[Tunnelmole err]', e.message))
          const handleTm = d => {
            const match = d.toString().match(/https:\/\/[a-zA-Z0-9-]+\.tunnelmole\.net/i)
            if (match && !liveUrl) {
              process.env.BASE_URL = liveUrl = match[0]
              console.log(`[Tunnelmole] ${liveUrl}`)
              ok(liveUrl)
            }
          }
          tm.stdout.on('data', handleTm)
          tm.stderr.on('data', handleTm)
          setTimeout(() => !liveUrl && ok(getTunnelUrl()), 6000)
        } catch { ok(getTunnelUrl()) }
      }, 3000)
    } catch { ok(getTunnelUrl()) }
  })
  return tunnelPromise
}

module.exports = { startTunnel, getTunnelUrl }

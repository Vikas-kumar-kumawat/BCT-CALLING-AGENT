const path = require('path')
const { spawn } = require('child_process')
const cloudflared = require('cloudflared')

let liveUrl = ''
let tunnelPromise = null

function getTunnelUrl() {
  if (process.env.RENDER_EXTERNAL_URL) return process.env.RENDER_EXTERNAL_URL.replace(/\/$/, '')
  if (process.env.BASE_URL) return process.env.BASE_URL.replace(/\/$/, '')
  return liveUrl ? liveUrl.replace(/\/$/, '') : ''
}

function startTunnel(port = 8000) {
  const existingUrl = getTunnelUrl()
  if (existingUrl) {
    console.log(`[Production Host URL] Using environment URL: ${existingUrl}`)
    return Promise.resolve(existingUrl)
  }

  if (tunnelPromise) return tunnelPromise

  tunnelPromise = new Promise((resolve) => {
    try {
      const binPath = cloudflared.bin || path.join(__dirname, '../node_modules/cloudflared/bin/cloudflared.exe')
      const child = spawn(binPath, ['tunnel', '--url', `http://localhost:${port}`])

      child.on('error', (err) => console.error('[Cloudflare Tunnel error]', err.message))

      const handleData = (d) => {
        const text = d.toString()
        const match = text.match(/https:\/\/[a-zA-Z0-9-]+\.trycloudflare\.com/i)
        if (match && !liveUrl) {
          liveUrl = match[0]
          process.env.BASE_URL = liveUrl
          console.log(`[Cloudflare Tunnel] Live HTTPS URL: ${liveUrl}`)
          resolve(liveUrl)
        }
      }

      child.stdout.on('data', handleData)
      child.stderr.on('data', handleData)

      setTimeout(() => {
        if (!liveUrl) {
          console.log('[Cloudflare Tunnel] Rate limited or slow. Falling back to Tunnelmole...')
          try {
            const tmChild = spawn('npx', ['tunnelmole', `${port}`], { shell: true })
            tmChild.on('error', (err) => console.error('[Tunnelmole error]', err.message))

            const handleTmData = (d) => {
              const text = d.toString()
              const match = text.match(/https:\/\/[a-zA-Z0-9-]+\.tunnelmole\.net/i)
              if (match && !liveUrl) {
                liveUrl = match[0]
                process.env.BASE_URL = liveUrl
                console.log(`[Tunnelmole Fallback] Live HTTPS URL: ${liveUrl}`)
                resolve(liveUrl)
              }
            }
            tmChild.stdout.on('data', handleTmData)
            tmChild.stderr.on('data', handleTmData)

            setTimeout(() => {
              if (!liveUrl) resolve(getTunnelUrl())
            }, 6000)
          } catch (e) {
            resolve(getTunnelUrl())
          }
        } else {
          resolve(liveUrl || getTunnelUrl())
        }
      }, 3000)
    } catch (err) {
      console.error('[Tunnel Error]', err)
      resolve(getTunnelUrl())
    }
  })

  return tunnelPromise
}

module.exports = { startTunnel, getTunnelUrl }

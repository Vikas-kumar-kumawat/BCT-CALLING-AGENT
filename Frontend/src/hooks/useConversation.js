import { useState, useEffect, useRef } from 'react'
import { getApiUrl } from '../api'

export function useConversation(endpoint = '/api/feedbackcalls/logs') {
  const [logs, setLogs] = useState([])
  const [displayedTextMap, setDisplayedTextMap] = useState({})
  const animatedLogIdsRef = useRef(new Set())

  const fetchLogs = async () => {
    try {
      const res = await fetch(getApiUrl(endpoint))
      const data = await res.json()
      if (data.success && data.logs) setLogs(data.logs)
    } catch (err) {
      console.error('Fetch error:', err)
    }
  }

  useEffect(() => {
    fetchLogs()
    const interval = setInterval(fetchLogs, 1000)
    return () => clearInterval(interval)
  }, [endpoint])

  useEffect(() => {
    logs.forEach((log) => {
      const logId = log.id || log.text
      if (animatedLogIdsRef.current.has(logId)) return

      animatedLogIdsRef.current.add(logId)
      const fullText = log.text || ''
      const words = fullText.split(' ')
      let currentWordIndex = 0

      const timer = setInterval(() => {
        currentWordIndex++
        setDisplayedTextMap((prev) => ({
          ...prev,
          [logId]: words.slice(0, currentWordIndex).join(' ')
        }))
        if (currentWordIndex >= words.length) clearInterval(timer)
      }, 70)
    })
  }, [logs])

  return { logs, displayedTextMap, fetchLogs }
}

// Centralized API configuration helper for Render production & local dev
const API_BASE = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '')

export function getApiUrl(endpoint) {
  if (!endpoint.startsWith('/')) {
    endpoint = '/' + endpoint
  }
  return `${API_BASE}${endpoint}`
}

import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Token ${token}`
  }
  return config
})

export function getApiError(err, fallback = 'Something went wrong. Please try again.') {
  const data = err?.response?.data
  if (!data) return fallback
  if (typeof data.error === 'string') return data.error
  if (typeof data.detail === 'string') return data.detail
  if (typeof data === 'object') {
    const firstKey = Object.keys(data)[0]
    const firstVal = data[firstKey]
    if (Array.isArray(firstVal) && firstVal.length > 0) {
      return `${firstKey}: ${firstVal[0]}`
    }
    if (typeof firstVal === 'string') return firstVal
  }
  return fallback
}

export function getAvatarFallback(name = 'User') {
  const initials = encodeURIComponent(name.trim() || 'User')
  return `https://ui-avatars.com/api/?name=${initials}&background=008080&color=ffffff&bold=true`
}

export function formatRelativeTime(isoDate) {
  if (!isoDate) return ''
  const diffMs = Date.now() - new Date(isoDate).getTime()
  const mins = Math.floor(diffMs / 60000)
  if (mins < 1) return 'Just now'
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d ago`
  return new Date(isoDate).toLocaleDateString()
}

export default api

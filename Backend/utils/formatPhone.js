function formatPhoneNumber(phone = '') {
  const cleaned = phone.toString().replace(/[^\d+]/g, '')
  if (!cleaned) return ''

  if (cleaned.startsWith('+')) return cleaned
  if (cleaned.startsWith('0') && cleaned.length === 11) return `+91${cleaned.slice(1)}`
  return `+91${cleaned}`
}

module.exports = { formatPhoneNumber }

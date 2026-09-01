const GREETING = 'Hello sir, main Bct Fibernet se baat kar raha hu Feedback ke regarding call tha aapka internet kaisa chal raha hai?'
const THANK_YOU = 'Aapka feedback dene ke liye dhanyawad'

// Swarvam-specific voice presets (placeholder IDs - replace with real Swarvam voice IDs)
const SWARVAM_PRESETS = {
	rajasthani: process.env.SWARVAM_VOICE_RAJ || 'rajasthani_male',
	marwadi: process.env.SWARVAM_VOICE_MAR || 'marwadi_male',
	default: process.env.SWARVAM_VOICE_DEFAULT || 'rajasthani_male'
}

// Swarvam voice selection: env SWARVAM_VOICE or preset SWARVAM_VOICE_PRESET
const swPreset = (process.env.SWARVAM_VOICE_PRESET || 'rajasthani').toLowerCase()
const SWARVAM_VOICE_ID = process.env.SWARVAM_VOICE || SWARVAM_PRESETS[swPreset] || SWARVAM_PRESETS.default

// Optional rate/speed for Swarvam TTS (provider-specific semantics)
const SWARVAM_RATE = parseFloat(process.env.SWARVAM_RATE) || 1.00

module.exports = { GREETING, THANK_YOU, SWARVAM_PRESETS, SWARVAM_VOICE_ID, SWARVAM_RATE }

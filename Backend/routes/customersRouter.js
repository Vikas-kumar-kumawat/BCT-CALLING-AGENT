const router   = require('express').Router()
const supabase  = require('../config/supabase')

router.get('/', async (req, res) => {
  const { data, error } = await supabase.from('customers').select('*').order('created_at', { ascending: false })
  if (error) return res.status(500).json({ error: error.message })
  res.json(data || [])
})

router.post('/', async (req, res) => {
  const { name, phone, feedback } = req.body
  const { data, error } = await supabase.from('customers')
    .insert([{ name, 'mobile-number': phone, feedback }]).select()
  if (error) return res.status(500).json({ error: error.message })
  res.json(data?.[0] || { success: true })
})

router.delete('/:id', async (req, res) => {
  const { error } = await supabase.from('customers').delete().eq('id', req.params.id)
  if (error) return res.status(500).json({ error: error.message })
  res.json({ success: true })
})

module.exports = router

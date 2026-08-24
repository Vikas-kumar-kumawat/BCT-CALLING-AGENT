const express = require('express')
const router = express.Router()
const supabase = require('../config/supabase')

// GET all customers
router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    res.json(data || [])
  } catch (error) {
    console.error('Error fetching customers:', error)
    res.status(500).json({ error: error.message })
  }
})

// POST a new customer
router.post('/', async (req, res) => {
  const { name, phone, feedback } = req.body
  try {
    const { data, error } = await supabase
      .from('customers')
      .insert([
        { name, 'mobile-number': phone, feedback }
      ])
      .select()

    if (error) throw error
    res.json(data && data.length > 0 ? data[0] : { success: true })
  } catch (error) {
    console.error('Error adding customer:', error)
    res.status(500).json({ error: error.message })
  }
})

// DELETE a customer
router.delete('/:id', async (req, res) => {
  const { id } = req.params
  try {
    const { data, error } = await supabase
      .from('customers')
      .delete()
      .eq('id', id)

    if (error) throw error
    res.json({ success: true })
  } catch (error) {
    console.error('Error deleting customer:', error)
    res.status(500).json({ error: error.message })
  }
})

module.exports = router

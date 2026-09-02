const path = require('path')
require('dotenv').config({ path: path.join(__dirname, '../.env') })
module.exports = require('@supabase/supabase-js').createClient(
  process.env.SUPABASE_URL || 'https://beezfkzujazusbuetedk.supabase.co',
  process.env.SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_o0WX0t2TJreubwSNAT9IAw_fSscAgHC'
)
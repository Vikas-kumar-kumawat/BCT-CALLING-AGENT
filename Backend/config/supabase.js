require('dotenv').config()
module.exports = require('@supabase/supabase-js').createClient(process.env.SUPABASE_URL, process.env.SUPABASE_PUBLISHABLE_KEY)
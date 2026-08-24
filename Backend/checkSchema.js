const supabase = require('./config/supabase')

async function checkSchema() {
  const { data, error } = await supabase.from('customers').select('*').limit(1)
  if (error) {
    console.error(error)
  } else {
    console.log(data)
  }
  process.exit(0)
}

checkSchema()

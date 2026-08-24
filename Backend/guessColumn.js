const supabase = require('./config/supabase')

async function guessColumn() {
  const possibleNames = [
    'mobile_numbre',
    'mobile-number',
    'mobilenumber',
    'mobile',
    'phone',
    'phone_number',
    'mobile_no',
    'mobile-no'
  ]

  for (const name of possibleNames) {
    console.log(`Trying ${name}...`)
    const { data, error } = await supabase
      .from('customers')
      .insert([{ name: 'Test', [name]: '123', feedback: 'test' }])
    
    if (error) {
      if (error.message.includes('Could not find the')) {
        continue
      } else {
        console.log(`Error with ${name}: ${error.message}`)
        if (error.message.includes('null value in column')) {
             console.log(`Wait, it failed on a different column!`)
        }
      }
    } else {
      console.log(`SUCCESS! The column is ${name}`)
      // Delete the test row
      await supabase.from('customers').delete().eq('name', 'Test')
      process.exit(0)
    }
  }
  console.log('None worked.')
  process.exit(1)
}

guessColumn()

const supabase = require('./config/supabase')

const seedData = [
  { name: 'Rahul Sharma', 'mobile-number': '9876543210', feedback: 'Happy with speed, but connection drops occasionally.' },
  { name: 'Priya Patel', 'mobile-number': '9123456789', feedback: 'Excellent service, no issues with broadband.' },
  { name: 'Amit Kumar', 'mobile-number': '9988776655', feedback: 'Router installation was delayed last time.' },
  { name: 'Neha Gupta', 'mobile-number': '9191919191', feedback: 'Needs upgrading to 500Mbps plan soon.' },
  { name: 'Sanjay Verma', 'mobile-number': '9000000000', feedback: 'Customer service was very helpful over the weekend.' }
]

async function seed() {
  console.log('Seeding 5 dummy customers...')
  try {
    const { data, error } = await supabase
      .from('customers')
      .insert(seedData)
      .select()

    if (error) {
      console.error('Error inserting data:', error.message)
      process.exit(1)
    }

    console.log('Successfully inserted data:', data.length, 'records')
    process.exit(0)
  } catch (err) {
    console.error('Exception during seeding:', err.message)
    process.exit(1)
  }
}

seed()

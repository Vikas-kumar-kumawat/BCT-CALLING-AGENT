const supabase = require('./config/supabase')

async function testInsert() {
  console.log("Testing insert...")
  const { data, error } = await supabase
    .from('customers')
    .insert([
      { name: 'Test', 'mobile-numbre': '123', feedback: 'test' }
    ])
    .select()

  if (error) {
    console.error("Error inserting with mobile-numbre:", error.message)
  } else {
    console.log("Success with mobile-numbre:", data)
    await supabase.from('customers').delete().eq('name', 'Test')
  }

  const { data2, error2 } = await supabase
    .from('customers')
    .insert([
      { name: 'Test', 'mobile-number': '123', feedback: 'test' }
    ])
    .select()

  if (error2) {
    console.error("Error inserting with mobile-number:", error2.message)
  } else {
    console.log("Success with mobile-number:", data2)
    await supabase.from('customers').delete().eq('name', 'Test')
  }
}

testInsert()

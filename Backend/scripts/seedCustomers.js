require('dotenv').config({ path: require('path').join(__dirname, '../.env') })
const supabase = require('../config/supabase')

const seedData = [
  { name: 'Vikas Kumawat', 'mobile-number': '9057262630', feedback: 'Excellent fiber speed, no issues.' },
  { name: 'Rahul Sharma', 'mobile-number': '9876543210', feedback: 'Happy with speed, connection drops occasionally.' },
  { name: 'Priya Patel', 'mobile-number': '9123456789', feedback: 'Excellent service, no issues with broadband.' },
  { name: 'Amit Kumar', 'mobile-number': '9988776655', feedback: 'Router installation was delayed last time.' },
  { name: 'Neha Gupta', 'mobile-number': '9191919191', feedback: 'Needs upgrading to 500Mbps plan soon.' },
  { name: 'Sanjay Verma', 'mobile-number': '9000000000', feedback: 'Customer service was very helpful over the weekend.' },
  { name: 'Ananya Roy', 'mobile-number': '9823011223', feedback: 'Billing query regarding last month invoice.' },
  { name: 'Rajesh Kumar', 'mobile-number': '9711223344', feedback: 'High latency during gaming in peak hours.' },
  { name: 'Sneha Reddy', 'mobile-number': '9650012345', feedback: 'Requested static IP assignment.' },
  { name: 'Rohan Verma', 'mobile-number': '9540098765', feedback: 'Inquired about annual plan discount options.' },
  { name: 'Pooja Singh', 'mobile-number': '9810987654', feedback: 'Relocation request to new address.' },
  { name: 'Vikram Malhotra', 'mobile-number': '9999888777', feedback: 'Wi-Fi range issue in bedroom area.' },
  { name: 'Kavita Joshi', 'mobile-number': '9871122334', feedback: 'Payment debited twice, needs refund support.' },
  { name: 'Deepak Gupta', 'mobile-number': '9760011223', feedback: 'Interested in IPTV add-on package.' },
  { name: 'Swati Nair', 'mobile-number': '9654321098', feedback: 'Router restart resolves daily dropouts.' },
  { name: 'Manish Choudhary', 'mobile-number': '9899001122', feedback: 'Requesting fiber cable re-routing outside home.' },
  { name: 'Neha Saxena', 'mobile-number': '9718877665', feedback: 'Upgrade to Gigabit Ethernet setup required.' },
  { name: 'Suresh Rao', 'mobile-number': '9611223344', feedback: 'Renewal reminder sent via SMS received.' },
  { name: 'Meera Iyer', 'mobile-number': '9500112233', feedback: 'Customer support representative resolved ticket quickly.' },
  { name: 'Sandeep Bhatia', 'mobile-number': '9888776655', feedback: 'Outstanding stability during remote working hours.' },
  { name: 'Arjun Kapoor', 'mobile-number': '9789012345', feedback: 'Inquired about fiber speed test inconsistency.' },
  { name: 'Riya Sen', 'mobile-number': '9678901234', feedback: 'Wants to pause subscription during vacations.' },
  { name: 'Tarun Gill', 'mobile-number': '9567890123', feedback: 'ONT device blinking red LED indicator.' },
  { name: 'Ishita Das', 'mobile-number': '9456789012', feedback: 'Requested dual-band Wi-Fi 6 router upgrade.' },
  { name: 'Gaurav Sethi', 'mobile-number': '9345678901', feedback: 'Payment received acknowledgement pending.' },
  { name: 'Divya Pillai', 'mobile-number': '9234567890', feedback: 'High satisfaction with customer executive call.' },
  { name: 'Kunal Bansal', 'mobile-number': '9123450987', feedback: 'Required invoice copy for company tax filing.' },
  { name: 'Simran Kaur', 'mobile-number': '9012345678', feedback: 'Speed test showing 200Mbps on 300Mbps plan.' },
  { name: 'Varun Mehra', 'mobile-number': '9987654321', feedback: 'Port forwarding configuration query.' },
  { name: 'Aarti Deshmukh', 'mobile-number': '9876501234', feedback: 'Excellent support during fiber cable cut incident.' }
]

async function seed() {
  console.log('Seeding 30 dummy customers...')
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

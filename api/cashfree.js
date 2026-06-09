export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', 'https://nexoraa.store');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { orderId, amount, customerName, customerPhone, customerEmail } = req.body;

    if (!orderId || !amount || !customerName || !customerPhone) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const CF_APP_ID = process.env.CASHFREE_APP_ID;
    const CF_SECRET = process.env.CASHFREE_SECRET_KEY;

    const response = await fetch('https://api.cashfree.com/pg/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-version': '2023-08-01',
        'x-client-id': CF_APP_ID,
        'x-client-secret': CF_SECRET,
      },
      body: JSON.stringify({
        order_id: orderId,
        order_amount: Number(amount),
        order_currency: 'INR',
        customer_details: {
          customer_id: 'cust_' + orderId,
          customer_name: customerName,
          customer_phone: customerPhone,
          customer_email: customerEmail || 'customer@nexoraa.store',
        },
        order_meta: {
          return_url: `https://nexoraa.store/?order=${orderId}&cf_order_id={order_id}&payment_status={payment_status}`,
        },
        order_note: 'NEXORAA Order - ' + orderId,
      }),
    });

    const data = await response.json();

    if (!data.payment_session_id) {
      console.error('Cashfree error:', data);
      return res.status(500).json({ error: data.message || 'Payment gateway error' });
    }

    return res.status(200).json({
      payment_session_id: data.payment_session_id,
      cf_order_id: data.cf_order_id || data.order_id,
    });

  } catch (err) {
    console.error('Server error:', err.message);
    return res.status(500).json({ error: 'Internal server error' }
                               );
  }
}

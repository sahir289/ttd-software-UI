import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { 
      merchantTransactionId, 
      amount, 
      payment_for, 
      customer_email, 
      customer_phone,
      callback_url 
    } = body;
    
    // In production, fallback to process.env.PAYASIAN_MID 
    const MID = process.env.PAYASIAN_MID;
    
    if (!MID) {
      return NextResponse.json({ success: false, message: 'Server configuration error: Missing MID' }, { status: 500 });
    }

    const payload = {
      merchantTransactionId,
      amount: amount,
      payment_for: (payment_for || "Order Payment").replace(/[^a-zA-Z0-9\s]/g, ""),
      payment_mode: "INTENT",
      callback_url: callback_url || "https://yourdomain.com/api/payment/webhook",
      customer_details: {
        customer_email: customer_email || "example@test.com",
        customer_phone: customer_phone || "9999999999"
      }
    };

    const response = await fetch('https://payments.payasian.in/api/Payment/CreateOrder', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': MID
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (data.success) {
      return NextResponse.json(data);
    } else {
      return NextResponse.json(data, { status: 400 });
    }
  } catch (error) {
    console.error("Payment creation error:", error);
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}

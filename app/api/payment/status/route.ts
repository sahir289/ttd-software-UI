import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const order_id = searchParams.get('order_id');
    
    if (!order_id) {
      return NextResponse.json({ success: false, message: 'order_id is required' }, { status: 400 });
    }

    const MID = process.env.PAYASIAN_MID;
    
    if (!MID) {
      return NextResponse.json({ success: false, message: 'Server configuration error: Missing MID' }, { status: 500 });
    }

    const response = await fetch(`https://payments.payasian.in/api/Payment/CheckStatus?order_id=${order_id}`, {
      method: 'POST', // The Postman collection showed POST for check status
      headers: {
        'x-api-key': MID
      }
    });

    const data = await response.json();

    if (data.success && data.data) {
      return NextResponse.json(data);
    } else {
      return NextResponse.json(data, { status: 400 });
    }
  } catch (error) {
    console.error("Status check error:", error);
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}

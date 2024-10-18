import { NextResponse } from "next/server";
import { doc, updateDoc } from "firebase/firestore";
import db from "../utils/firestore";

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

export async function POST(request) {
  const body = await request.text();
  const sig = request.headers.get("stripe-signature");

  let event;

  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error("Webhook signature verification failed:", err.message);
    return NextResponse.json({ error: err.message }, { status: 400 });
  }

  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object;
      
      const orderId = session.metadata.orderId;
      
      if (orderId) {
        try {
          await updateDoc(doc(db, "payments", orderId), {
            payment_status: "paid",
            updatedAt: new Date()
          });
          console.log(`Payment status updated for order ${orderId}`);
        } catch (error) {
          console.error(`Error updating payment status for order ${orderId}:`, error);
        }
      } else {
        console.error('No orderId found in session metadata');
      }
      break;
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  return NextResponse.json({ received: true });
}
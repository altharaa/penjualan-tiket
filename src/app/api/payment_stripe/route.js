import { NextResponse } from "next/server";
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

export async function POST(request) {
    console.log("API route hit");
    try {
        const body = await request.json();
        console.log("Received request data:", body);

        const {orderId, fullName, email, phoneNumber, amount, productName} = body;

        if (!orderId || !amount) {
            return NextResponse.json(
              { error: "Missing required fields" },
              { status: 400 }
            );
        }

        const session = await stripe.checkout.sessions.create({
            metadata: {
                orderId: orderId,  
              },
            line_items: [
                {
                    price_data: {
                        currency: "usd",
                        product_data: {
                            name: productName,
                        },
                        unit_amount: amount * 100,
                    },
                    quantity: 1,
                },
            ],
            mode: "payment",
            success_url: `${process.env.BASE_URL}/#/success-payment?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.BASE_URL}/#/success-payment`,
        })
        console.log("Stripe session created:", session);
        return NextResponse.json({ sessionId: session.id });
    } catch (error) {
        console.error("Stripe error:", error.message);
        return NextResponse.json({ error: "Transaction generation failed" }, { status: 500});
    }
}
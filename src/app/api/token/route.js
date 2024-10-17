import { product } from "@/libs/product";
import Midtrans from "midtrans-client";
import { NextResponse } from "next/server";

let snap = new Midtrans.Snap({
    isProduction: false,
    serverKey: process.env.NEXT_PUBLIC_SERVER_KEY,
    clientKey: process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY,
});

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

        const parameter = {
            transaction_details: {
                order_id: orderId,
                product: productName,
                gross_amount: amount,
            },
            credit_card: {
                secure: true,
            },
            customer_details: {
                first_name: fullName,
                email: email,
                phone: phoneNumber,
            },
        }
        console.log("Requesting Midtrans token with params:", parameter);

        const token = await snap.createTransactionToken(parameter);
        console.log("Received token:", token); 
    
        return NextResponse.json({ token });
    } catch (error) {
        console.error("Midtrans error:", error.message);
        return NextResponse.json({ error: "Transaction token generation failed" }, { status: 500 });   
    }
}
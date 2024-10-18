import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { loadStripe } from "@stripe/stripe-js";
import { doc, setDoc } from "firebase/firestore";  
import db from "../utils/firestore";

if(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY === undefined) {
    throw new Error("NEXT_PUBLIC_STRIPE_PUBLIC_KEY is undefined");
}

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY);

const CheckoutConfirmation = () => {
    const location = useLocation();
    const { orderData } = location.state || {};

    const [loading, setLoading] = useState(false);
    
    const handleSubmit = async (event) => {
        event.preventDefault();
        setLoading(true);

        try {
            const response = await fetch("/api/payment_stripe", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(orderData),
            });
            
            const data = await response.json();
            if (data.sessionId) {
                await setDoc(doc(db, "payments", orderData.orderId), {
                    ...orderData,
                    payment_status: "unpaid", 
                    createdAt: new Date()
                });

                const stripe = await stripePromise;
                const result = await stripe.redirectToCheckout({ sessionId: data.sessionId });
                if (result.error) {
                    console.error(result.error.message);
                }
            } else {
                console.error("No sessionId returned from API");
            }
            
            if (data.error) {
                console.error("Payment initiation failed:", data.error);
                setLoading(false);
                return;
            }
        } catch (error) {
            console.error("Error in checkout:", error);
            setLoading(false);
        }
    }

    return (
         <main>
            <h2 className="m-10 text-center" >Checkout Confirmation</h2>
            {orderData ? (
                <div className='m-10'>
                    <p>Order ID: {orderData.orderId}</p>
                    <p>Product: {orderData.productName}</p>
                    <p>Name: {orderData.fullName}</p>
                    <p>Email: {orderData.email}</p>
                    <p>Phone: {orderData.phoneNumber}</p>
                    <p>Amount: $ {orderData.amount.toLocaleString()}</p>
                    <button 
                        onClick={handleSubmit} 
                        className='mt-10 btn btn-primary'
                        disabled={loading}
                    >
                        {loading ? "Processing..." : "Checkout"}
                    </button>                
                </div>
            ) : (
                <p className='text-center'>No order data found</p>
            )}
        </main>
    );
};

export default CheckoutConfirmation;

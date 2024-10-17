import Link from 'next/link';
import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';

const CheckoutConfirmation = () => {
    const location = useLocation();
    const { orderData, paymentToken } = location.state || {};
    const [ paymentLink, setPaymentLink ] = useState("");

    const handlePayment = () => {
        window.snap.pay(paymentToken, {
            onSuccess: async (result) => {
                console.log('Payment success');                
                try {
                    const orderId = orderData.orderId; 
                    const orderRef = doc(db, "orders", orderId);
                    await updateDoc(orderRef, { transaction_status: "success" });
                } catch (error) {
                    console.error("Failed to update payment status:", error);
                    alert("Error updating payment status.");
                }
            },
            onPending: (result) => {
                console.log('Payment pending', result);
                alert('Payment pending');
            },
            onError: (result) => {
                console.error('Payment error', result);
                alert('Payment failed');
            },
        });
    };

    const generatePaymentLink = async () => {
        const secret = process.env.NEXT_PUBLIC_SERVER_KEY;
        const apiURL = process.env.NEXT_PUBLIC_API;

        const encodedSecret = Buffer.from(secret).toString('base64');
        const basicAuth = `Basic ${encodedSecret}`;

        let data = {
            item_detalis: [
                {
                    id: orderData.orderId,
                    name: orderData.productName,
                    price: orderData.amount,
                }
            ],
            transaction_details: {
                order_id: orderData.orderId,
                gross_amount: orderData.amount,
            },
            customer_details: {
                first_name: orderData.fullName,
                email: orderData.email,
                phone: orderData.phoneNumber,
            }
        };

        try {
            const response = await fetch(`${apiURL}/v1/payment-links`, {
                method: 'POST',
                headers: {
                    "Accept": "application/json",
                    "Content-Type": "application/json",
                    "Authorization": basicAuth
                },
                body: JSON.stringify(data),
            });

            const paymentLink = await response.json();
            console.log('Payment link:', paymentLink);
            setPaymentLink(paymentLink.payment_url);
        } catch (error) {
            console.error('Error generating payment link:', error);
        }
    };

    return (
        <div>
            <h2 className="m-10 text-center" >Checkout Confirmation</h2>
            {orderData ? (
                <div className='m-10'>
                    <p>Order ID: {orderData.orderId}</p>
                    <p>Product: {orderData.productName}</p>
                    <p>Name: {orderData.fullName}</p>
                    <p>Email: {orderData.email}</p>
                    <p>Phone: {orderData.phoneNumber}</p>
                    <p>Amount: Rp {orderData.amount.toLocaleString()}</p>
                    <button onClick={handlePayment} className="mt-10 btn btn-primary">
                        Proceed with Payment
                    </button>
                    {!paymentLink ? (
                        <p 
                            className="mt-2 text-center text-indigo-500 py-4 text-sm font-medium transition hover:scale-105"
                            onClick={generatePaymentLink}
                        >
                            Create Payment Link
                        </p>
                    ) : (
                        <div className="flex justify-center items-center h-100">
                            <Link
                                className="text-indigo-500 py-4 text-sm font-medium transition hover:scale-105"
                                href={paymentLink}
                                // target="_blank"
                            >
                                Click Here To Pay
                            </Link>
                        </div>
                    )}
                </div>
            ) : (
                <p className='text-center'>No order data found</p>
            )}
        </div>
    );
};

export default CheckoutConfirmation;

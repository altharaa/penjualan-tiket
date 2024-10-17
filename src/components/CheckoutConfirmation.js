import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const CheckoutConfirmation = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { orderData, paymentToken } = location.state || {};


    const handlePayment = () => {
        window.snap.pay(paymentToken, {
            onSuccess: async (result) => {
                console.log('Payment success', result);
                alert('Payment successful');
                
                try {
                    const orderId = orderData.orderId; 
    
                    const orderRef = doc(db, "orders", orderId);
                    await updateDoc(orderRef, { status: "success" });
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
                </div>
            ) : (
                <p>No order data found</p>
            )}
        </div>
    );
};

export default CheckoutConfirmation;

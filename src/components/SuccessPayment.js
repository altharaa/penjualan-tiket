import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { doc, getDoc, updateDoc } from "firebase/firestore";
import db from "../utils/firestore";
import { loadStripe } from "@stripe/stripe-js";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY);

const SuccessPayment = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [paymentDetails, setPaymentDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        const sessionId = searchParams.get('session_id');
        
        const response = await fetch('/api/verify_payment', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ sessionId }),
        });

        const data = await response.json();
        
        if (data.success) {
          console.log('Payment verification successful:', data);
          
          const paymentDoc = await getDoc(doc(db, "payments", data.orderId));
          
          if (paymentDoc.exists()) {
            const paymentData = paymentDoc.data();
            
            await updateDoc(doc(db, "payments", data.orderId), {
              payment_status: "paid",
              paymentConfirmedAt: new Date(),
              stripeSessionId: sessionId,
              ...data.paymentDetails 
            });

            setPaymentDetails({
              ...paymentData,
              ...data.paymentDetails
            });
          }
        } else {
          throw new Error(data.error || 'Payment verification failed');
        }
      } catch (err) {
        console.error('Error verifying payment:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    verifyPayment();
  }, [searchParams]);

  if (loading) {
    return (
      <div className="m-10 text-center">
        <h2>Verifying Payment...</h2>
      </div>
    );
  }

  if (error) {
    return (
      <div className="m-10 text-center">
        <h2>Payment Verification Failed</h2>
        <p className="text-red-500 mt-4">{error}</p>
        <button 
          onClick={() => navigate("/")} 
          className="mt-10 btn btn-primary"
        >
          Return to Home
        </button>
      </div>
    );
  }

  return (
    <div className="m-10">
      <h2 className="text-center text-2xl font-bold text-green-600">
        Payment Successful
      </h2>
      
      {paymentDetails && (
        <div className="mt-6 p-6 bg-gray-50 rounded-lg">
          <h3 className="font-semibold mb-4">Order Details:</h3>
          <div className="space-y-2">
            <p>Order ID: {paymentDetails.orderId}</p>
            <p>Product: {paymentDetails.productName}</p>
            <p>Amount: ${paymentDetails.amount?.toLocaleString()}</p>
            <p>Status: {paymentDetails.payment_status}</p>
            <p>Date: {paymentDetails.paymentConfirmedAt?.toDate().toLocaleString()}</p>
          </div>
        </div>
      )}

      <button 
        onClick={() => navigate("/")} 
        className="mt-10 btn btn-primary"
      >
        Return to Home
      </button>
    </div>
  );
};

export default SuccessPayment;
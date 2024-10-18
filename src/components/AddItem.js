import { useState } from "react";
import { collection, addDoc } from "firebase/firestore"; 
import db from "../utils/firestore"; 
import { useLocation } from "react-router-dom";

const AddItem = () => {
    const location = useLocation();
    const { amount, productName } = location.state;

    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [error, setError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const generateOrderId = () => {
        return `order_${Math.random().toString(36).substr(2, 9)}`;
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setIsSubmitting(true);
        setError("");
    
        try {
            const orderId = generateOrderId();
            const orderData = {
                orderId,
                fullName,
                email,
                amount,
                productName,
            };

            const saveToFirebase = async (orderData) => {
                try {
                    const docRef = await addDoc(collection(db, "payments"), orderData);
                    return docRef.id;
                } catch (error) {
                    throw new Error(`Firebase save failed: ${error.message}`);
                }
            };
    
            const response = await fetch('/api/payment', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(orderData),
            });
    
            const data = await response.json();
            if (data.invoice_url) {
                window.location.href = data.invoice_url;
            } else {
                throw new Error("Invoice creation failed");
            }
        } catch (error) {
            setError(error.message);
            console.error("Transaction failed:", error);
        } finally {
            setIsSubmitting(false);
        }
    };
    

    return (
        <>
            <h2 className="m-10 text-center">Form Pemesanan Tiket</h2>
            <form onSubmit={handleSubmit} className="m-10">
                {error && (
                    <div className="bg-red-50 p-4 rounded-md">
                        <p className="text-red-700">{error}</p>
                    </div>
                )}
                <label htmlFor="name">Full Name</label>
                <input
                    id="name"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Enter full name"
                    disabled={isSubmitting}
                />
                <label htmlFor="email">Email</label>
                <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter email"
                    disabled={isSubmitting}
                />
                <label htmlFor="phone">Phone Number</label>
                <input
                    id="phone"
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="Enter phone number"
                    disabled={isSubmitting}
                />
                <button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Processing..." : "Checkout"}
                </button>
            </form>
        </>
    );
};

export default AddItem;

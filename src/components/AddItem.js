import { useState } from "react";
import { collection, addDoc } from "firebase/firestore"; 
import db from "../utils/firestore"; 
import { useNavigate, useLocation } from "react-router-dom";

const AddItem = () => {
    const navigate = useNavigate();
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

    const createCheckoutToken = async (orderData) => {
        try {
        const response = await fetch("/api/token", {
            method: "POST",
            headers: {
            "Content-Type": "application/json",
            },
            body: JSON.stringify(orderData),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const requestData = await response.json();

        if (!requestData.token) {
            throw new Error("No token received from payment gateway");
        }

        return requestData;  
        } catch (error) {
        throw new Error(`Checkout token creation failed: ${error.message}`);
        }
    };

    const saveToFirebase = async (orderData) => {
        try {
            const docRef = await addDoc(collection(db, "orders"), orderData);
            return docRef.id;
        } catch (error) {
            throw new Error(`Firebase save failed: ${error.message}`);
        }
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setIsSubmitting(true);
        setError("");

        try {
        if (!fullName || !email || !phoneNumber) {
            throw new Error("All fields must be filled.");
        }

        const orderId = generateOrderId();

        const orderData = {
            orderId,
            fullName,
            email,
            phoneNumber,
            amount,
            productName,
            status: 'pending',
            createdAt: new Date().toISOString(),
        };

        const checkoutResponse = await createCheckoutToken(orderData);

        if (!checkoutResponse.token) {
            throw new Error("Failed to generate payment token");
        }

        const firestoreId = await saveToFirebase({
            ...orderData,
            paymentToken: checkoutResponse.token,
        });

        setFullName("");
        setEmail("");
        setPhoneNumber("");
       
        navigate("/checkout", {
            state: {
              orderData,
              paymentToken: checkoutResponse.token,
            },
        });

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

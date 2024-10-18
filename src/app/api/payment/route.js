import { Invoice as InvoiceClient } from 'xendit-node';
import { NextResponse } from 'next/server';
import db from "../../../utils/firestore";
import { addDoc, collection, doc, updateDoc } from 'firebase/firestore';

const xenditInvoiceClient = new InvoiceClient({secretKey: process.env.XENDIT_API_KEY});

const saveToFirebase = async (orderData) => {
  try {
    const docRef = await addDoc(collection(db, "payments"), orderData);
    return docRef.id;
  } catch (error) {
    throw new Error(`Firebase save failed: ${error.message}`);
  }
};

const updatePaymentStatus = async (externalId, status) => {
  try {
    const paymentsRef = collection(db, "payments");
    const querySnapshot = await getDocs(query(paymentsRef, where("externalId", "==", externalId)));
    
    if (!querySnapshot.empty) {
      const docRef = doc(db, "payments", querySnapshot.docs[0].id);
      await updateDoc(docRef, { status: status });
      console.log(`Payment status updated for externalId: ${externalId}`);
    } else {
      console.log(`No matching document found for externalId: ${externalId}`);
    }
  } catch (error) {
    console.error(`Error updating payment status: ${error.message}`);
  }
};

export async function POST(request) {
  console.log("API route hit");
  
  if (request.headers.get('x-callback-token') === process.env.XENDIT_WEBHOOK_VERIFICATION_TOKEN) {
    try {
      const webhookData = await request.json();
      console.log("Received webhook data:", webhookData);
      
      await updatePaymentStatus(webhookData.external_id, webhookData.status);
      
      return NextResponse.json({ message: "Webhook processed successfully" }, { status: 200 });
    } catch (error) {
      console.error("Webhook processing error:", error.message);
      return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
    }
  }
  
  try {
    const body = await request.json();
    const { orderId, email, amount, productName } = body;
    
    const orderData = {
      externalId: orderId,
      payerEmail: email,
      description: `Payment for ${productName}`,
      amount: amount,
      shouldSendEmail: true,
      invoiceDuration: 300,
      currency: "IDR",
      reminderTimeUnit: "days",
      reminderTime: 1,
      items: [{
        name: productName,
        quantity: 1,
        price: amount
      }],
      paymentMethods: ['OVO', 'DANA', 'SHOPEEPAY', 'LINKAJA'],
      successRedirectUrl: 'https://4495-103-47-133-154.ngrok-free.app/#/success-payment'
    };
    
    console.log("Received request order data:", orderData);
    
    const invoice = await xenditInvoiceClient.createInvoice({
      data: orderData
    });
    
    console.log("Invoice created:", invoice);
    
    const orderDataWithInvoiceUrl = { ...orderData, invoiceUrl: invoice.invoiceUrl, status: 'PENDING' };
    const firestoreId = await saveToFirebase(orderDataWithInvoiceUrl);
    console.log(`Order data saved to Firebase with ID: ${firestoreId}`);
    
    return NextResponse.json({ invoice_url: invoice.invoiceUrl }, { status: 200 });
  } catch (error) {
    console.error("Xendit error:", error.response ? error.response.data : error.message);
    return NextResponse.json({ error: "Transaction generation failed" }, { status: 500 });
  }
}
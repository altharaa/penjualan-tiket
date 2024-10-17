"use client";
import { useEffect, useState } from "react";
import App from "../app";

export default function Home() {
  const [isSnapLoaded, setIsSnapLoaded] = useState(false);

  useEffect(() => {
    const snapScript = "https://app.sandbox.midtrans.com/snap/snap.js";
    const clientKey = process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY;

    const script = document.createElement("script");
    script.src = snapScript;
    script.setAttribute("data-client-key", clientKey);
    script.onload = () => {
      console.log("Snap loaded successfully");
      setIsSnapLoaded(true); 
    };
    script.async = true;

    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  if (!isSnapLoaded) {
    return <div>Loading Snap...</div>; 
  }

  return (
    <App />
  );
}
